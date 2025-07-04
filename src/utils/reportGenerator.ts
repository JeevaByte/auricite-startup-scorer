import { supabase } from '@/integrations/supabase/client';
import { ScoreResult } from '@/utils/scoreCalculator';
import { AssessmentData } from '@/utils/scoreCalculator';
import { RecommendationsData } from './recommendationsService';

export interface ReportData {
  assessment: AssessmentData;
  scores: ScoreResult;
  recommendations?: RecommendationsData;
  generatedAt: string;
}

export const generateReportData = (
  assessmentData: AssessmentData,
  scoreResult: ScoreResult,
  recommendations?: RecommendationsData
): ReportData => {
  return {
    assessment: assessmentData,
    scores: scoreResult,
    recommendations: recommendations,
    generatedAt: new Date().toISOString(),
  };
};

// Function to convert ReportData to JSON for download
export const downloadAsJSON = (reportData: ReportData, filename: string) => {
  const jsonString = JSON.stringify(reportData, null, 2);
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

// Function to convert ReportData to CSV for download
export const downloadAsCSV = (reportData: ReportData, filename: string) => {
  const assessmentData = reportData.assessment;
  const scoreResult = reportData.scores;
  
  // Helper function to sanitize CSV field values
  const sanitizeField = (field: any): string => {
    if (field === null || field === undefined) {
      return '';
    }
    let fieldValue = String(field);
    fieldValue = fieldValue.replace(/"/g, '""'); // Escape double quotes
    return `"${fieldValue}"`; // Enclose in double quotes
  };

  // CSV Header
  let csvContent = "Category,Subcategory,Value\r\n";

  // Assessment Data
  csvContent += `Assessment,Prototype,${sanitizeField(assessmentData.prototype)}\r\n`;
  csvContent += `Assessment,External Capital,${sanitizeField(assessmentData.externalCapital)}\r\n`;
  csvContent += `Assessment,Revenue,${sanitizeField(assessmentData.revenue)}\r\n`;
  csvContent += `Assessment,Full Time Team,${sanitizeField(assessmentData.fullTimeTeam)}\r\n`;
  csvContent += `Assessment,Term Sheets,${sanitizeField(assessmentData.termSheets)}\r\n`;
  csvContent += `Assessment,Cap Table,${sanitizeField(assessmentData.capTable)}\r\n`;
  csvContent += `Assessment,MRR,${sanitizeField(assessmentData.mrr)}\r\n`;
  csvContent += `Assessment,Employees,${sanitizeField(assessmentData.employees)}\r\n`;
  csvContent += `Assessment,Funding Goal,${sanitizeField(assessmentData.fundingGoal)}\r\n`;
  csvContent += `Assessment,Investors,${sanitizeField(assessmentData.investors)}\r\n`;
  csvContent += `Assessment,Milestones,${sanitizeField(assessmentData.milestones)}\r\n`;

  // Score Result Data
  csvContent += `Scores,Business Idea,${sanitizeField(scoreResult.businessIdea)}\r\n`;
  csvContent += `Scores,Financials,${sanitizeField(scoreResult.financials)}\r\n`;
  csvContent += `Scores,Team,${sanitizeField(scoreResult.team)}\r\n`;
  csvContent += `Scores,Traction,${sanitizeField(scoreResult.traction)}\r\n`;
  csvContent += `Scores,Total Score,${sanitizeField(scoreResult.totalScore)}\r\n`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
