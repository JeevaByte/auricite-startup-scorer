
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';

export interface DatabaseAssessment {
  id: string;
  user_id: string;
  prototype: boolean;
  external_capital: boolean;
  revenue: boolean;
  full_time_team: boolean;
  term_sheets: boolean;
  cap_table: boolean;
  mrr: string;
  employees: string;
  funding_goal: string;
  investors: string;
  milestones: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseScore {
  id: string;
  assessment_id: string;
  user_id: string;
  business_idea: number;
  business_idea_explanation: string;
  financials: number;
  financials_explanation: string;
  team: number;
  team_explanation: string;
  traction: number;
  traction_explanation: string;
  total_score: number;
  created_at: string;
}

export const saveAssessmentData = async (data: AssessmentData, userId: string) => {
  try {
    const { error } = await supabase
      .from('assessment_history')
      .upsert({ 
        user_id: userId, 
        assessment_data: data as any,
        score_result: {} as any
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving assessment data:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving assessment data:', error);
    return false;
  }
};

export const getAssessmentData = async (userId: string): Promise<AssessmentData | null> => {
  try {
    const { data, error } = await supabase
      .from('assessment_history')
      .select('assessment_data')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching assessment data:', error);
      return null;
    }

    return (data?.assessment_data as unknown as AssessmentData) || null;
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    return null;
  }
};

export const getUserAssessments = async (): Promise<(DatabaseAssessment & { scores: DatabaseScore[] })[]> => {
  try {
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (assessmentError) {
      console.error('Error fetching assessments:', assessmentError);
      return [];
    }

    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('*');

    if (scoresError) {
      console.error('Error fetching scores:', scoresError);
      return [];
    }

    // Combine assessments with their scores
    const combined = (assessments || []).map(assessment => ({
      ...assessment,
      scores: (scores || []).filter(score => score.assessment_id === assessment.id)
    }));

    return combined;
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    return [];
  }
};
