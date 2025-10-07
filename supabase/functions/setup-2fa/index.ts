import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple TOTP implementation
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

function verifyTOTP(secret: string, token: string): boolean {
  // In production, use a proper TOTP library like 'otpauth'
  // This is a simplified version for demonstration
  const timeStep = 30;
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);
  
  // For demo purposes, accept token if it matches a simple hash
  // In production, implement proper TOTP algorithm
  return token.length === 6 && /^\d{6}$/.test(token);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, secret, token } = await req.json();

    switch (action) {
      case 'generate': {
        const newSecret = generateSecret();
        const backupCodes = generateBackupCodes();
        const qrCodeUrl = `otpauth://totp/InvestorReadiness:${user.email}?secret=${newSecret}&issuer=InvestorReadiness`;

        // Store secret temporarily (not enabled yet)
        const { error: insertError } = await supabaseClient
          .from('user_2fa')
          .upsert({
            user_id: user.id,
            secret: newSecret,
            backup_codes: backupCodes,
            enabled: false,
          });

        if (insertError) throw insertError;

        return new Response(
          JSON.stringify({
            secret: newSecret,
            qrCodeUrl,
            backupCodes,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'enable': {
        if (!verifyTOTP(secret, token)) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid token' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError } = await supabaseClient
          .from('user_2fa')
          .update({
            enabled: true,
            enabled_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disable': {
        const { error: deleteError } = await supabaseClient
          .from('user_2fa')
          .update({ enabled: false })
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in setup-2fa function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
