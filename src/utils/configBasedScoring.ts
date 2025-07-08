import { supabase } from '@/integrations/supabase/client';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';

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

let cachedConfig: ScoringConfig | null = null;
let configCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getScoringConfig = async (): Promise<ScoringConfig> => {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - configCacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('scoring_config')
      .select('config_data')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching scoring config:', error);
      return getDefaultConfig();
    }

    const config = data.config_data as ScoringConfig;
    
    // Cache the config
    cachedConfig = config;
    configCacheTime = now;
    
    return config;
  } catch (error) {
    console.error('Error loading scoring config:', error);
    return getDefaultConfig();
  }
};

const getDefaultConfig = (): ScoringConfig => ({
  businessIdea: 0.30,
  financials: 0.25,
  team: 0.25,
  traction: 0.20,
  sectors: {
    'B2B SaaS': {
      businessIdea: 0.25,
      financials: 0.30,
      team: 0.25,
      traction: 0.20,
    },
    'B2C Consumer': {
      businessIdea: 0.35,
      financials: 0.20,
      team: 0.20,
      traction: 0.25,
    },
    'FinTech': {
      businessIdea: 0.20,
      financials: 0.35,
      team: 0.30,
      traction: 0.15,
    },
    'HealthTech': {
      businessIdea: 0.30,
      financials: 0.25,
      team: 0.35,
      traction: 0.10,
    },
    'E-commerce': {
      businessIdea: 0.25,
      financials: 0.25,
      team: 0.20,
      traction: 0.30,
    },
  },
});

export const calculateConfigBasedScore = async (data: AssessmentData): Promise<ScoreResult> => {
  const config = await getScoringConfig();
  
  // Determine sector
  const sector = determineSector(data);
  const weights = config.sectors[sector] || {
    businessIdea: config.businessIdea,
    financials: config.financials,
    team: config.team,
    traction: config.traction,
  };

  // Calculate individual scores (keeping existing logic)
  const businessIdeaScore = calculateBusinessIdeaScore(data);
  const financialsScore = calculateFinancialsScore(data);
  const teamScore = calculateTeamScore(data);
  const tractionScore = calculateTractionScore(data);

  // Calculate weighted total score
  const totalScore = Math.round(
    (businessIdeaScore.score * weights.businessIdea + 
     financialsScore.score * weights.financials + 
     teamScore.score * weights.team + 
     tractionScore.score * weights.traction) * 9.99
  );

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
  };
};

function determineSector(data: AssessmentData): string {
  const hasRecurringRevenue = data.mrr !== 'none';
  const hasRevenue = data.revenue;
  const hasB2BIndicators = data.termSheets || (hasRevenue && hasRecurringRevenue);
  
  if (hasB2BIndicators && hasRecurringRevenue) {
    return 'B2B SaaS';
  }
  
  if (data.externalCapital && data.termSheets) {
    return 'FinTech';
  }
  
  if (data.prototype && !hasRevenue) {
    return 'B2C Consumer';
  }
  
  if (hasRevenue && !hasRecurringRevenue) {
    return 'E-commerce';
  }
  
  return 'B2B SaaS';
}

function calculateBusinessIdeaScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  const factors: string[] = [];

  if (data.prototype) {
    score += 50;
    factors.push('working prototype demonstrates feasibility');
  } else {
    score += 15;
    factors.push('concept stage without prototype limits validation');
  }

  switch (data.milestones) {
    case 'concept':
      score += 10;
      factors.push('early concept stage shows potential but needs development');
      break;
    case 'launch':
      score += 30;
      factors.push('MVP launch demonstrates market entry capability');
      break;
    case 'scale':
      score += 40;
      factors.push('scaling stage shows proven market demand');
      break;
    case 'exit':
      score += 35;
      factors.push('exit-ready stage indicates mature business model');
      break;
  }

  score = Math.min(score, 100);
  const explanation = `Business idea scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}

function calculateFinancialsScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  const factors: string[] = [];

  if (data.revenue) {
    score += 35;
    factors.push('active revenue generation');
  } else {
    score += 10;
    factors.push('pre-revenue stage');
  }

  switch (data.mrr) {
    case 'none':
      score += 5;
      factors.push('no recurring revenue model');
      break;
    case 'low':
      score += 20;
      factors.push('established low MRR base');
      break;
    case 'medium':
      score += 30;
      factors.push('solid MRR growth trajectory');
      break;
    case 'high':
      score += 40;
      factors.push('strong MRR performance');
      break;
  }

  if (data.capTable) {
    score += 15;
    factors.push('documented ownership structure');
  } else {
    factors.push('missing cap table documentation reduces investor confidence');
  }

  if (data.externalCapital) {
    score += 10;
    factors.push('previous external funding validates business');
  }

  score = Math.min(score, 100);
  const explanation = `Financial health scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}

function calculateTeamScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  const factors: string[] = [];

  if (data.fullTimeTeam) {
    score += 60;
    factors.push('full-time team commitment shows dedication');
  } else {
    score += 20;
    factors.push('part-time commitment may limit execution speed');
  }

  switch (data.employees) {
    case '1-2':
      score += 15;
      factors.push('small founding team allows for agility but may lack diverse skills');
      break;
    case '3-10':
      score += 35;
      factors.push('optimal team size for startup growth and specialization');
      break;
    case '11-50':
      score += 40;
      factors.push('established team size indicates successful scaling');
      break;
    case '50+':
      score += 25;
      factors.push('large team may indicate later-stage company or potential overhead concerns');
      break;
  }

  score = Math.min(score, 100);
  const explanation = `Team strength scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}

function calculateTractionScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  const factors: string[] = [];

  if (data.termSheets) {
    score += 50;
    factors.push('term sheets received show serious investor interest');
  } else {
    score += 15;
    factors.push('no term sheets yet but may be appropriate for current stage');
  }

  switch (data.investors) {
    case 'none':
      score += 5;
      factors.push('no investor engagement limits funding options');
      break;
    case 'angels':
      score += 25;
      factors.push('angel investor engagement shows initial market validation');
      break;
    case 'vc':
      score += 35;
      factors.push('VC engagement indicates scaling potential');
      break;
    case 'lateStage':
      score += 40;
      factors.push('late-stage investor interest shows proven business model');
      break;
  }

  if (data.fundingGoal) {
    score += 10;
    factors.push('clear funding strategy');
  }

  score = Math.min(score, 100);
  const explanation = `Market traction scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}
