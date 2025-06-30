
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvestorData {
  personalCapital: boolean;
  structuredFund: boolean;
  registeredEntity: boolean;
  dueDiligence: boolean;
  esgMetrics: boolean;
  checkSize: 'low' | 'medium' | 'high' | 'veryHigh';
  stage: 'preSeed' | 'seed' | 'seriesB' | 'preIPO';
  dealSource: 'personal' | 'platforms' | 'funds' | 'public';
  frequency: 'occasional' | 'frequent' | 'quarterly' | 'portfolio';
  objective: 'support' | 'returns' | 'strategic' | 'impact';
}

interface ClassificationResult {
  category: 'Angel' | 'VC' | 'Family Office' | 'Institutional' | 'Crowdfunding';
  confidence: number;
  explanation: string;
}

function fallbackClassification(data: InvestorData): ClassificationResult {
  const scores = {
    Angel: 0,
    VC: 0,
    'Family Office': 0,
    Institutional: 0,
    Crowdfunding: 0
  };

  // Scoring logic based on the prompt requirements
  if (data.personalCapital) scores.Angel += 20;
  if (data.structuredFund) scores.VC += 20;
  if (data.esgMetrics) scores.Crowdfunding += 15;
  
  // Check size scoring
  if (data.checkSize === 'veryHigh') scores.Institutional += 25;
  if (data.checkSize === 'low' || data.checkSize === 'medium') scores.Angel += 10;
  
  // Additional scoring factors
  if (data.stage === 'preSeed' || data.stage === 'seed') scores.Angel += 10;
  if (data.dealSource === 'personal') scores.Angel += 10;
  if (data.dealSource === 'public') scores.Crowdfunding += 10;
  if (data.frequency === 'portfolio') scores['Family Office'] += 10;
  if (data.objective === 'strategic') scores['Family Office'] += 10;
  if (data.objective === 'support') scores.Angel += 10;

  // Find the category with highest score
  let maxScore = 0;
  let category: ClassificationResult['category'] = 'Angel';
  
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      category = cat as ClassificationResult['category'];
    }
  }

  // Tiebreaker: prioritize Angel if personal capital and low/medium check size
  if (data.personalCapital && (data.checkSize === 'low' || data.checkSize === 'medium')) {
    category = 'Angel';
  }

  const confidence = Math.min(maxScore / 50, 1); // Normalize to 0-1

  return {
    category,
    confidence,
    explanation: `${category} classification based on ${data.personalCapital ? 'personal capital, ' : ''}${data.checkSize} check size, and ${data.stage} stage focus.`
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: investorData } = await req.json()

    // Validate input data
    if (!investorData || typeof investorData !== 'object') {
      throw new Error('Invalid investor data provided')
    }

    // Check for cached response first
    const { data: cachedResponse } = await supabaseClient
      .from('ai_responses')
      .select('response_data')
      .eq('assessment_data', JSON.stringify(investorData))
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cachedResponse) {
      return new Response(JSON.stringify(cachedResponse.response_data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let result: ClassificationResult;

    try {
      // Try AI classification first
      const openAIKey = Deno.env.get('OpenAI API key');
      
      if (!openAIKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Given a JSON input from an investor assessment form, classify the investor into one category: Angel, VC, Family Office, Institutional, or Crowdfunding. 

Scoring rules:
- personalCapital (Yes: +20 to Angel)
- structuredFund (Yes: +20 to VC) 
- esgMetrics (Yes: +15 to Crowdfunding)
- checkSize (veryHigh: +25 to Institutional, low/medium: +10 to Angel)
- Tiebreaker: Prioritize Angel if personalCapital is true and checkSize is low/medium

Input: ${JSON.stringify(investorData)}

Return a JSON object with category, confidence (0-1), and explanation (<50 words).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert investor classifier. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0]?.message?.content;
      
      if (content) {
        result = JSON.parse(content);
      } else {
        throw new Error('No AI response content');
      }

    } catch (aiError) {
      console.log('AI classification failed, using fallback:', aiError);
      result = fallbackClassification(investorData);
    }

    // Cache the response
    await supabaseClient
      .from('ai_responses')
      .insert({
        assessment_data: investorData,
        response_data: result,
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in categorize-investor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
