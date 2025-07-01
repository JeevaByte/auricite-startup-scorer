
import { AssessmentData, ScoreResult } from '@/pages/Index';

interface WeightConfig {
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
}

const DEFAULT_WEIGHTS: WeightConfig = {
  businessIdea: 0.30, // 30%
  financials: 0.25,   // 25%
  team: 0.25,         // 25%
  traction: 0.20      // 20%
};

export const calculateEnhancedScore = (data: AssessmentData, weights: WeightConfig = DEFAULT_WEIGHTS): ScoreResult => {
  // Validate input data
  const hasIncompleteData = Object.values(data).some(val => val === null || val === undefined);
  if (hasIncompleteData) {
    throw new Error('Incomplete assessment data');
  }

  // Business Idea scoring with detailed breakdown
  const businessIdeaResult = calculateBusinessIdeaScore(data);
  
  // Financials scoring with detailed breakdown
  const financialsResult = calculateFinancialsScore(data);
  
  // Team scoring with detailed breakdown
  const teamResult = calculateTeamScore(data);
  
  // Traction scoring with detailed breakdown
  const tractionResult = calculateTractionScore(data);

  // Calculate weighted total score (0-999 scale)
  const totalScore = Math.round(
    (businessIdeaResult.score * weights.businessIdea + 
     financialsResult.score * weights.financials + 
     teamResult.score * weights.team + 
     tractionResult.score * weights.traction) * 9.99
  );

  return {
    businessIdea: businessIdeaResult.score,
    businessIdeaExplanation: businessIdeaResult.explanation,
    financials: financialsResult.score,
    financialsExplanation: financialsResult.explanation,
    team: teamResult.score,
    teamExplanation: teamResult.explanation,
    traction: tractionResult.score,
    tractionExplanation: tractionResult.explanation,
    totalScore
  };
};

function calculateBusinessIdeaScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  let factors: string[] = [];

  // Prototype evaluation (0-60 points)
  if (data.prototype) {
    score += 60;
    factors.push('strong prototype foundation');
  } else {
    score += 20;
    factors.push('concept stage without prototype');
  }

  // Milestone evaluation (0-40 points)
  switch (data.milestones) {
    case 'concept':
      score += 10;
      factors.push('early concept stage');
      break;
    case 'launch':
      score += 30;
      factors.push('MVP launched');
      break;
    case 'scale':
      score += 40;
      factors.push('proven scalable model');
      break;
    case 'exit':
      score += 35;
      factors.push('exit-ready stage');
      break;
  }

  score = Math.min(score, 100);
  
  const explanation = `Score based on ${factors.join(', ')}. ${getImprovementTip('businessIdea', score)}`;
  
  return { score, explanation };
}

function calculateFinancialsScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  let factors: string[] = [];

  // Revenue evaluation (0-40 points)
  if (data.revenue) {
    score += 40;
    factors.push('revenue generating');
  } else {
    score += 15;
    factors.push('pre-revenue stage');
  }

  // MRR evaluation (0-45 points)
  switch (data.mrr) {
    case 'none':
      score += 10;
      factors.push('no recurring revenue');
      break;
    case 'low':
      score += 25;
      factors.push('low MRR established');
      break;
    case 'medium':
      score += 35;
      factors.push('solid MRR growth');
      break;
    case 'high':
      score += 45;
      factors.push('strong MRR performance');
      break;
  }

  // Cap table (0-20 points)
  if (data.capTable) {
    score += 20;
    factors.push('documented cap table');
  } else {
    factors.push('missing cap table documentation');
  }

  // External capital (0-15 points)
  if (data.externalCapital) {
    score += 15;
    factors.push('external funding secured');
  }

  score = Math.min(score, 100);
  
  const explanation = `Financial health based on ${factors.join(', ')}. ${getImprovementTip('financials', score)}`;
  
  return { score, explanation };
}

function calculateTeamScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  let factors: string[] = [];

  // Full-time commitment (0-60 points)
  if (data.fullTimeTeam) {
    score += 60;
    factors.push('full-time committed team');
  } else {
    score += 25;
    factors.push('part-time team commitment');
  }

  // Team size (0-40 points)
  switch (data.employees) {
    case '1-2':
      score += 15;
      factors.push('founding team of 1-2');
      break;
    case '3-10':
      score += 35;
      factors.push('growing team of 3-10');
      break;
    case '11-50':
      score += 40;
      factors.push('established team of 11-50');
      break;
    case '50+':
      score += 30;
      factors.push('large organization 50+');
      break;
  }

  score = Math.min(score, 100);
  
  const explanation = `Team strength based on ${factors.join(', ')}. ${getImprovementTip('team', score)}`;
  
  return { score, explanation };
}

function calculateTractionScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  let factors: string[] = [];

  // Term sheets (0-50 points)
  if (data.termSheets) {
    score += 50;
    factors.push('term sheets received');
  } else {
    score += 20;
    factors.push('no term sheets yet');
  }

  // Investor engagement (0-40 points)
  switch (data.investors) {
    case 'none':
      score += 10;
      factors.push('no investor engagement');
      break;
    case 'angels':
      score += 30;
      factors.push('angel investor interest');
      break;
    case 'vc':
      score += 40;
      factors.push('VC engagement');
      break;
    case 'lateStage':
      score += 35;
      factors.push('late-stage investor interest');
      break;
  }

  // Funding goal alignment (0-10 points)
  if (data.fundingGoal) {
    score += 10;
    factors.push('clear funding strategy');
  }

  score = Math.min(score, 100);
  
  const explanation = `Market traction based on ${factors.join(', ')}. ${getImprovementTip('traction', score)}`;
  
  return { score, explanation };
}

function getImprovementTip(category: string, score: number): string {
  if (score >= 80) return 'Excellent performance in this area.';
  if (score >= 60) return 'Good foundation with room for improvement.';
  if (score >= 40) return 'Focus on strengthening this area for investor readiness.';
  return 'Priority area for immediate improvement.';
}

export const getInvestorReadinessLevel = (totalScore: number) => {
  if (totalScore >= 700) return { 
    level: 'Angel Ready', 
    color: 'text-green-600', 
    description: 'Your startup shows strong signals for angel investment',
    confidence: 'High'
  };
  if (totalScore >= 500) return { 
    level: 'Pre-Seed Ready', 
    color: 'text-blue-600', 
    description: 'Good foundation with room for improvement before approaching angels',
    confidence: 'Medium'
  };
  if (totalScore >= 300) return { 
    level: 'Early Stage', 
    color: 'text-orange-600', 
    description: 'Focus on building traction and strengthening fundamentals',
    confidence: 'Low'
  };
  return { 
    level: 'Foundation Stage', 
    color: 'text-red-600', 
    description: 'Concentrate on core business development before seeking investment',
    confidence: 'Very Low'
  };
};
