import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-CRM] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { contactId, syncAll } = await req.json();

    let query = supabaseClient
      .from('crm_contacts')
      .select('*');

    if (contactId) {
      query = query.eq('id', contactId);
    } else if (!syncAll) {
      // Default: sync contacts that haven't been synced or are older than 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      query = query.or(`synced_at.is.null,synced_at.lt.${oneHourAgo}`);
    }

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
    }

    logStep("Contacts to sync", { count: contacts?.length || 0 });

    const hubspotApiKey = Deno.env.get("HUBSPOT_API_KEY");
    const crmWebhookUrl = Deno.env.get("CRM_WEBHOOK_URL");

    if (!hubspotApiKey && !crmWebhookUrl) {
      throw new Error("No CRM configuration found. Please set HUBSPOT_API_KEY or CRM_WEBHOOK_URL");
    }

    const syncResults = [];

    for (const contact of contacts || []) {
      try {
        logStep("Syncing contact", { contactId: contact.id, email: contact.email });

        let syncSuccess = false;
        let crmContactId = contact.crm_contact_id;

        // Try HubSpot API first if configured
        if (hubspotApiKey) {
          try {
            const hubspotData = {
              properties: {
                email: contact.email,
                firstname: contact.full_name?.split(' ')[0] || '',
                lastname: contact.full_name?.split(' ').slice(1).join(' ') || '',
                company: contact.company_name || '',
                phone: contact.phone || '',
                lifecyclestage: contact.lead_status || 'lead',
                lead_status: contact.lead_status || 'new',
                hs_lead_status: contact.lead_status || 'NEW',
                total_donations: contact.total_donations || 0,
                last_donation_date: contact.last_donation_date || '',
                source: contact.lead_source || 'website'
              }
            };

            let response;
            if (crmContactId) {
              // Update existing contact
              response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${crmContactId}`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${hubspotApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(hubspotData)
              });
            } else {
              // Create new contact
              response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${hubspotApiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(hubspotData)
              });
            }

            if (response.ok) {
              const hubspotContact = await response.json();
              crmContactId = hubspotContact.id;
              syncSuccess = true;
              logStep("HubSpot sync successful", { hubspotId: crmContactId });
            } else {
              const errorText = await response.text();
              logStep("HubSpot sync failed", { status: response.status, error: errorText });
            }
          } catch (hubspotError) {
            logStep("HubSpot API error", hubspotError);
          }
        }

        // Try webhook if HubSpot failed or isn't configured
        if (!syncSuccess && crmWebhookUrl) {
          try {
            const webhookData = {
              type: 'contact_sync',
              contact: {
                id: contact.id,
                email: contact.email,
                full_name: contact.full_name,
                company_name: contact.company_name,
                phone: contact.phone,
                lead_status: contact.lead_status,
                lead_source: contact.lead_source,
                total_donations: contact.total_donations,
                last_donation_date: contact.last_donation_date,
                crm_contact_id: crmContactId
              }
            };

            const webhookResponse = await fetch(crmWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(webhookData)
            });

            if (webhookResponse.ok) {
              syncSuccess = true;
              logStep("Webhook sync successful");
            } else {
              logStep("Webhook sync failed", { status: webhookResponse.status });
            }
          } catch (webhookError) {
            logStep("Webhook error", webhookError);
          }
        }

        // Update contact sync status
        if (syncSuccess) {
          await supabaseClient
            .from('crm_contacts')
            .update({
              crm_contact_id: crmContactId,
              synced_at: new Date().toISOString()
            })
            .eq('id', contact.id);
        }

        syncResults.push({
          contactId: contact.id,
          email: contact.email,
          success: syncSuccess,
          crmContactId
        });

      } catch (contactError) {
        logStep("Error syncing individual contact", { contactId: contact.id, error: contactError });
        syncResults.push({
          contactId: contact.id,
          email: contact.email,
          success: false,
          error: contactError.message
        });
      }
    }

    logStep("Sync completed", { 
      total: syncResults.length, 
      successful: syncResults.filter(r => r.success).length 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      results: syncResults,
      summary: {
        total: syncResults.length,
        successful: syncResults.filter(r => r.success).length,
        failed: syncResults.filter(r => !r.success).length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-crm", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});