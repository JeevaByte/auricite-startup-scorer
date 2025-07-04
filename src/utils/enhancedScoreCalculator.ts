import { calculateScore } from './scoreCalculator';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { 
  calculateSectorSpecificScore, 
  determineSectorFromAssessment, 
  determineStageFromAssessment, 
  getSectorSpecificWeights 
} from './sectorSpecificScoring';

export interface InvestorReadinessLevel {
  level: string;
  description: string;
  color: string;
  confidence: string;
}

export const getInvestorReadinessLevel = (totalScore: number): InvestorReadinessLevel => {
  if (totalScore >= 800) {
    return {
      level: "Investor Ready",
      description: "Your startup demonstrates exceptional readiness for investment with strong fundamentals across all areas.",
      color: "text-green-600",
      confidence: "Very High"
    };
  } else if (totalScore >= 700) {
    return {
      level: "Nearly Ready",
      description: "Your startup shows strong potential with most key areas well-developed. Focus on addressing remaining gaps.",
      color: "text-blue-600",
      confidence: "High"
    };
  } else if (totalScore >= 600) {
    return {
      level: "Developing",
      description: "Your startup has good foundations but needs improvement in several key areas before seeking investment.",
      color: "text-yellow-600",
      confidence: "Medium"
    };
  } else if (totalScore >= 400) {
    return {
      level: "Early Stage",
      description: "Your startup is in early development. Focus on building core fundamentals before approaching investors.",
      color: "text-orange-600",
      confidence: "Low"
    };
  } else {
    return {
      level: "Pre-Investment",
      description: "Your startup needs significant development across multiple areas before being investment-ready.",
      color: "text-red-600",
      confidence: "Very Low"
    };
  }
};

export const calculateEnhancedScore = (data: AssessmentData): ScoreResult => {
  // Determine sector and stage
  const sector = determineSectorFromAssessment(data);
  const stage = determineStageFromAssessment(data);
  
  console.log(`Detected sector: ${sector}, stage: ${stage}`);

  // Get sector-specific weights
  const weights = getSectorSpecificWeights(sector, stage);
  
  console.log('Using weights:', weights);

  // Business Idea scoring with sector considerations
  let businessIdeaScore = 0;
  let businessIdeaExplanation = '';

  if (data.prototype) {
    businessIdeaScore += sector === 'FinTech' ? 70 : 60; // FinTech values MVP more
    businessIdeaExplanation = `Strong ${sector} prototype foundation`;
  } else {
    businessIdeaScore += 25;
    businessIdeaExplanation = `${sector} needs validated prototype`;
  }

  // Add sector-specific business idea adjustments
  if (sector === 'HealthTech' && data.milestones) {
    businessIdeaScore += 15; // Regulatory planning important
    businessIdeaExplanation += ', regulatory awareness shown';
  }

  businessIdeaScore = Math.min(businessIdeaScore, 100);

  // Financials scoring with sector considerations
  let financialsScore = 0;
  let financialsExplanation = '';

  if (data.revenue) {
    financialsScore += sector === 'E-commerce' ? 50 : 40;
    financialsExplanation = `${sector} revenue generation`;
  } else {
    financialsScore += sector === 'B2C Consumer' ? 20 : 15;
    financialsExplanation = `Pre-revenue ${sector} stage`;
  }

  // MRR considerations by sector
  const mrrMultiplier = sector === 'B2B SaaS' ? 1.2 : 1.0;
  switch (data.mrr) {
    case 'high':
      financialsScore += Math.floor(45 * mrrMultiplier);
      financialsExplanation += ', strong recurring revenue';
      break;
    case 'medium':
      financialsScore += Math.floor(35 * mrrMultiplier);
      financialsExplanation += ', solid recurring revenue';
      break;
    case 'low':
      financialsScore += Math.floor(25 * mrrMultiplier);
      financialsExplanation += ', early recurring revenue';
      break;
    default:
      financialsScore += 10;
      financialsExplanation += ', no recurring revenue';
  }

  if (data.capTable) {
    financialsScore += 20;
    financialsExplanation += ', documented ownership';
  }

  financialsScore = Math.min(financialsScore, 100);

  // Team scoring with sector considerations
  let teamScore = 0;
  let teamExplanation = '';

  if (data.fullTimeTeam) {
    teamScore += sector === 'HealthTech' ? 70 : 60; // HealthTech values commitment more
    teamExplanation = `Full-time ${sector} team`;
  } else {
    teamScore += 30;
    teamExplanation = `Part-time ${sector} team`;
  }

  // Employee count with sector context
  switch (data.employees) {
    case '11-50':
      teamScore += sector === 'FinTech' ? 45 : 40; // FinTech needs more people
      teamExplanation += ', established team size';
      break;
    case '3-10':
      teamScore += 35;
      teamExplanation += ', growing team';
      break;
    case '1-2':
      teamScore += 20;
      teamExplanation += ', founding team';
      break;
    default:
      teamScore += 50; // 50+ employees
      teamExplanation += ', large organization';
  }

  teamScore = Math.min(teamScore, 100);

  // Traction scoring with sector considerations
  let tractionScore = 0;
  let tractionExplanation = '';

  if (data.termSheets) {
    tractionScore += 55;
    tractionExplanation = 'Term sheets received';
  } else {
    tractionScore += 25;
    tractionExplanation = 'No term sheets yet';
  }

  // Investor type relevance by sector
  switch (data.investors) {
    case 'vc':
      tractionScore += sector === 'B2B SaaS' ? 45 : 40;
      tractionExplanation += ', VC engagement';
      break;
    case 'angels':
      tractionScore += 35;
      tractionExplanation += ', angel interest';
      break;
    case 'lateStage':
      tractionScore += 40;
      tractionExplanation += ', late-stage interest';
      break;
    default:
      tractionScore += 15;
      tractionExplanation += ', early investor engagement';
  }

  tractionScore = Math.min(tractionScore, 100);

  // Calculate sector-specific total score
  const totalScore = calculateSectorSpecificScore(
    businessIdeaScore,
    financialsScore,
    teamScore,
    tractionScore,
    sector,
    stage
  );

  return {
    businessIdea: businessIdeaScore,
    businessIdeaExplanation: businessIdeaExplanation.charAt(0).toUpperCase() + businessIdeaExplanation.slice(1),
    financials: financialsScore,
    financialsExplanation: financialsExplanation.charAt(0).toUpperCase() + financialsExplanation.slice(1),
    team: teamScore,
    teamExplanation: teamExplanation.charAt(0).toUpperCase() + teamExplanation.slice(1),
    traction: tractionScore,
    tractionExplanation: tractionExplanation.charAt(0).toUpperCase() + tractionExplanation.slice(1),
    totalScore
  };
};
