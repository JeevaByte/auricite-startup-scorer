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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get current user's investor profile
    const { data: currentProfile, error: profileError } = await supabaseClient
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get all other investors
    const { data: allInvestors, error: investorsError } = await supabaseClient
      .from('investor_profiles')
      .select('*, profiles!inner(id, full_name, email)')
      .neq('user_id', user.id)
      .eq('is_public', true);

    if (investorsError) throw investorsError;

    // Calculate similarity scores
    const recommendations = (allInvestors || []).map(investor => {
      let similarityScore = 0;

      // Sector overlap (40% weight)
      const sectorOverlap = investor.sectors?.filter(s => 
        currentProfile.sectors?.includes(s)
      ).length || 0;
      const sectorSimilarity = sectorOverlap / Math.max(
        currentProfile.sectors?.length || 1, 
        investor.sectors?.length || 1
      );
      similarityScore += sectorSimilarity * 40;

      // Stage match (30% weight)
      if (investor.stage === currentProfile.stage) {
        similarityScore += 30;
      }

      // Ticket size overlap (20% weight)
      const ticketOverlap = !(
        (investor.ticket_max || 0) < (currentProfile.ticket_min || 0) ||
        (investor.ticket_min || 0) > (currentProfile.ticket_max || 0)
      );
      if (ticketOverlap) {
        similarityScore += 20;
      }

      // Investment objective match (10% weight)
      if (investor.objective === currentProfile.objective) {
        similarityScore += 10;
      }

      return {
        investor_id: investor.user_id,
        profile: investor.profiles,
        sectors: investor.sectors,
        stage: investor.stage,
        ticket_range: [investor.ticket_min, investor.ticket_max],
        similarityScore: Math.round(similarityScore)
      };
    })
    .filter(rec => rec.similarityScore > 30) // Only return reasonable matches
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 10); // Top 10 recommendations

    return new Response(
      JSON.stringify({ recommendations }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in investor-recommendations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});