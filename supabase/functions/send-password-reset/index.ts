import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Investment Readiness Platform <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Password Reset Request</h1>
            <p style="color: #666; font-size: 16px;">We received a request to reset your password</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 20px 0; color: #333;">
              Click the button below to reset your password. This link will expire in 1 hour for security reasons.
            </p>
            
            <div style="text-align: center;">
              <a 
                href="${resetUrl}" 
                style="
                  display: inline-block;
                  background: #2563eb;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  margin: 10px 0;
                "
              >
                Reset Password
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #666; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">If you didn't request this password reset, you can safely ignore this email.</p>
            <p style="margin: 0 0 10px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="margin: 0; word-break: break-all; color: #2563eb;">${resetUrl}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Investment Readiness Platform - Helping startups become investment-ready
            </p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);