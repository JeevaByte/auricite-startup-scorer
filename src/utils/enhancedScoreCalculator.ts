
import { AssessmentData, ScoreResult } from '@/pages/Index';
import { 
  determineSectorFromAssessment, 
  determineStageFromAssessment, 
  calculateSectorSpecificScore 
} from './sectorSpecificScoring';

export const calculateEnhancedScore = (data: AssessmentData): ScoreResult => {
  // Validate input data
  const hasIncompleteData = Object.values(data).some(val => val === null || val === undefined);
  if (hasIncompleteData) {
    throw new Error('Incomplete assessment data');
  }

  // Determine sector and stage for context-aware scoring
  const sector = determineSectorFromAssessment(data);
  const stage = determineStageFromAssessment(data);

  // Business Idea scoring with sector-specific logic
  let businessIdeaScore = 0;
  let businessIdeaExplanation = '';

  if (data.prototype) {
    businessIdeaScore += sector === 'B2C Consumer' ? 70 : 60; // Higher weight for B2C
    businessIdeaExplanation = 'Strong prototype foundation';
  } else {
    businessIdeaScore += 20;
    businessIdeaExplanation = 'No prototype limits validation';
  }

  // Milestone scoring with stage awareness
  switch (data.milestones) {
    case 'concept':
      businessIdeaScore += stage === 'pre-seed' ? 15 : 10;
      businessIdeaExplanation += ', early concept stage';
      break;
    case 'launch':
      businessIdeaScore += 30;
      businessIdeaExplanation += ', MVP launched';
      break;
    case 'scale':
      businessIdeaScore += 40;
      businessIdeaExplanation += ', proven scalable model';
      break;
    case 'exit':
      businessIdeaScore += 35;
      businessIdeaExplanation += ', exit preparation phase';
      break;
  }

  businessIdeaScore = Math.min(businessIdeaScore, 100);

  // Financials scoring with sector-specific emphasis
  let financialsScore = 0;
  let financialsExplanation = '';

  if (data.revenue) {
    financialsScore += sector === 'FinTech' ? 50 : 40; // Higher weight for FinTech
    financialsExplanation = 'Revenue generating';
  } else {
    financialsScore += stage === 'pre-seed' ? 20 : 15;
    financialsExplanation = 'Pre-revenue stage';
  }

  // MRR scoring with B2B SaaS emphasis
  switch (data.mrr) {
    case 'none':
      financialsScore += 10;
      financialsExplanation += ', no recurring revenue';
      break;
    case 'low':
      financialsScore += sector === 'B2B SaaS' ? 30 : 25;
      financialsExplanation += ', low MRR';
      break;
    case 'medium':
      financialsScore += sector === 'B2B SaaS' ? 40 : 35;
      financialsExplanation += ', solid MRR foundation';
      break;
    case 'high':
      financialsScore += sector === 'B2B SaaS' ? 50 : 45;
      financialsExplanation += ', strong recurring revenue';
      break;
  }

  if (data.capTable) {
    financialsScore += 20;
    financialsExplanation += ', documented cap table';
  }

  if (data.externalCapital) {
    financialsScore += sector === 'FinTech' ? 20 : 15;
    financialsExplanation += ', external funding secured';
  }

  financialsScore = Math.min(financialsScore, 100);

  // Team scoring with sector-specific requirements
  let teamScore = 0;
  let teamExplanation = '';

  if (data.fullTimeTeam) {
    teamScore += sector === 'HealthTech' ? 70 : 60; // Higher weight for HealthTech
    teamExplanation = 'Full-time committed team';
  } else {
    teamScore += 25;
    teamExplanation = 'Part-time team commitment';
  }

  switch (data.employees) {
    case '1-2':
      teamScore += stage === 'pre-seed' ? 20 : 15;
      teamExplanation += ', lean founding team';
      break;
    case '3-10':
      teamScore += 35;
      teamExplanation += ', growing team size';
      break;
    case '11-50':
      teamScore += 40;
      teamExplanation += ', established organization';
      break;
    case '50+':
      teamScore += stage === 'seed' ? 35 : 25;
      teamExplanation += ', large team structure';
      break;
  }

  teamScore = Math.min(teamScore, 100);

  // Traction scoring with sector-specific metrics
  let tractionScore = 0;
  let tractionExplanation = '';

  if (data.termSheets) {
    tractionScore += 50;
    tractionExplanation = 'Term sheets received';
  } else {
    tractionScore += stage === 'pre-seed' ? 25 : 20;
    tractionExplanation = 'No term sheets yet';
  }

  switch (data.investors) {
    case 'none':
      tractionScore += 10;
      tractionExplanation += ', no investor engagement';
      break;
    case 'angels':
      tractionScore += sector === 'B2C Consumer' ? 35 : 30;
      tractionExplanation += ', angel investor interest';
      break;
    case 'vc':
      tractionScore += 40;
      tractionExplanation += ', VC engagement active';
      break;
    case 'lateStage':
      tractionScore += stage === 'seed' ? 40 : 35;
      tractionExplanation += ', late-stage investor interest';
      break;
  }

  tractionScore = Math.min(tractionScore, 100);

  // Calculate sector-specific weighted total score
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
