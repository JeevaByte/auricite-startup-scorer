import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OpenAI API key');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData, scoreResult } = await req.json();

    if (!OPENAI_KEY) {
      // Fallback lightweight narrative
      const fallback = {
        overview: 'Based on your current score, you are progressing toward investment readiness. Focus on the lowest subscores first.',
        strengths: ['Clear business thesis', 'Early customer interest'],
        risks: ['Limited financial runway', 'MRR still early-stage'],
        opportunities: ['Strengthen go-to-market', 'Broaden pipeline'],
        action_items: ['Tighten unit economics', 'Document metrics and milestones'],
      };
      return new Response(JSON.stringify(fallback), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const prompt = `You are an investment analyst. Given the following assessment and score, write a crisp narrative.
Assessment: ${JSON.stringify(assessmentData)}
Score: ${JSON.stringify(scoreResult)}
Return strict JSON with keys: overview (string), strengths (string[]), risks (string[]), opportunities (string[]), action_items (string[]). Keep it concise and actionable.`;

    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${OPENAI_KEY}`, 
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'Investment Readiness Platform',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          { role: 'system', content: 'You are a precise investment analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      }),
    });

    const data = await resp.json();
    let content = data?.choices?.[0]?.message?.content || '';
    // Try to parse JSON from the model response
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1));

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('generate-narrative error', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
