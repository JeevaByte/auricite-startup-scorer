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
    const { reportId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the scheduled report
    const { data: report, error: reportError } = await supabase
      .from('scheduled_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError) throw reportError;
    if (!report) throw new Error('Report not found');

    // Generate report data based on type
    let reportData;
    switch (report.report_type) {
      case 'investment_summary':
        reportData = await generateInvestmentSummary(supabase, report);
        break;
      case 'portfolio_analytics':
        reportData = await generatePortfolioAnalytics(supabase, report);
        break;
      case 'risk_report':
        reportData = await generateRiskReport(supabase, report);
        break;
      default:
        throw new Error(`Unknown report type: ${report.report_type}`);
    }

    // In a real implementation, you would:
    // 1. Generate PDF/CSV based on report.format
    // 2. Send emails to report.recipients using Resend
    // 3. Store report in storage bucket

    // Update report status
    const nextDate = calculateNextScheduledDate(report.frequency);
    await supabase
      .from('scheduled_reports')
      .update({
        last_sent_at: new Date().toISOString(),
        next_scheduled_at: nextDate
      })
      .eq('id', reportId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Report sent successfully',
        reportId,
        nextScheduledAt: nextDate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send scheduled report error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function generateInvestmentSummary(supabase: any, report: any) {
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', report.user_id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    period: 'Last 30 days',
    totalAssessments: assessments?.length || 0,
    assessments
  };
}

async function generatePortfolioAnalytics(supabase: any, report: any) {
  const { data: portfolio } = await supabase
    .from('investor_portfolio')
    .select('*')
    .eq('investor_user_id', report.user_id);

  return {
    totalInvestments: portfolio?.length || 0,
    portfolio
  };
}

async function generateRiskReport(supabase: any, report: any) {
  return {
    riskScore: 'Medium',
    factors: ['Market volatility', 'Sector concentration']
  };
}

function calculateNextScheduledDate(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
}