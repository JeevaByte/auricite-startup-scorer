
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

interface ApiRequest {
  endpoint: string;
  method: string;
  data?: any;
  filters?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get API key from headers
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate API key (you can implement your own validation logic)
    // For now, we'll use a simple check
    if (apiKey !== Deno.env.get('API_ACCESS_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { endpoint, method, data, filters }: ApiRequest = await req.json()

    let response;

    switch (endpoint) {
      case 'assessments':
        response = await handleAssessments(supabaseClient, method, data, filters)
        break
      case 'scores':
        response = await handleScores(supabaseClient, method, data, filters)
        break
      case 'scoring-config':
        response = await handleScoringConfig(supabaseClient, method, data, filters)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAssessments(supabase: any, method: string, data: any, filters: any) {
  switch (method) {
    case 'GET':
      let query = supabase.from('assessments').select('*, scores(*)')
      
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }
      
      const { data: assessments, error } = await query
      if (error) throw error
      return { data: assessments, count: assessments?.length || 0 }

    case 'POST':
      const { data: newAssessment, error: insertError } = await supabase
        .from('assessments')
        .insert(data)
        .select()
        .single()
      
      if (insertError) throw insertError
      return { data: newAssessment }

    default:
      throw new Error(`Method ${method} not supported for assessments`)
  }
}

async function handleScores(supabase: any, method: string, data: any, filters: any) {
  switch (method) {
    case 'GET':
      let query = supabase.from('scores').select('*, assessments(*)')
      
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.assessment_id) {
        query = query.eq('assessment_id', filters.assessment_id)
      }
      if (filters?.min_score) {
        query = query.gte('total_score', filters.min_score)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      
      const { data: scores, error } = await query
      if (error) throw error
      return { data: scores, count: scores?.length || 0 }

    default:
      throw new Error(`Method ${method} not supported for scores`)
  }
}

async function handleScoringConfig(supabase: any, method: string, data: any, filters: any) {
  switch (method) {
    case 'GET':
      const { data: config, error } = await supabase
        .from('scoring_config')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (error) throw error
      return { data: config }

    default:
      throw new Error(`Method ${method} not supported for scoring-config`)
  }
}
