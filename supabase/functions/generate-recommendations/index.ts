
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentInput {
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
  scores: {
    businessIdea: number;
    financials: number;
    team: number;
    traction: number;
    total: number;
  };
}

interface RecommendationsResponse {
  businessIdea: string[];
  financials: string[];
  team: string[];
  traction: string[];
}

const fallbackRecommendations: RecommendationsResponse = {
  businessIdea: [
    "Survey 10 customers to refine your value proposition and market fit.",
    "Research market size using industry reports and competitor analysis.",
    "Develop a compelling prototype demo for investor presentations."
  ],
  financials: [
    "Build a lean financial model using SCORE templates or similar tools.",
    "Document your cap table clearly for investor transparency.",
    "Create 12-month revenue projections with realistic assumptions."
  ],
  team: [
    "Validate team expertise with advisor endorsements and credentials.",
    "Consider recruiting a technical co-founder for scalability.",
    "Document team commitment and equity agreements in pitch materials."
  ],
  traction: [
    "Conduct 5 customer interviews for market validation feedback.",
    "Secure 2 letters of intent (LOIs) from potential clients.",
    "Implement analytics tracking to measure user engagement metrics."
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: AssessmentInput = await req.json();

    if (!openAIApiKey) {
      console.log('No OpenAI API key found, returning fallback recommendations');
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Given a startup assessment and scores, provide 3 actionable recommendations per category to improve investor readiness for a pre-seed startup targeting angel investors.

Assessment Data:
- Prototype: ${input.prototype}
- External Capital: ${input.externalCapital}
- Revenue: ${input.revenue}
- Full-time Team: ${input.fullTimeTeam}
- Term Sheets: ${input.termSheets}
- Cap Table: ${input.capTable}
- MRR: ${input.mrr}
- Employees: ${input.employees}
- Funding Goal: ${input.fundingGoal}
- Investors: ${input.investors}
- Milestones: ${input.milestones}

Scores:
- Business Idea: ${input.scores.businessIdea}/100
- Financials: ${input.scores.financials}/100
- Team: ${input.scores.team}/100
- Traction: ${input.scores.traction}/100
- Total: ${input.scores.total}/999

Prioritize recommendations for categories with scores <50. For Business Idea, suggest actions to clarify value proposition or market size. For Financials, recommend steps for revenue, MRR, or cap table clarity. For Team, advise on expertise or hiring. For Traction, suggest customer validation or investor outreach.

Return ONLY a JSON object with 12 recommendations (3 per category, 50 words max each):

{
  "businessIdea": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "financials": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "team": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "traction": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert startup advisor specializing in helping pre-seed startups become investor-ready. Always respond with valid JSON only, no additional text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    try {
      const recommendations = JSON.parse(aiResponse);
      
      return new Response(JSON.stringify({ recommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('Failed to parse AI response, using fallback:', parseError);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-recommendations function:', error);
    return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
