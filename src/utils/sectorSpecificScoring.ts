import { AssessmentData } from '@/pages/Index';
import { ScoreResult } from '@/utils/scoreCalculator';

export interface SectorWeights {
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
}

// Sector-specific weight configurations
export const SECTOR_WEIGHTS: Record<string, SectorWeights> = {
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
  'Default': {
    businessIdea: 0.30,
    financials: 0.25,
    team: 0.25,
    traction: 0.20,
  },
};

// Stage-specific adjustments
export const STAGE_ADJUSTMENTS: Record<string, Partial<SectorWeights>> = {
  'pre-seed': {
    businessIdea: 0.05, // +5% weight on business idea
    team: 0.05, // +5% weight on team
    financials: -0.05, // -5% weight on financials
    traction: -0.05, // -5% weight on traction
  },
  'seed': {
    financials: 0.05, // +5% weight on financials
    traction: 0.05, // +5% weight on traction
    businessIdea: -0.05, // -5% weight on business idea
    team: -0.05, // -5% weight on team
  },
};

export const determineSectorFromAssessment = (data: AssessmentData): string => {
  // Enhanced sector detection logic
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
  
  return 'B2B SaaS'; // Default fallback
};

export const determineStageFromAssessment = (data: AssessmentData): string => {
  const hasExternalFunding = data.externalCapital;
  const hasTermSheets = data.termSheets;
  const hasSignificantRevenue = data.mrr === 'medium' || data.mrr === 'high';
  
  if (hasExternalFunding || hasTermSheets || hasSignificantRevenue) {
    return 'seed';
  }
  
  return 'pre-seed';
};

export const getSectorSpecificWeights = (sector: string, stage: string): SectorWeights => {
  const baseWeights = SECTOR_WEIGHTS[sector] || SECTOR_WEIGHTS['Default'];
  const stageAdjustments = STAGE_ADJUSTMENTS[stage] || {};
  
  return {
    businessIdea: Math.max(0.1, Math.min(0.5, baseWeights.businessIdea + (stageAdjustments.businessIdea || 0))),
    financials: Math.max(0.1, Math.min(0.5, baseWeights.financials + (stageAdjustments.financials || 0))),
    team: Math.max(0.1, Math.min(0.5, baseWeights.team + (stageAdjustments.team || 0))),
    traction: Math.max(0.1, Math.min(0.5, baseWeights.traction + (stageAdjustments.traction || 0))),
  };
};

export const calculateSectorSpecificScore = (
  businessIdea: number,
  financials: number,
  team: number,
  traction: number,
  sector: string,
  stage: string
): number => {
  const weights = getSectorSpecificWeights(sector, stage);
  
  const weightedScore = (
    businessIdea * weights.businessIdea +
    financials * weights.financials +
    team * weights.team +
    traction * weights.traction
  );
  
  // Scale to 0-999 range
  return Math.round(weightedScore * 9.99);
};
