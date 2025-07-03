import { AssessmentData } from '@/pages/Index';
import { ScoreResult } from '@/utils/scoreCalculator';

interface ScoreWeights {
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  businessIdea: 0.30, // 30%
  financials: 0.25,   // 25%
  team: 0.25,         // 25%
  traction: 0.20      // 20%
};

export const calculateDynamicScore = (data: AssessmentData, weights: ScoreWeights = DEFAULT_WEIGHTS): ScoreResult => {
  // Validate that all required fields are present
  const requiredFields = ['prototype', 'revenue', 'mrr', 'capTable', 'fullTimeTeam', 'employees', 'milestones', 'fundingGoal', 'termSheets', 'investors', 'externalCapital'];
  const missingFields = requiredFields.filter(field => data[field as keyof AssessmentData] === null || data[field as keyof AssessmentData] === undefined);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Calculate Business Idea Score (0-100)
  const businessIdeaResult = calculateBusinessIdeaScore(data);
  
  // Calculate Financials Score (0-100)
  const financialsResult = calculateFinancialsScore(data);
  
  // Calculate Team Score (0-100)
  const teamResult = calculateTeamScore(data);
  
  // Calculate Traction Score (0-100)
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
  const factors: string[] = [];

  // Prototype evaluation (50% of business idea score)
  if (data.prototype) {
    score += 50;
    factors.push('working prototype demonstrates feasibility');
  } else {
    score += 15;
    factors.push('concept stage without prototype limits validation');
  }

  // Milestone evaluation (50% of business idea score)
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

  // Cap at 100
  score = Math.min(score, 100);
  
  const explanation = `Business idea scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}

function calculateFinancialsScore(data: AssessmentData): { score: number; explanation: string } {
  let score = 0;
  const factors: string[] = [];

  // Revenue evaluation (35% of financials score)
  if (data.revenue) {
    score += 35;
    factors.push('active revenue generation');
  } else {
    score += 10;
    factors.push('pre-revenue stage');
  }

  // MRR evaluation (40% of financials score)
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

  // Cap table (15% of financials score)
  if (data.capTable) {
    score += 15;
    factors.push('documented ownership structure');
  } else {
    factors.push('missing cap table documentation reduces investor confidence');
  }

  // External capital consideration (10% of financials score)
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

  // Full-time commitment (60% of team score)
  if (data.fullTimeTeam) {
    score += 60;
    factors.push('full-time team commitment shows dedication');
  } else {
    score += 20;
    factors.push('part-time commitment may limit execution speed');
  }

  // Team size evaluation (40% of team score)
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

  // Term sheets evaluation (50% of traction score)
  if (data.termSheets) {
    score += 50;
    factors.push('term sheets received show serious investor interest');
  } else {
    score += 15;
    factors.push('no term sheets yet but may be appropriate for current stage');
  }

  // Investor engagement (40% of traction score)
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

  // Funding goal alignment (10% of traction score)
  if (data.fundingGoal) {
    score += 10;
    factors.push('clear funding strategy');
  }

  score = Math.min(score, 100);
  
  const explanation = `Market traction scored ${score}/100. Key factors: ${factors.join(', ')}.`;
  
  return { score, explanation };
}

export const getInvestmentReadinessLevel = (totalScore: number) => {
  if (totalScore >= 750) return {
    level: 'Investment Ready',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Your startup demonstrates strong investment readiness across all key areas',
    nextSteps: ['Prepare investor pitch deck', 'Schedule investor meetings', 'Finalize legal documentation']
  };
  
  if (totalScore >= 600) return {
    level: 'Nearly Ready',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Strong foundation with some areas for improvement before approaching investors',
    nextSteps: ['Address lowest scoring areas', 'Strengthen financial metrics', 'Build additional traction']
  };
  
  if (totalScore >= 400) return {
    level: 'Developing',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Good progress but significant development needed before investment readiness',
    nextSteps: ['Focus on product development', 'Build team capabilities', 'Establish revenue streams']
  };
  
  return {
    level: 'Early Stage',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Early stage startup with foundational work needed across multiple areas',
    nextSteps: ['Develop MVP or prototype', 'Build founding team', 'Validate market demand']
  };
};
