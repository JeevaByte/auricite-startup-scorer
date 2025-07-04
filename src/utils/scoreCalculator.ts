
export interface AssessmentData {
  prototype: boolean | null;
  externalCapital: boolean | null;
  revenue: boolean | null;
  fullTimeTeam: boolean | null;
  termSheets: boolean | null;
  capTable: boolean | null;
  mrr: 'none' | 'low' | 'medium' | 'high' | null;
  employees: '1-2' | '3-10' | '11-50' | '50+' | null;
  fundingGoal: string | null;
  investors: 'none' | 'angels' | 'vc' | 'lateStage' | null;
  milestones: 'concept' | 'launch' | 'scale' | 'exit' | null;
}

export interface ScoreResult {
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

export const calculateScore = (data: AssessmentData): ScoreResult => {
  // Validate input data
  const hasIncompleteData = Object.values(data).some(val => val === null || val === undefined);
  if (hasIncompleteData) {
    throw new Error('Incomplete assessment data');
  }

  // Business Idea scoring (30% weight)
  let businessIdeaScore = 0;
  let businessIdeaExplanation = '';

  // Prototype scoring
  if (data.prototype) {
    businessIdeaScore += 60;
    businessIdeaExplanation = 'Strong prototype foundation';
  } else {
    businessIdeaScore += 20;
    businessIdeaExplanation = 'No prototype limits validation';
  }

  // Milestones scoring
  switch (data.milestones) {
    case 'concept':
      businessIdeaScore += 10;
      businessIdeaExplanation += ', early concept stage';
      break;
    case 'launch':
      businessIdeaScore += 30;
      businessIdeaExplanation += ', MVP launched';
      break;
    case 'scale':
      businessIdeaScore += 40;
      businessIdeaExplanation += ', proven model';
      break;
    case 'exit':
      businessIdeaScore += 35;
      businessIdeaExplanation += ', exit preparation';
      break;
  }

  // Cap at 100
  businessIdeaScore = Math.min(businessIdeaScore, 100);

  // Financials scoring (25% weight)
  let financialsScore = 0;
  let financialsExplanation = '';

  // Revenue scoring
  if (data.revenue) {
    financialsScore += 40;
    financialsExplanation = 'Revenue generating';
  } else {
    financialsScore += 15;
    financialsExplanation = 'Pre-revenue stage';
  }

  // MRR scoring
  switch (data.mrr) {
    case 'none':
      financialsScore += 10;
      financialsExplanation += ', no recurring revenue';
      break;
    case 'low':
      financialsScore += 25;
      financialsExplanation += ', low MRR';
      break;
    case 'medium':
      financialsScore += 35;
      financialsExplanation += ', solid MRR';
      break;
    case 'high':
      financialsScore += 45;
      financialsExplanation += ', strong MRR';
      break;
  }

  // Cap table scoring
  if (data.capTable) {
    financialsScore += 20;
    financialsExplanation += ', documented cap table';
  } else {
    financialsExplanation += ', missing cap table';
  }

  // External capital consideration
  if (data.externalCapital) {
    financialsScore += 15;
    financialsExplanation += ', external funding received';
  }

  financialsScore = Math.min(financialsScore, 100);

  // Team scoring (25% weight)
  let teamScore = 0;
  let teamExplanation = '';

  // Full-time team scoring
  if (data.fullTimeTeam) {
    teamScore += 60;
    teamExplanation = 'Full-time committed team';
  } else {
    teamScore += 25;
    teamExplanation = 'Part-time team commitment';
  }

  // Employee count scoring
  switch (data.employees) {
    case '1-2':
      teamScore += 15;
      teamExplanation += ', small founding team';
      break;
    case '3-10':
      teamScore += 35;
      teamExplanation += ', growing team';
      break;
    case '11-50':
      teamScore += 40;
      teamExplanation += ', established team';
      break;
    case '50+':
      teamScore += 30;
      teamExplanation += ', large organization';
      break;
  }

  teamScore = Math.min(teamScore, 100);

  // Traction scoring (20% weight)
  let tractionScore = 0;
  let tractionExplanation = '';

  // Term sheets scoring
  if (data.termSheets) {
    tractionScore += 50;
    tractionExplanation = 'Term sheets received';
  } else {
    tractionScore += 20;
    tractionExplanation = 'No term sheets yet';
  }

  // Investor engagement scoring
  switch (data.investors) {
    case 'none':
      tractionScore += 10;
      tractionExplanation += ', no investor engagement';
      break;
    case 'angels':
      tractionScore += 30;
      tractionExplanation += ', angel investor interest';
      break;
    case 'vc':
      tractionScore += 40;
      tractionExplanation += ', VC engagement';
      break;
    case 'lateStage':
      tractionScore += 35;
      tractionExplanation += ', late-stage interest';
      break;
  }

  tractionScore = Math.min(tractionScore, 100);

  // Calculate total weighted score (0-999 scale)
  const totalScore = Math.round(
    (businessIdeaScore * 0.30 + 
     financialsScore * 0.25 + 
     teamScore * 0.25 + 
     tractionScore * 0.20) * 9.99
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
