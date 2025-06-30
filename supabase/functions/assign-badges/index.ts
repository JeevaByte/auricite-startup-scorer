
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssessmentData {
  prototype: boolean;
  externalCapital: boolean;
  revenue: boolean;
  fullTimeTeam: boolean;
  termSheets: boolean;
  capTable: boolean;
  mrr: string;
  employees: string;
  fundingGoal: string;
  investors: string;
  milestones: string;
}

interface Scores {
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
  total: number;
}

interface Badge {
  name: string;
  explanation: string;
}

interface BadgeResponse {
  badges: Badge[];
  engagementMessage: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data, scores } = await req.json();
    console.log('Received assessment data:', data);
    console.log('Received scores:', scores);

    // Validate input data
    if (!data || !scores) {
      throw new Error('Missing assessment data or scores');
    }

    const assessmentData: AssessmentData = data;
    const assessmentScores: Scores = scores;

    // Badge assignment logic
    const badges: Badge[] = [];
    
    // Rising Star: Total >700
    if (assessmentScores.total > 700) {
      badges.push({
        name: "Rising Star",
        explanation: "Outstanding overall performance indicating strong investor readiness."
      });
    }

    // Team Titan: Team >80
    if (assessmentScores.team > 80) {
      badges.push({
        name: "Team Titan",
        explanation: "Exceptional team strength with full-time commitment and clear structure."
      });
    }

    // Visionary: Business Idea >75
    if (assessmentScores.businessIdea > 75) {
      badges.push({
        name: "Visionary",
        explanation: "Brilliant business concept with clear market potential and innovation."
      });
    }

    // Traction Trailblazer: Traction >60
    if (assessmentScores.traction > 60) {
      badges.push({
        name: "Traction Trailblazer",
        explanation: "Strong market traction with proven customer or investor interest."
      });
    }

    // Financial Pioneer: Financials >70
    if (assessmentScores.financials > 70) {
      badges.push({
        name: "Financial Pioneer",
        explanation: "Clear financial structure with solid cap table and funding strategy."
      });
    }

    // Special considerations for angel investor criteria
    if (assessmentData.fullTimeTeam && assessmentData.capTable && assessmentScores.team > 60 && badges.length < 3) {
      badges.push({
        name: "Angel Ready",
        explanation: "Well-structured startup with dedicated team and clear ownership."
      });
    }

    // Limit to 3 badges maximum
    const finalBadges = badges.slice(0, 3);

    // Fallback badge if no badges earned
    if (finalBadges.length === 0) {
      finalBadges.push({
        name: "Starter",
        explanation: "Early-stage startup with potential to grow and improve."
      });
    }

    // Generate engagement message
    let engagementMessage = "";
    if (finalBadges.some(b => b.name === "Rising Star")) {
      engagementMessage = "Exceptional performance! You're investor-ready!";
    } else if (finalBadges.length >= 2) {
      engagementMessage = "Great progress! Keep building to unlock more badges.";
    } else if (finalBadges.some(b => b.name === "Team Titan")) {
      engagementMessage = "Strong team foundation! Focus on traction next.";
    } else if (finalBadges.some(b => b.name === "Visionary")) {
      engagementMessage = "Brilliant idea! Build your team and traction.";
    } else {
      engagementMessage = "Good start! Focus on team and product development.";
    }

    const response: BadgeResponse = {
      badges: finalBadges,
      engagementMessage
    };

    console.log('Badge assignment result:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in assign-badges function:', error);
    
    // Fallback response in case of error
    const fallbackResponse: BadgeResponse = {
      badges: [{
        name: "Starter",
        explanation: "Early-stage startup with potential to grow."
      }],
      engagementMessage: "Keep building your startup!"
    };

    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200
      }
    );
  }
})
