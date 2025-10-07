import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-ZOHO] ${step}${detailsStr}`);
};

interface ZohoTokenResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}

interface InvestorProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  org_name: string | null;
  bio: string | null;
  sectors: string[] | null;
  ticket_min: number | null;
  ticket_max: number | null;
  region: string | null;
  verification_status: string;
  is_qualified: boolean;
  is_public: boolean;
  email?: string;
}

async function getZohoAccessToken(): Promise<{ accessToken: string; apiDomain: string }> {
  const clientId = Deno.env.get("ZOHO_CLIENT_ID");
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET");
  const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Zoho credentials");
  }

  const tokenUrl = `https://accounts.zoho.eu/oauth/v2/token?refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`;

  const response = await fetch(tokenUrl, { method: "POST" });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Zoho access token: ${error}`);
  }

  const data: ZohoTokenResponse = await response.json();
  return { accessToken: data.access_token, apiDomain: data.api_domain };
}

async function syncDbToZoho(supabaseClient: any, accessToken: string, apiDomain: string) {
  logStep("Starting DB → Zoho sync");

  // Get all investor profiles
  const { data: profiles, error: profilesError } = await supabaseClient
    .from('investor_profiles')
    .select(`
      *,
      profiles!inner(email, full_name)
    `);

  if (profilesError) {
    throw new Error(`Failed to fetch investor profiles: ${profilesError.message}`);
  }

  logStep("Profiles to sync", { count: profiles?.length || 0 });

  const results = [];

  for (const profile of profiles || []) {
    try {
      const email = profile.profiles?.email;
      if (!email) {
        logStep("Skipping profile without email", { profileId: profile.id });
        continue;
      }

      // Prepare Zoho contact data
      const zohoContact = {
        First_Name: profile.display_name?.split(' ')[0] || profile.profiles.full_name?.split(' ')[0] || '',
        Last_Name: profile.display_name?.split(' ').slice(1).join(' ') || profile.profiles.full_name?.split(' ').slice(1).join(' ') || 'Investor',
        Email: email,
        Account_Name: profile.org_name || '',
        Description: profile.bio || '',
        Lead_Source: 'Investor Platform',
        Contact_Type: 'Investor',
        Investor_Category: profile.verification_status,
        Ticket_Size_Min: profile.ticket_min || 0,
        Ticket_Size_Max: profile.ticket_max || 0,
        Region: profile.region || '',
        Sectors_of_Interest: (profile.sectors || []).join(', '),
        Is_Qualified: profile.is_qualified,
        Profile_Public: profile.is_public,
      };

      // Search for existing contact by email
      const searchUrl = `${apiDomain}/crm/v2/Contacts/search?email=${encodeURIComponent(email)}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
        },
      });

      let zohoContactId = null;
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.data && searchData.data.length > 0) {
          zohoContactId = searchData.data[0].id;
          logStep("Found existing Zoho contact", { email, zohoContactId });
        }
      }

      // Create or update contact
      const contactUrl = zohoContactId 
        ? `${apiDomain}/crm/v2/Contacts/${zohoContactId}`
        : `${apiDomain}/crm/v2/Contacts`;
      
      const contactResponse = await fetch(contactUrl, {
        method: zohoContactId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [zohoContact],
        }),
      });

      const contactResult = await contactResponse.json();
      
      if (contactResponse.ok && contactResult.data && contactResult.data[0].code === 'SUCCESS') {
        logStep(zohoContactId ? "Updated Zoho contact" : "Created Zoho contact", { 
          email, 
          zohoContactId: contactResult.data[0].details.id 
        });
        results.push({
          profileId: profile.id,
          email,
          success: true,
          action: zohoContactId ? 'updated' : 'created',
        });
      } else {
        throw new Error(`Zoho API error: ${JSON.stringify(contactResult)}`);
      }

    } catch (error) {
      logStep("Error syncing profile to Zoho", { profileId: profile.id, error: error.message });
      results.push({
        profileId: profile.id,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

async function syncZohoToDb(supabaseClient: any, accessToken: string, apiDomain: string) {
  logStep("Starting Zoho → DB sync");

  // Fetch contacts from Zoho CRM with Contact_Type = 'Investor'
  const contactsUrl = `${apiDomain}/crm/v2/Contacts?criteria=(Contact_Type:equals:Investor)`;
  const contactsResponse = await fetch(contactsUrl, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
    },
  });

  if (!contactsResponse.ok) {
    const error = await contactsResponse.text();
    throw new Error(`Failed to fetch Zoho contacts: ${error}`);
  }

  const contactsData = await contactsResponse.json();
  const contacts = contactsData.data || [];

  logStep("Zoho contacts to sync", { count: contacts.length });

  const results = [];

  for (const contact of contacts) {
    try {
      const email = contact.Email;
      if (!email) {
        logStep("Skipping contact without email", { contactId: contact.id });
        continue;
      }

      // Find or create user profile
      let { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Failed to check profile: ${profileError.message}`);
      }

      let userId = profile?.id;

      // Check if investor profile already exists
      const { data: existingInvestor } = await supabaseClient
        .from('investor_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      // Prepare investor profile data
      const investorData = {
        user_id: userId,
        display_name: `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim(),
        org_name: contact.Account_Name || null,
        bio: contact.Description || null,
        sectors: contact.Sectors_of_Interest ? contact.Sectors_of_Interest.split(',').map((s: string) => s.trim()) : [],
        ticket_min: contact.Ticket_Size_Min || null,
        ticket_max: contact.Ticket_Size_Max || null,
        region: contact.Region || null,
        verification_status: contact.Investor_Category || 'pending',
        is_qualified: contact.Is_Qualified || false,
        is_public: contact.Profile_Public || false,
        // Required fields from original assessment form
        personal_capital: true,
        structured_fund: false,
        registered_entity: false,
        due_diligence: false,
        esg_metrics: false,
        check_size: 'medium',
        stage: 'seed',
        deal_source: 'platforms',
        frequency: 'frequent',
        objective: 'returns',
      };

      if (existingInvestor) {
        // Update existing investor profile
        const { error: updateError } = await supabaseClient
          .from('investor_profiles')
          .update(investorData)
          .eq('id', existingInvestor.id);

        if (updateError) {
          throw new Error(`Failed to update investor profile: ${updateError.message}`);
        }

        logStep("Updated investor profile", { email, profileId: existingInvestor.id });
        results.push({
          email,
          success: true,
          action: 'updated',
        });
      } else if (userId) {
        // Create new investor profile
        const { error: insertError } = await supabaseClient
          .from('investor_profiles')
          .insert(investorData);

        if (insertError) {
          throw new Error(`Failed to create investor profile: ${insertError.message}`);
        }

        logStep("Created investor profile", { email });
        results.push({
          email,
          success: true,
          action: 'created',
        });
      } else {
        logStep("Skipping contact - no user profile", { email });
        results.push({
          email,
          success: false,
          error: 'No user profile found',
        });
      }

    } catch (error) {
      logStep("Error syncing Zoho contact to DB", { contactId: contact.id, error: error.message });
      results.push({
        contactId: contact.id,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

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

    const { direction } = await req.json();

    if (!direction || !['db-to-zoho', 'zoho-to-db', 'both'].includes(direction)) {
      throw new Error("Invalid direction. Must be 'db-to-zoho', 'zoho-to-db', or 'both'");
    }

    // Get Zoho access token
    const { accessToken, apiDomain } = await getZohoAccessToken();
    logStep("Zoho access token obtained");

    let dbToZohoResults = null;
    let zohoToDbResults = null;

    if (direction === 'db-to-zoho' || direction === 'both') {
      dbToZohoResults = await syncDbToZoho(supabaseClient, accessToken, apiDomain);
    }

    if (direction === 'zoho-to-db' || direction === 'both') {
      zohoToDbResults = await syncZohoToDb(supabaseClient, accessToken, apiDomain);
    }

    logStep("Sync completed successfully");

    return new Response(JSON.stringify({ 
      success: true,
      dbToZoho: dbToZohoResults,
      zohoToDb: zohoToDbResults,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-zoho", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
