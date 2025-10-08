import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthMetric {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  details?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const metrics: HealthMetric[] = [];
    const startTime = Date.now();

    // Check Database
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      metrics.push({
        service: 'database',
        status: error ? 'degraded' : 'healthy',
        responseTime: Date.now() - dbStart,
        details: error ? error.message : 'Connected'
      });
    } catch (error) {
      metrics.push({
        service: 'database',
        status: 'down',
        responseTime: Date.now() - dbStart,
        details: error.message
      });
    }

    // Check Auth Service
    const authStart = Date.now();
    try {
      const { error } = await supabase.auth.getUser();
      metrics.push({
        service: 'auth',
        status: error ? 'degraded' : 'healthy',
        responseTime: Date.now() - authStart,
        details: 'Auth service responsive'
      });
    } catch (error) {
      metrics.push({
        service: 'auth',
        status: 'down',
        responseTime: Date.now() - authStart,
        details: error.message
      });
    }

    // Check Storage
    const storageStart = Date.now();
    try {
      const { data, error } = await supabase.storage.listBuckets();
      metrics.push({
        service: 'storage',
        status: error ? 'degraded' : 'healthy',
        responseTime: Date.now() - storageStart,
        details: `${data?.length || 0} buckets`
      });
    } catch (error) {
      metrics.push({
        service: 'storage',
        status: 'down',
        responseTime: Date.now() - storageStart,
        details: error.message
      });
    }

    // Log metrics to database
    for (const metric of metrics) {
      await supabase.from('system_health_metrics').insert({
        service_name: metric.service,
        status: metric.status,
        response_time_ms: metric.responseTime,
        metadata: { details: metric.details }
      });
    }

    const overallStatus = metrics.some(m => m.status === 'down') ? 'down' :
                         metrics.some(m => m.status === 'degraded') ? 'degraded' : 'healthy';

    return new Response(
      JSON.stringify({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        services: metrics
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: overallStatus === 'down' ? 503 : 200
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        status: 'down',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});