
import { ScoreResult, AssessmentData } from '@/pages/Index';
import { RecommendationsData } from '@/utils/recommendationsService';

export const generateReportData = (
  assessmentData: AssessmentData,
  scoreResult: ScoreResult,
  recommendations?: RecommendationsData
) => {
  const reportData = {
    title: 'Startup Investment Readiness Report',
    generatedAt: new Date().toLocaleDateString(),
    totalScore: scoreResult.totalScore,
    grade: getScoreGrade(scoreResult.totalScore),
    categories: [
      {
        name: 'Business Idea',
        score: scoreResult.businessIdea,
        explanation: scoreResult.businessIdeaExplanation,
        recommendations: recommendations?.businessIdea || []
      },
      {
        name: 'Financials',
        score: scoreResult.financials,
        explanation: scoreResult.financialsExplanation,
        recommendations: recommendations?.financials || []
      },
      {
        name: 'Team',
        score: scoreResult.team,
        explanation: scoreResult.teamExplanation,
        recommendations: recommendations?.team || []
      },
      {
        name: 'Traction',
        score: scoreResult.traction,
        explanation: scoreResult.tractionExplanation,
        recommendations: recommendations?.traction || []
      }
    ],
    assessmentDetails: {
      prototype: assessmentData.prototype ? 'Yes' : 'No',
      externalCapital: assessmentData.externalCapital ? 'Yes' : 'No',
      revenue: assessmentData.revenue ? 'Yes' : 'No',
      fullTimeTeam: assessmentData.fullTimeTeam ? 'Yes' : 'No',
      termSheets: assessmentData.termSheets ? 'Yes' : 'No',
      capTable: assessmentData.capTable ? 'Yes' : 'No',
      mrr: formatMrrValue(assessmentData.mrr),
      employees: formatEmployeesValue(assessmentData.employees),
      fundingGoal: formatFundingGoalValue(assessmentData.fundingGoal),
      investors: formatInvestorsValue(assessmentData.investors),
      milestones: formatMilestonesValue(assessmentData.milestones)
    }
  };

  return reportData;
};

const getScoreGrade = (score: number) => {
  if (score >= 800) return 'A+';
  if (score >= 700) return 'A';
  if (score >= 600) return 'B+';
  if (score >= 500) return 'B';
  if (score >= 400) return 'C+';
  if (score >= 300) return 'C';
  return 'D';
};

const formatMrrValue = (mrr: string | null) => {
  const mrrMap = {
    'none': 'No MRR',
    'low': 'Low ($1K-$10K)',
    'medium': 'Medium ($10K-$100K)',
    'high': 'High ($100K+)'
  };
  return mrr ? mrrMap[mrr as keyof typeof mrrMap] : 'Not specified';
};

const formatEmployeesValue = (employees: string | null) => {
  const employeesMap = {
    '1-2': '1-2 employees',
    '3-10': '3-10 employees',
    '11-50': '11-50 employees',
    '50+': '50+ employees'
  };
  return employees ? employeesMap[employees as keyof typeof employeesMap] : 'Not specified';
};

const formatFundingGoalValue = (fundingGoal: string | null) => {
  const fundingGoalMap = {
    'mvp': 'Build MVP',
    'productMarketFit': 'Achieve Product-Market Fit',
    'scale': 'Scale Operations',
    'exit': 'Prepare for Exit'
  };
  return fundingGoal ? fundingGoalMap[fundingGoal as keyof typeof fundingGoalMap] : 'Not specified';
};

const formatInvestorsValue = (investors: string | null) => {
  const investorsMap = {
    'none': 'No investors yet',
    'angels': 'Angel investors',
    'vc': 'VC firms',
    'lateStage': 'Late-stage investors'
  };
  return investors ? investorsMap[investors as keyof typeof investorsMap] : 'Not specified';
};

const formatMilestonesValue = (milestones: string | null) => {
  const milestonesMap = {
    'concept': 'Concept stage',
    'launch': 'Launch stage',
    'scale': 'Scale stage',
    'exit': 'Exit stage'
  };
  return milestones ? milestonesMap[milestones as keyof typeof milestonesMap] : 'Not specified';
};

export const downloadAsJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAsCSV = (data: any, filename: string) => {
  const csvContent = generateCSVContent(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateCSVContent = (data: any) => {
  const headers = ['Category', 'Score', 'Explanation', 'Recommendations'];
  const rows = data.categories.map((category: any) => [
    category.name,
    category.score,
    `"${category.explanation.replace(/"/g, '""')}"`,
    `"${category.recommendations.join('; ').replace(/"/g, '""')}"`
  ]);
  
  const csvContent = [
    `Investment Readiness Report - Generated on ${data.generatedAt}`,
    `Total Score: ${data.totalScore}/999 (Grade: ${data.grade})`,
    '',
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};
