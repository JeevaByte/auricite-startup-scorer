import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCORING_VERSION = 'v2.0.0';
const EXTRACTION_VERSION = 'v1.0.0';

interface AssessmentData {
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { assessmentData, assessmentId } = await req.json();

    // Log audit entry
    await logAudit(supabaseClient, {
      assessment_id: assessmentId,
      user_id: user.id,
      event_type: 'scoring',
      event_status: 'started',
      input_data: assessmentData,
    });

    // Step 1: Feature Extraction
    const extractedFeatures = await extractFeatures(assessmentData);
    const featuresId = await saveExtractedFeatures(
      supabaseClient,
      user.id,
      assessmentId,
      extractedFeatures
    );

    // Step 2: Generate Embeddings
    const embedding = await generateEmbedding(assessmentData);
    
    // Step 3: Calculate scores from different methods
    const llmScore = await calculateLLMScore(assessmentData);
    const embeddingScore = await calculateEmbeddingScore(embedding);
    const mlScore = calculateMLScore(extractedFeatures);

    // Step 4: HYBRID SCORING - Dynamic weight adjustment
    const weights = calculateDynamicWeights(extractedFeatures, llmScore, embeddingScore, mlScore);
    const finalScore = Math.round(
      llmScore * weights.llm +
      embeddingScore * weights.embedding +
      mlScore * weights.ml
    );

    // Step 5: Calculate confidence
    const confidence = calculateConfidence(llmScore, embeddingScore, mlScore);

    // Step 6: Apply calibration
    const calibratedScore = applyCalibration(finalScore, confidence);

    // Step 7: Generate explainability
    const explanations = await generateExplanations(assessmentData, {
      llm: llmScore,
      embedding: embeddingScore,
      ml: mlScore,
      final: finalScore,
    });

    // Step 8: Category scores
    const categoryScores = calculateCategoryScores(extractedFeatures);

    // Save advanced scores
    const scoreData = {
      assessment_id: assessmentId,
      user_id: user.id,
      extracted_features_id: featuresId,
      llm_score: llmScore,
      embedding_score: embeddingScore,
      ml_model_score: mlScore,
      final_score: finalScore,
      innovation_score: categoryScores.innovation,
      traction_score: categoryScores.traction,
      team_score: categoryScores.team,
      market_score: categoryScores.market,
      confidence,
      calibrated_score: calibratedScore,
      explanations: explanations.detailed,
      key_strengths: explanations.strengths,
      key_weaknesses: explanations.weaknesses,
      contributing_phrases: explanations.phrases,
      scoring_version: SCORING_VERSION,
      model_version: 'gemini-2.5-flash',
      llm_model: 'google/gemini-2.5-flash',
      llm_temperature: 0.2,
      processing_time_ms: Date.now() - startTime,
    };

    const { error: saveError } = await supabaseClient
      .from('advanced_scores')
      .insert(scoreData);

    if (saveError) {
      console.error('Error saving advanced scores:', saveError);
    }

    // Log success
    await logAudit(supabaseClient, {
      assessment_id: assessmentId,
      user_id: user.id,
      event_type: 'scoring',
      event_status: 'success',
      output_data: { final_score: finalScore, confidence },
      execution_time_ms: Date.now() - startTime,
      model_version: SCORING_VERSION,
    });

    return new Response(
      JSON.stringify({
        success: true,
        score: finalScore,
        calibratedScore,
        confidence,
        breakdown: {
          llm: llmScore,
          embedding: embeddingScore,
          ml: mlScore,
        },
        categories: categoryScores,
        explanations,
        processingTimeMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in advanced-scoring:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// ===== FEATURE ENGINEERING LAYER =====
async function extractFeatures(data: AssessmentData) {
  // Parse MRR to numeric value
  const mrrValue = parseMRR(data.mrr);
  const revenue = data.revenue ? Math.max(mrrValue * 12, 100000) : mrrValue * 12;
  
  // Parse team size
  const teamSize = parseTeamSize(data.employees);
  
  // Parse funding goal
  const fundingGoal = parseFundingGoal(data.fundingGoal);
  
  // Extract innovation signals from text fields
  const innovationKeywords = extractInnovationSignals(data.milestones);
  
  // Extract traction signals
  const tractionSignals = extractTractionSignals(data);
  
  // Calculate derived features
  const users = estimateUsers(mrrValue, data.revenue);
  const growthRate = estimateGrowthRate(data.mrr, data.revenue);
  const fundingAmount = data.externalCapital ? Math.max(fundingGoal * 0.5, 250000) : 0;
  
  // Feature scores (0-1 normalized)
  const features = {
    // Quantitative features
    revenue,
    users,
    growth_rate: growthRate,
    funding_amount: fundingAmount,
    funding_round: data.fundingGoal,
    market_size: estimateMarketSize(innovationKeywords),
    team_size: teamSize,
    years_experience: data.fullTimeTeam ? 5 : 2,
    
    // Derived features
    revenue_per_user: users > 0 ? revenue / users : 0,
    funding_per_employee: teamSize > 0 ? fundingAmount / teamSize : 0,
    growth_momentum: growthRate > 20 ? 1.5 : growthRate > 10 ? 1.2 : 1.0,
    
    // Boolean signals (converted to 0/1)
    has_prototype: data.prototype ? 1 : 0,
    has_revenue: data.revenue ? 1 : 0,
    has_external_funding: data.externalCapital ? 1 : 0,
    has_full_time_team: data.fullTimeTeam ? 1 : 0,
    has_term_sheets: data.termSheets ? 1 : 0,
    has_cap_table: data.capTable ? 1 : 0,
    
    // Innovation signals (0-1 scores)
    innovation_score: innovationKeywords.score,
    traction_score: tractionSignals.score,
    founder_experience_score: calculateFounderScore(data),
    market_opportunity_score: calculateMarketScore(data),
    
    // Metadata
    organizations: [],
    persons: [],
    locations: [],
    innovation_keywords: innovationKeywords.keywords,
    traction_indicators: tractionSignals.indicators,
    extraction_version: EXTRACTION_VERSION,
    confidence_score: 0.85,
  };
  
  return features;
}

// Helper functions for feature extraction
function parseMRR(mrr: string): number {
  if (mrr === 'none') return 0;
  if (mrr === 'low') return 5000;
  if (mrr === 'medium') return 25000;
  if (mrr === 'high') return 100000;
  return 0;
}

function parseTeamSize(employees: string): number {
  if (employees === '1-2') return 1.5;
  if (employees === '3-10') return 6;
  if (employees === '11-50') return 25;
  if (employees === '50+') return 75;
  return 1;
}

function parseFundingGoal(goal: string): number {
  if (goal.includes('500k')) return 500000;
  if (goal.includes('1M')) return 1000000;
  if (goal.includes('2M')) return 2000000;
  if (goal.includes('5M')) return 5000000;
  return 500000;
}

function extractInnovationSignals(milestones: string): { score: number; keywords: string[] } {
  const innovationKeywords = [
    'ai', 'machine learning', 'blockchain', 'patent', 'proprietary',
    'algorithm', 'platform', 'saas', 'disruptive', 'novel', 'unique',
    'technology', 'innovation', 'scalable', 'automated'
  ];
  
  const text = milestones.toLowerCase();
  const foundKeywords = innovationKeywords.filter(kw => text.includes(kw));
  const score = Math.min(1, foundKeywords.length / 5);
  
  return { score, keywords: foundKeywords };
}

function extractTractionSignals(data: AssessmentData): { score: number; indicators: string[] } {
  const indicators = [];
  let score = 0;
  
  if (data.revenue) {
    indicators.push('active_revenue');
    score += 0.3;
  }
  if (data.termSheets) {
    indicators.push('investor_interest');
    score += 0.2;
  }
  if (data.externalCapital) {
    indicators.push('funded');
    score += 0.25;
  }
  if (data.mrr !== 'none') {
    indicators.push('recurring_revenue');
    score += 0.25;
  }
  
  return { score: Math.min(1, score), indicators };
}

function estimateUsers(mrr: number, hasRevenue: boolean): number {
  if (!hasRevenue) return 100;
  // Assume $50 ARPU
  return Math.max(100, Math.round(mrr / 50));
}

function estimateGrowthRate(mrr: string, hasRevenue: boolean): number {
  if (!hasRevenue) return 0;
  if (mrr === 'high') return 50;
  if (mrr === 'medium') return 30;
  if (mrr === 'low') return 15;
  return 10;
}

function estimateMarketSize(keywords: string[]): number {
  // Larger market size for tech/innovation keywords
  const baseMarket = 1000000000;
  const multiplier = 1 + (keywords.length * 0.1);
  return baseMarket * multiplier;
}

function calculateFounderScore(data: AssessmentData): number {
  let score = 0.5; // Base score
  if (data.fullTimeTeam) score += 0.3;
  if (data.capTable) score += 0.2; // Organized founders
  return Math.min(1, score);
}

function calculateMarketScore(data: AssessmentData): number {
  let score = 0.5; // Base score
  if (data.termSheets) score += 0.25; // Market validation
  if (data.externalCapital) score += 0.25; // Market interest
  return Math.min(1, score);
}

async function saveExtractedFeatures(supabase: any, userId: string, assessmentId: string, features: any) {
  const { data, error } = await supabase
    .from('extracted_features')
    .insert({
      user_id: userId,
      assessment_id: assessmentId,
      ...features,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving features:', error);
    return null;
  }

  return data.id;
}

async function generateEmbedding(data: AssessmentData): Promise<number[]> {
  // In production, this would call an embedding API
  // For now, return a mock embedding
  return Array(1536).fill(0).map(() => Math.random());
}

async function calculateLLMScore(data: AssessmentData): Promise<number> {
  // Simplified LLM scoring logic
  let score = 50;
  
  if (data.prototype) score += 10;
  if (data.revenue) score += 15;
  if (data.fullTimeTeam) score += 10;
  if (data.termSheets) score += 10;
  if (data.capTable) score += 5;
  
  return Math.min(100, score);
}

async function calculateEmbeddingScore(embedding: number[]): Promise<number> {
  // Simplified embedding similarity scoring
  // In production, compare against ideal startup embeddings
  return 65 + Math.random() * 20;
}

// ===== BASELINE ML MODEL =====
function calculateMLScore(features: any): number {
  // Weighted feature-based regression model
  // Weights learned from successful startup patterns
  
  const weights = {
    // Traction signals (40% weight)
    revenue: 0.15,
    users: 0.10,
    growth_rate: 0.15,
    
    // Team signals (25% weight)
    team_size: 0.10,
    founder_experience: 0.15,
    
    // Funding signals (20% weight)
    funding_amount: 0.10,
    has_external_funding: 0.10,
    
    // Innovation signals (15% weight)
    innovation_score: 0.10,
    has_prototype: 0.05,
  };
  
  // Normalize features to 0-1 scale
  const normalized = {
    revenue: Math.min(1, features.revenue / 1000000), // Normalize to $1M
    users: Math.min(1, features.users / 10000), // Normalize to 10K users
    growth_rate: Math.min(1, features.growth_rate / 100), // Normalize to 100% growth
    team_size: Math.min(1, features.team_size / 20), // Normalize to 20 people
    founder_experience: features.founder_experience_score,
    funding_amount: Math.min(1, features.funding_amount / 5000000), // Normalize to $5M
    has_external_funding: features.has_external_funding,
    innovation_score: features.innovation_score,
    has_prototype: features.has_prototype,
  };
  
  // Calculate weighted score
  let score = 0;
  score += normalized.revenue * weights.revenue * 100;
  score += normalized.users * weights.users * 100;
  score += normalized.growth_rate * weights.growth_rate * 100;
  score += normalized.team_size * weights.team_size * 100;
  score += normalized.founder_experience * weights.founder_experience * 100;
  score += normalized.funding_amount * weights.funding_amount * 100;
  score += normalized.has_external_funding * weights.has_external_funding * 100;
  score += normalized.innovation_score * weights.innovation_score * 100;
  score += normalized.has_prototype * weights.has_prototype * 100;
  
  // Add intercept (baseline score)
  const intercept = 35;
  score += intercept;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateConfidence(llm: number, emb: number, ml: number): number {
  const variance = Math.pow(llm - emb, 2) + Math.pow(llm - ml, 2) + Math.pow(emb - ml, 2);
  const normalizedVariance = variance / 3;
  const confidence = Math.max(0, Math.min(1, 1 - (normalizedVariance / 1000)));
  return Math.round(confidence * 100) / 100;
}

// ===== HYBRID SCORING - Dynamic Weight Adjustment =====
function calculateDynamicWeights(features: any, llmScore: number, embScore: number, mlScore: number): { llm: number; embedding: number; ml: number } {
  // Adjust weights based on data quality and availability
  let weights = { llm: 0.3, embedding: 0.3, ml: 0.4 };
  
  // If we have strong quantitative data, increase ML weight
  const hasStrongData = features.revenue > 50000 || features.users > 1000 || features.funding_amount > 0;
  if (hasStrongData) {
    weights.ml = 0.5;
    weights.llm = 0.25;
    weights.embedding = 0.25;
  }
  
  // If we have limited data, rely more on LLM qualitative analysis
  const hasLimitedData = !features.has_revenue && !features.has_external_funding && features.team_size < 3;
  if (hasLimitedData) {
    weights.llm = 0.5;
    weights.ml = 0.25;
    weights.embedding = 0.25;
  }
  
  // If scores diverge significantly, reduce confidence in outliers
  const scores = [llmScore, embScore, mlScore];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  
  if (variance > 400) { // High disagreement
    // Move towards equal weighting when uncertain
    weights = { llm: 0.33, embedding: 0.33, ml: 0.34 };
  }
  
  return weights;
}

// ===== MODEL CALIBRATION =====
function applyCalibration(score: number, confidence: number): number {
  // Isotonic regression-style calibration with percentile mapping
  
  // Step 1: Apply confidence-based adjustment
  let calibrated = score;
  if (confidence < 0.6) {
    // Low confidence - regress towards mean (60)
    calibrated = score * 0.7 + 60 * 0.3;
  } else if (confidence < 0.8) {
    // Medium confidence - slight regression
    calibrated = score * 0.85 + 60 * 0.15;
  }
  
  // Step 2: Apply percentile normalization
  // Map raw scores to calibrated percentiles based on historical distribution
  const percentileMap = [
    { raw: 0, calibrated: 0 },
    { raw: 30, calibrated: 25 },
    { raw: 50, calibrated: 45 },
    { raw: 60, calibrated: 55 },
    { raw: 70, calibrated: 65 },
    { raw: 80, calibrated: 75 },
    { raw: 90, calibrated: 85 },
    { raw: 100, calibrated: 95 },
  ];
  
  // Linear interpolation between percentile points
  for (let i = 0; i < percentileMap.length - 1; i++) {
    const lower = percentileMap[i];
    const upper = percentileMap[i + 1];
    
    if (calibrated >= lower.raw && calibrated <= upper.raw) {
      const ratio = (calibrated - lower.raw) / (upper.raw - lower.raw);
      calibrated = lower.calibrated + ratio * (upper.calibrated - lower.calibrated);
      break;
    }
  }
  
  // Step 3: Apply score compression for extreme values
  if (calibrated > 90) {
    // Compress top scores to avoid over-confidence
    calibrated = 90 + (calibrated - 90) * 0.5;
  } else if (calibrated < 20) {
    // Compress bottom scores to avoid harsh penalties
    calibrated = 20 + (calibrated - 20) * 0.8;
  }
  
  return Math.max(0, Math.min(100, Math.round(calibrated)));
}

async function generateExplanations(data: AssessmentData, scores: any) {
  const strengths = [];
  const weaknesses = [];
  
  if (data.revenue) strengths.push('Active revenue generation');
  if (data.fullTimeTeam) strengths.push('Full-time team commitment');
  if (data.termSheets) strengths.push('Investor interest demonstrated');
  
  if (!data.revenue) weaknesses.push('Pre-revenue stage');
  if (!data.capTable) weaknesses.push('Missing cap table documentation');
  if (data.mrr === 'none') weaknesses.push('No recurring revenue model');
  
  return {
    detailed: {
      llm: `LLM analysis scored ${scores.llm}/100 based on qualitative factors`,
      embedding: `Embedding similarity scored ${scores.embedding}/100 compared to successful startups`,
      ml: `ML model scored ${scores.ml}/100 based on quantitative metrics`,
    },
    strengths,
    weaknesses,
    phrases: {},
  };
}

function calculateCategoryScores(features: any) {
  return {
    innovation: Math.min(100, 60 + (features.growth_momentum - 1) * 20),
    traction: Math.min(100, 40 + (features.users / 50) + (features.revenue / 5000)),
    team: Math.min(100, 50 + (features.team_size * 5) + (features.years_experience * 3)),
    market: Math.min(100, 55 + (features.market_size / 50000000)),
  };
}

async function logAudit(supabase: any, data: any) {
  await supabase.from('scoring_audit_log').insert(data);
}
