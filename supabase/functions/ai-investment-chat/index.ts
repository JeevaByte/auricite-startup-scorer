import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const { message, sessionId } = await req.json();

    // Get or create chat session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('ai_chat_sessions')
        .insert({ user_id: user.id, title: message.substring(0, 50) })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
    }

    // Save user message
    await supabaseClient
      .from('ai_chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message
      });

    // Get conversation history
    const { data: history } = await supabaseClient
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    // Get user's investor profile for context
    const { data: investorProfile } = await supabaseClient
      .from('investor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build context-aware system prompt
    const systemPrompt = `You are an AI investment assistant helping investors discover and analyze startups. 
${investorProfile ? `The investor focuses on: ${investorProfile.sectors?.join(', ')} sectors, ${investorProfile.stage} stage, ticket size ${investorProfile.ticket_min}-${investorProfile.ticket_max}.` : ''}

You have access to:
- Startup readiness scores and detailed breakdowns
- Funding stage, sector, and traction data
- Investor matching and recommendation data

When answering queries:
1. Parse natural language queries about startups (e.g., "Show me top fintech startups with >80 score")
2. Provide actionable insights and recommendations
3. Explain scoring metrics clearly
4. Suggest relevant startups based on investor preferences

Keep responses concise and data-driven.`;

    // Call OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(history || [])
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0].message.content;

    // Save assistant response
    await supabaseClient
      .from('ai_chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: assistantMessage
      });

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        sessionId: currentSessionId 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ai-investment-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});