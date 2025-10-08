import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all investor profiles
    const { data: investors, error: investorsError } = await supabaseClient
      .from('investor_profiles')
      .select('*, profiles!inner(id, email)');

    if (investorsError) throw investorsError;

    // Get recent public assessments (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentAssessments, error: assessmentsError } = await supabaseClient
      .from('assessments')
      .select('*, scores(*), profiles(*)')
      .eq('is_public', true)
      .gte('created_at', yesterday);

    if (assessmentsError) throw assessmentsError;

    const alertsToCreate = [];

    // Generate alerts for each investor
    for (const investor of investors || []) {
      const matchingStartups = (recentAssessments || []).filter(assessment => {
        const score = assessment.scores?.[0];
        if (!score) return false;

        // Match by sector
        const sectorMatch = investor.sectors?.some(sector => 
          assessment.business_idea?.toLowerCase().includes(sector.toLowerCase())
        );

        // Match by stage
        const stageMatch = investor.stage === assessment.stage;

        // Match by minimum score threshold (assuming 70+)
        const scoreMatch = score.total_score >= 70;

        return sectorMatch && scoreMatch;
      });

      if (matchingStartups.length > 0) {
        alertsToCreate.push({
          user_id: investor.user_id,
          alert_type: 'new_matches',
          title: `${matchingStartups.length} New Startup${matchingStartups.length > 1 ? 's' : ''} Match Your Criteria`,
          message: `${matchingStartups.length} startup${matchingStartups.length > 1 ? 's' : ''} in ${investor.sectors?.join(', ')} ${matchingStartups.length > 1 ? 'have' : 'has'} been added that match your investment criteria.`,
          data: {
            startups: matchingStartups.map(s => ({
              id: s.id,
              user_id: s.user_id,
              score: s.scores?.[0]?.total_score
            }))
          }
        });
      }

      // Check for score improvements in saved startups
      const { data: savedStartups } = await supabaseClient
        .from('investor_saved_startups')
        .select('*, scores:assessments!startup_user_id(id, scores(*))')
        .eq('investor_user_id', investor.user_id);

      for (const saved of savedStartups || []) {
        // Check if score improved significantly (placeholder logic)
        const latestScore = saved.scores?.scores?.[0]?.total_score;
        if (latestScore && latestScore >= 85) {
          alertsToCreate.push({
            user_id: investor.user_id,
            alert_type: 'score_improvement',
            title: 'Saved Startup Score Improved',
            message: `A startup you saved has improved their readiness score to ${latestScore}/100.`,
            data: {
              startup_user_id: saved.startup_user_id,
              assessment_id: saved.assessment_id,
              new_score: latestScore
            }
          });
        }
      }
    }

    // Bulk insert alerts
    if (alertsToCreate.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('smart_alerts')
        .insert(alertsToCreate);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        alertsCreated: alertsToCreate.length 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in generate-smart-alerts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});