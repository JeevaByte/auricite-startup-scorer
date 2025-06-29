
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData, ScoreResult } from '@/pages/Index';

export interface DatabaseAssessment {
  id: string;
  user_id: string;
  prototype: boolean;
  external_capital: boolean;
  revenue: boolean;
  full_time_team: boolean;
  term_sheets: boolean;
  cap_table: boolean;
  mrr: 'none' | 'low' | 'medium' | 'high';
  employees: '1-2' | '3-10' | '11-50' | '50+';
  funding_goal: 'mvp' | 'productMarketFit' | 'scale' | 'exit';
  investors: 'none' | 'angels' | 'vc' | 'lateStage';
  milestones: 'concept' | 'launch' | 'scale' | 'exit';
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

export const saveAssessment = async (data: AssessmentData): Promise<string> => {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      prototype: data.prototype,
      external_capital: data.externalCapital,
      revenue: data.revenue,
      full_time_team: data.fullTimeTeam,
      term_sheets: data.termSheets,
      cap_table: data.capTable,
      mrr: data.mrr,
      employees: data.employees,
      funding_goal: data.fundingGoal,
      investors: data.investors,
      milestones: data.milestones,
    })
    .select()
    .single();

  if (error) throw error;
  return assessment.id;
};

export const saveScore = async (assessmentId: string, scoreResult: ScoreResult): Promise<void> => {
  const { error } = await supabase
    .from('scores')
    .insert({
      assessment_id: assessmentId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      business_idea: scoreResult.businessIdea,
      business_idea_explanation: scoreResult.businessIdeaExplanation,
      financials: scoreResult.financials,
      financials_explanation: scoreResult.financialsExplanation,
      team: scoreResult.team,
      team_explanation: scoreResult.teamExplanation,
      traction: scoreResult.traction,
      traction_explanation: scoreResult.tractionExplanation,
      total_score: scoreResult.totalScore,
    });

  if (error) throw error;
};

export const getUserAssessments = async (): Promise<(DatabaseAssessment & { scores: DatabaseScore[] })[]> => {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      scores (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const checkCachedResponse = async (assessmentData: AssessmentData): Promise<ScoreResult | null> => {
  const { data, error } = await supabase
    .from('ai_responses')
    .select('response_data')
    .eq('assessment_data', JSON.stringify(assessmentData))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.response_data as ScoreResult;
};

export const cacheResponse = async (assessmentData: AssessmentData, responseData: ScoreResult): Promise<void> => {
  const { error } = await supabase
    .from('ai_responses')
    .insert({
      assessment_data: assessmentData,
      response_data: responseData,
    });

  if (error) console.error('Error caching response:', error);
};
