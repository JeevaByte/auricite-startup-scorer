
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Load locked scoring rules (source of truth)
import rules from './scoring_rules.v0.1.0.json' assert { type: 'json' };

interface AssessmentData {
  prototype: boolean;
  externalCapital: boolean;
  revenue: boolean;
  fullTimeTeam: boolean;
  termSheets: boolean;
  capTable: boolean;
  mrr: 'none' | 'low' | 'medium' | 'high';
  employees: '1-2' | '3-10' | '11-50' | '50+';
  fundingGoal: string;
  investors: 'none' | 'angels' | 'vc' | 'lateStage';
  milestones: 'concept' | 'launch' | 'scale' | 'exit';
}

interface ScoreResult {
  businessIdea: number;
  businessIdeaExplanation: string;
  financials: number;
  financialsExplanation: string;
  team: number;
  teamExplanation: string;
  traction: number;
  tractionExplanation: string;
  totalScore: number;
}

interface ScoringConfig {
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
  sectors: {
    [key: string]: {
      businessIdea: number;
      financials: number;
      team: number;
      traction: number;
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Fail fast if required env vars are missing
    const missing = ['APP_ENV','DATABASE_URL','AUTH_SECRET','RATE_LIMIT_RPM','LLM_PROVIDER','LLM_API_KEY','SENTRY_DSN'].filter((k) => !Deno.env.get(k));
    if (missing.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables', missing }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body = await req.json()
    const assessmentData: AssessmentData = body.assessmentData

    if (!assessmentData) {
      return new Response(
        JSON.stringify({ error: 'Assessment data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build scoring configuration from locked JSON rules
    const dims = rules.dimensions as Record<string, number>
    const rawWeights = {
      businessIdea: ((dims.market ?? 0) + (dims.moat ?? 0)) / 100,
      financials: (dims.financials ?? 0) / 100,
      team: (dims.team ?? 0) / 100,
      traction: (dims.traction ?? 0) / 100,
    }
    const sum = Object.values(rawWeights).reduce((a, b) => a + b, 0) || 1
    const normalized = {
      businessIdea: rawWeights.businessIdea / sum,
      financials: rawWeights.financials / sum,
      team: rawWeights.team / sum,
      traction: rawWeights.traction / sum,
    }
    const config: ScoringConfig = {
      businessIdea: normalized.businessIdea,
      financials: normalized.financials,
      team: normalized.team,
      traction: normalized.traction,
      sectors: {}
    }

    // Calculate score using the fetched configuration
    const result = await calculateScore(assessmentData, config)

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        sector: determineSector(assessmentData),
        configUsed: `json:${rules.version}`,
        ruleset_version: rules.version
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in score-assessment function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function determineSector(data: AssessmentData): string {
  const hasRecurringRevenue = data.mrr !== 'none'
  const hasRevenue = data.revenue
  const hasB2BIndicators = data.termSheets || (hasRevenue && hasRecurringRevenue)
  
  if (hasB2BIndicators && hasRecurringRevenue) {
    return 'B2B SaaS'
  }
  
  if (data.externalCapital && data.termSheets) {
    return 'FinTech'
  }
  
  if (data.prototype && !hasRevenue) {
    return 'B2C Consumer'
  }
  
  if (hasRevenue && !hasRecurringRevenue) {
    return 'E-commerce'
  }
  
  return 'B2B SaaS'
}

async function calculateScore(data: AssessmentData, config: ScoringConfig): Promise<ScoreResult> {
  const sector = determineSector(data)
  const weights = config.sectors[sector] || {
    businessIdea: config.businessIdea,
    financials: config.financials,
    team: config.team,
    traction: config.traction,
  }

  const businessIdeaScore = calculateBusinessIdeaScore(data)
  const financialsScore = calculateFinancialsScore(data)
  const teamScore = calculateTeamScore(data)
  const tractionScore = calculateTractionScore(data)

  const totalScore = Math.round(
    (businessIdeaScore.score * weights.businessIdea + 
     financialsScore.score * weights.financials + 
     teamScore.score * weights.team + 
     tractionScore.score * weights.traction) * 9.99
  )

  return {
    businessIdea: businessIdeaScore.score,
    businessIdeaExplanation: businessIdeaScore.explanation,
    financials: financialsScore.score,
    financialsExplanation: financialsScore.explanation,
    team: teamScore.score,
    teamExplanation: teamScore.explanation,
    traction: tractionScore.score,
    tractionExplanation: tractionScore.explanation,
    totalScore
  }
}

function calculateBusinessIdeaScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0
  const factors: string[] = []

  if (data.prototype) {
    score += 50
    factors.push('working prototype demonstrates feasibility')
  } else {
    score += 15
    factors.push('concept stage without prototype limits validation')
  }

  switch (data.milestones) {
    case 'concept':
      score += 10
      factors.push('early concept stage shows potential but needs development')
      break
    case 'launch':
      score += 30
      factors.push('MVP launch demonstrates market entry capability')
      break
    case 'scale':
      score += 40
      factors.push('scaling stage shows proven market demand')
      break
    case 'exit':
      score += 35
      factors.push('exit-ready stage indicates mature business model')
      break
  }

  score = Math.min(score, 100)
  const explanation = `Business idea scored ${score}/100. Key factors: ${factors.join(', ')}.`
  
  return { score, explanation }
}

function calculateFinancialsScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0
  const factors: string[] = []

  if (data.revenue) {
    score += 35
    factors.push('active revenue generation')
  } else {
    score += 10
    factors.push('pre-revenue stage')
  }

  switch (data.mrr) {
    case 'none':
      score += 5
      factors.push('no recurring revenue model')
      break
    case 'low':
      score += 20
      factors.push('established low MRR base')
      break
    case 'medium':
      score += 30
      factors.push('solid MRR growth trajectory')
      break
    case 'high':
      score += 40
      factors.push('strong MRR performance')
      break
  }

  if (data.capTable) {
    score += 15
    factors.push('documented ownership structure')
  } else {
    factors.push('missing cap table documentation reduces investor confidence')
  }

  if (data.externalCapital) {
    score += 10
    factors.push('previous external funding validates business')
  }

  score = Math.min(score, 100)
  const explanation = `Financial health scored ${score}/100. Key factors: ${factors.join(', ')}.`
  
  return { score, explanation }
}

function calculateTeamScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0
  const factors: string[] = []

  if (data.fullTimeTeam) {
    score += 60
    factors.push('full-time team commitment shows dedication')
  } else {
    score += 20
    factors.push('part-time commitment may limit execution speed')
  }

  switch (data.employees) {
    case '1-2':
      score += 15
      factors.push('small founding team allows for agility but may lack diverse skills')
      break
    case '3-10':
      score += 35
      factors.push('optimal team size for startup growth and specialization')
      break
    case '11-50':
      score += 40
      factors.push('established team size indicates successful scaling')
      break
    case '50+':
      score += 25
      factors.push('large team may indicate later-stage company or potential overhead concerns')
      break
  }

  score = Math.min(score, 100)
  const explanation = `Team strength scored ${score}/100. Key factors: ${factors.join(', ')}.`
  
  return { score, explanation }
}

function calculateTractionScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0
  const factors: string[] = []

  if (data.termSheets) {
    score += 50
    factors.push('term sheets received show serious investor interest')
  } else {
    score += 15
    factors.push('no term sheets yet but may be appropriate for current stage')
  }

  switch (data.investors) {
    case 'none':
      score += 5
      factors.push('no investor engagement limits funding options')
      break
    case 'angels':
      score += 25
      factors.push('angel investor engagement shows initial market validation')
      break
    case 'vc':
      score += 35
      factors.push('VC engagement indicates scaling potential')
      break
    case 'lateStage':
      score += 40
      factors.push('late-stage investor interest shows proven business model')
      break
  }

  if (data.fundingGoal) {
    score += 10
    factors.push('clear funding strategy')
  }

  score = Math.min(score, 100)
  const explanation = `Market traction scored ${score}/100. Key factors: ${factors.join(', ')}.`
  
  return { score, explanation }
}
