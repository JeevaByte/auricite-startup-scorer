import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch pending jobs ordered by priority
    const { data: jobs, error: fetchError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending jobs', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const job of jobs) {
      try {
        // Update job status to processing
        await supabase
          .from('background_jobs')
          .update({
            status: 'processing',
            started_at: new Date().toISOString(),
            attempts: job.attempts + 1
          })
          .eq('id', job.id);

        // Process job based on type
        let result;
        switch (job.job_type) {
          case 'rescore':
            result = await processRescoreJob(supabase, job.payload);
            break;
          case 'report_generation':
            result = await processReportGenerationJob(supabase, job.payload);
            break;
          case 'data_sync':
            result = await processDataSyncJob(supabase, job.payload);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }

        // Mark job as completed
        await supabase
          .from('background_jobs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            result: result
          })
          .eq('id', job.id);

        results.push({ id: job.id, status: 'completed' });
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);

        // Check if max attempts reached
        const newStatus = job.attempts + 1 >= job.max_attempts ? 'failed' : 'pending';

        await supabase
          .from('background_jobs')
          .update({
            status: newStatus,
            error_message: error.message,
            ...(newStatus === 'failed' && { completed_at: new Date().toISOString() })
          })
          .eq('id', job.id);

        results.push({ id: job.id, status: newStatus, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Jobs processed',
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Background job processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processRescoreJob(supabase: any, payload: any) {
  // Call the score-assessment function
  const { data, error } = await supabase.functions.invoke('score-assessment', {
    body: payload
  });
  
  if (error) throw error;
  return { message: 'Rescore completed', data };
}

async function processReportGenerationJob(supabase: any, payload: any) {
  // Generate report logic here
  console.log('Generating report:', payload);
  return { message: 'Report generated', reportId: payload.reportId };
}

async function processDataSyncJob(supabase: any, payload: any) {
  // Data sync logic here
  console.log('Syncing data:', payload);
  return { message: 'Data synced', syncedAt: new Date().toISOString() };
}