import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  startupUserId: string;
  investorName: string;
  companyName: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { startupUserId, investorName, companyName, message } = await req.json() as NotificationRequest;

    // Get startup user's email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', startupUserId)
      .single();

    if (profileError || !profile?.email) {
      throw new Error('Startup user not found');
    }

    // Send email notification using Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    const { error: emailError } = await resend.emails.send({
      from: 'Investor Readiness Platform <notifications@resend.dev>',
      to: [profile.email],
      subject: `🎉 ${investorName} is interested in ${companyName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Great News, ${profile.full_name || 'Founder'}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${investorName}</strong> has expressed interest in <strong>${companyName}</strong>.
          </p>
          
          ${message ? `
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-style: italic;">"${message}"</p>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6;">
            You can respond to this interest request from your <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/fundseeker-dashboard" style="color: #2563eb;">Fund Seeker Dashboard</a>.
          </p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #1e40af;">Next Steps:</h3>
            <ol style="line-height: 1.8;">
              <li>Review the investor's profile and background</li>
              <li>Accept or decline the interest request</li>
              <li>If accepted, you can exchange contact information</li>
            </ol>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            This is an automated notification from the Investor Readiness Platform.
          </p>
        </div>
      `,
    });

    if (emailError) {
      throw emailError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});