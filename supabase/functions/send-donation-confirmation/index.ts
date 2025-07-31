import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-DONATION-CONFIRMATION] ${step}${detailsStr}`);
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

    const { donationId } = await req.json();
    
    if (!donationId) {
      throw new Error("Donation ID is required");
    }

    // Get donation details
    const { data: donation, error: donationError } = await supabaseClient
      .from('donations')
      .select('*')
      .eq('id', donationId)
      .single();

    if (donationError || !donation) {
      throw new Error("Donation not found");
    }

    logStep("Donation retrieved", { donationId, email: donation.email });

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for your donation!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e1e8ed; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
            .access-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🙏 Thank You for Your Donation!</h1>
            <p>Your generosity helps us continue building amazing tools for startups</p>
          </div>
          
          <div class="content">
            <p>Dear ${donation.donor_name || 'Generous Donor'},</p>
            
            <p>Thank you so much for your generous donation! Your support means the world to us and helps us continue developing tools that empower startups to succeed.</p>
            
            <div class="amount">
              Donation Amount: $${(donation.amount / 100).toFixed(2)}
            </div>
            
            ${donation.message ? `
              <p><strong>Your message:</strong></p>
              <p style="font-style: italic; background: #f8f9fa; padding: 15px; border-radius: 6px;">"${donation.message}"</p>
            ` : ''}
            
            <div class="access-info">
              <h3>🎉 Premium Access Unlocked!</h3>
              <p>As a thank you for your donation, you now have access to:</p>
              <ul>
                <li>📊 <strong>Investor Directory</strong> - Connect with relevant investors</li>
                <li>📚 <strong>Learning Resources</strong> - Educational content and tutorials</li>
                <li>📎 <strong>Pitch Deck Upload</strong> - Upload and manage your pitch decks</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovableproject.com') || 'https://your-app.com'}/investor-directory" class="button">Access Investor Directory</a>
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovableproject.com') || 'https://your-app.com'}/learn" class="button">Start Learning</a>
              </p>
            </div>
            
            <p>You can log in to your account anytime to access these premium features. If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
            
            <p>Thank you again for believing in our mission!</p>
            
            <p>Best regards,<br>
            The InvestReady Team</p>
          </div>
          
          <div class="footer">
            <p>This is a confirmation email for donation ID: ${donation.id}</p>
            <p>Date: ${new Date(donation.created_at).toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "InvestReady <donations@resend.dev>",
      to: [donation.email],
      subject: `Thank you for your $${(donation.amount / 100).toFixed(2)} donation! 🙏`,
      html: emailHtml,
    });

    logStep("Email sent successfully", emailResponse);

    // Trigger CRM webhook if configured
    try {
      const crmWebhookUrl = Deno.env.get("CRM_WEBHOOK_URL");
      if (crmWebhookUrl) {
        const crmResponse = await fetch(crmWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: 'donation_completed',
            donation: {
              id: donation.id,
              email: donation.email,
              amount: donation.amount,
              donor_name: donation.donor_name,
              message: donation.message,
              date: donation.created_at
            }
          })
        });
        logStep("CRM webhook triggered", { status: crmResponse.status });
      }
    } catch (crmError) {
      logStep("CRM webhook failed", crmError);
    }

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-donation-confirmation", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});