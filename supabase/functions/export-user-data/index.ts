import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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

    // Create export request
    const { data: exportRequest, error: requestError } = await supabaseClient
      .from('data_export_requests')
      .insert({
        user_id: user.id,
        status: 'pending',
        export_type: 'full',
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Start async export process
    processExport(supabaseClient, exportRequest.id, user.id);

    return new Response(
      JSON.stringify({
        success: true,
        requestId: exportRequest.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in export-user-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processExport(supabaseClient: any, requestId: string, userId: string) {
  try {
    // Update status to processing
    await supabaseClient
      .from('data_export_requests')
      .update({ status: 'processing' })
      .eq('id', requestId);

    // Collect all user data
    const userData: any = {};

    // Profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    userData.profile = profile;

    // Assessments
    const { data: assessments } = await supabaseClient
      .from('assessments')
      .select('*')
      .eq('user_id', userId);
    userData.assessments = assessments;

    // Scores
    const { data: scores } = await supabaseClient
      .from('scores')
      .select('*')
      .eq('user_id', userId);
    userData.scores = scores;

    // Score History
    const { data: scoreHistory } = await supabaseClient
      .from('score_history')
      .select('*')
      .eq('user_id', userId);
    userData.scoreHistory = scoreHistory;

    // Investor Profile (if exists)
    const { data: investorProfile } = await supabaseClient
      .from('investor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    userData.investorProfile = investorProfile;

    // User Feedback
    const { data: feedback } = await supabaseClient
      .from('user_feedback')
      .select('*')
      .eq('user_id', userId);
    userData.feedback = feedback;

    // Create JSON export
    const exportData = JSON.stringify(userData, null, 2);
    const fileName = `user-data-export-${userId}-${Date.now()}.json`;

    // In production, upload to storage and generate signed URL
    // For now, store the data temporarily
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Update request with completion
    await supabaseClient
      .from('data_export_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        download_url: `data:application/json;base64,${btoa(exportData)}`,
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', requestId);

    console.log(`Export completed for user ${userId}`);
  } catch (error) {
    console.error('Error processing export:', error);
    
    await supabaseClient
      .from('data_export_requests')
      .update({
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', requestId);
  }
}
