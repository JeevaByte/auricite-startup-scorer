import { supabase } from '@/integrations/supabase/client';
import { ScoreResult } from '@/utils/scoreCalculator';
import { AssessmentData } from '@/pages/Index';
import { sanitizeAssessmentData } from '@/utils/inputSanitization';

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

export interface Badge {
  id: string;
  user_id: string;
  assessment_id: string;
  badge_name: string;
  explanation: string;
  created_at: string;
}

export const saveAssessment = async (data: AssessmentData): Promise<string> => {
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // Sanitize data before saving
  const sanitizedData = sanitizeAssessmentData(data);

  try {
    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert({
        user_id: user.id,
        prototype: sanitizedData.prototype,
        external_capital: sanitizedData.externalCapital,
        revenue: sanitizedData.revenue,
        full_time_team: sanitizedData.fullTimeTeam,
        term_sheets: sanitizedData.termSheets,
        cap_table: sanitizedData.capTable,
        mrr: sanitizedData.mrr,
        employees: sanitizedData.employees,
        funding_goal: sanitizedData.fundingGoal,
        investors: sanitizedData.investors,
        milestones: sanitizedData.milestones,
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to save assessment');
    }
    return assessment.id;
  } catch (error) {
    // Don't expose internal error details
    throw new Error('Assessment could not be saved at this time');
  }
};

export const saveScore = async (assessmentId: string, scoreResult: ScoreResult): Promise<void> => {
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
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

    if (error) {
      throw new Error('Failed to save score');
    }
  } catch (error) {
    throw new Error('Score could not be saved at this time');
  }
};

export const saveBadges = async (assessmentId: string, badges: { name: string; explanation: string }[]): Promise<void> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const badgeInserts = badges.map(badge => ({
    assessment_id: assessmentId,
    user_id: user.id,
    badge_name: badge.name,
    explanation: badge.explanation,
  }));

  try {
    const { error } = await supabase
      .from('badges')
      .insert(badgeInserts);

    if (error) {
      throw new Error('Failed to save badges');
    }
  } catch (error) {
    throw new Error('Badges could not be saved at this time');
  }
};

export const assignBadges = async (assessmentData: AssessmentData, scores: ScoreResult) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  try {
    const { data, error } = await supabase.functions.invoke('assign-badges', {
      body: { 
        data: assessmentData,
        scores: {
          businessIdea: scores.businessIdea,
          financials: scores.financials,
          team: scores.team,
          traction: scores.traction,
          total: scores.totalScore
        }
      }
    });

    if (error) {
      throw new Error('Badge assignment failed');
    }
    return data;
  } catch (error) {
    throw new Error('Badge assignment could not be completed at this time');
  }
};

export const getUserAssessments = async (): Promise<(DatabaseAssessment & { scores: DatabaseScore[] })[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  try {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        scores (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch assessments');
    }
    return data as (DatabaseAssessment & { scores: DatabaseScore[] })[] || [];
  } catch (error) {
    throw new Error('Assessments could not be retrieved at this time');
  }
};

export const getUserAssessmentsWithBadges = async (): Promise<(DatabaseAssessment & { 
  scores: DatabaseScore[]; 
  badges: Badge[] 
})[]> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  try {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        scores (*),
        badges (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch assessments with badges');
    }
    return data as (DatabaseAssessment & { scores: DatabaseScore[]; badges: Badge[] })[] || [];
  } catch (error) {
    throw new Error('Assessment data could not be retrieved at this time');
  }
};

// Enhanced function with benchmarking support
export const saveAssessmentWithBenchmarking = async (
  data: AssessmentData, 
  scoreResult: ScoreResult,
  percentiles?: any
): Promise<string> => {
  const assessmentId = await saveAssessment(data);
  await saveScore(assessmentId, scoreResult);
  
  // Save benchmarking data if provided
  if (percentiles) {
    const { generateBenchmarking } = await import('./benchmarkingService');
    await generateBenchmarking(assessmentId, data, scoreResult);
  }
  
  return assessmentId;
};

export const checkCachedResponse = async (assessmentData: AssessmentData): Promise<ScoreResult | null> => {
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  // Sanitize data before checking cache
  const sanitizedData = sanitizeAssessmentData(assessmentData);

  try {
    const { data, error } = await supabase
      .from('ai_responses')
      .select('response_data')
      .eq('assessment_data', JSON.stringify(sanitizedData))
      .eq('user_id', user.id) // Only check user's own cached responses
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.response_data as unknown as ScoreResult;
  } catch (error) {
    // Don't expose cache errors to user
    return null;
  }
};

export const cacheResponse = async (assessmentData: AssessmentData, responseData: ScoreResult): Promise<void> => {
  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return;
  }

  // Sanitize data before caching
  const sanitizedData = sanitizeAssessmentData(assessmentData);

  try {
    const { error } = await supabase
      .from('ai_responses')
      .insert({
        assessment_data: sanitizedData as any,
        response_data: responseData as any,
        user_id: user.id, // Ensure user_id is set for proper RLS
      });

    if (error) {
      // Don't expose caching errors to user, just log internally
      console.error('Cache operation failed');
    }
  } catch (error) {
    // Silent fail for caching operations
    console.error('Cache operation failed');
  }
};
