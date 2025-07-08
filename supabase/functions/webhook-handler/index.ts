
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, data } = await req.json()

    console.log('Webhook triggered:', { event_type, data })

    // Handle different webhook events
    switch (event_type) {
      case 'score_created':
        await handleScoreCreated(supabase, data)
        break
      case 'assessment_completed':
        await handleAssessmentCompleted(supabase, data)
        break
      default:
        console.log('Unknown event type:', event_type)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function handleScoreCreated(supabase: any, data: any) {
  console.log('Handling score created:', data)
  
  // Log the event
  await supabase.from('audit_log').insert({
    table_name: 'scores',
    record_id: data.score_id,
    action: 'WEBHOOK_TRIGGERED',
    new_values: data,
    user_id: data.user_id
  })

  // Send external webhook if configured
  const webhookUrl = Deno.env.get('EXTERNAL_WEBHOOK_URL')
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'score_created',
        data: data,
        timestamp: new Date().toISOString()
      })
    })
  }
}

async function handleAssessmentCompleted(supabase: any, data: any) {
  console.log('Handling assessment completed:', data)
  
  // Queue notification
  await supabase.from('notification_queue').insert({
    user_id: data.user_id,
    notification_type: 'assessment_completed',
    title: 'Assessment Completed',
    message: `Your assessment has been completed with a score of ${data.total_score}`,
    data: data
  })
}
