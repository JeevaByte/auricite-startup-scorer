
import { supabase } from '@/integrations/supabase/client';
import { calculateConfigBasedScore } from './configBasedScoring';
import { AssessmentData } from './scoreCalculator';

export interface RescoreResult {
  assessmentId: string;
  oldScore: number;
  newScore: number;
  scoreDifference: number;
  success: boolean;
  error?: string;
}

export const rescoreAssessment = async (
  assessmentId: string,
  useCurrentConfig: boolean = true
): Promise<RescoreResult> => {
  try {
    // Get assessment data
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, scores(*)')
      .eq('id', assessmentId)
      .single();

    if (assessmentError) throw assessmentError;

    // Get current score
    const currentScore = assessment.scores?.[0]?.total_score || 0;

    // Convert assessment to AssessmentData format
    const assessmentData: AssessmentData = {
      prototype: assessment.prototype,
      externalCapital: assessment.external_capital,
      revenue: assessment.revenue,
      fullTimeTeam: assessment.full_time_team,
      termSheets: assessment.term_sheets,
      capTable: assessment.cap_table,
      mrr: assessment.mrr,
      employees: assessment.employees,
      fundingGoal: assessment.funding_goal,
      investors: assessment.investors,
      milestones: assessment.milestones,
    };

    // Calculate new score
    const result = await calculateConfigBasedScore(assessmentData);

    // Update the score
    const { error: updateError } = await supabase
      .from('scores')
      .update({
        business_idea: result.businessIdea,
        business_idea_explanation: result.businessIdeaExplanation,
        financials: result.financials,
        financials_explanation: result.financialsExplanation,
        team: result.team,
        team_explanation: result.teamExplanation,
        traction: result.traction,
        traction_explanation: result.tractionExplanation,
        total_score: result.totalScore,
      })
      .eq('assessment_id', assessmentId);

    if (updateError) throw updateError;

    return {
      assessmentId,
      oldScore: currentScore,
      newScore: result.totalScore,
      scoreDifference: result.totalScore - currentScore,
      success: true
    };
  } catch (error) {
    console.error('Error rescoring assessment:', error);
    return {
      assessmentId,
      oldScore: 0,
      newScore: 0,
      scoreDifference: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const rescoreAllAssessments = async (): Promise<RescoreResult[]> => {
  try {
    // Get all assessments
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('id');

    if (error) throw error;

    const results: RescoreResult[] = [];
    
    // Rescore each assessment
    for (const assessment of assessments || []) {
      const result = await rescoreAssessment(assessment.id);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error rescoring all assessments:', error);
    return [];
  }
};
