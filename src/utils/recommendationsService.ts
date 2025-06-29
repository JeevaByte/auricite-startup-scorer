
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData, ScoreResult } from '@/pages/Index';

export interface RecommendationsData {
  businessIdea: string[];
  financials: string[];
  team: string[];
  traction: string[];
}

interface RecommendationsInput {
  prototype: boolean;
  externalCapital: boolean;
  revenue: boolean;
  fullTimeTeam: boolean;
  termSheets: boolean;
  capTable: boolean;
  mrr: string;
  employees: string;
  fundingGoal: string;
  investors: string;
  milestones: string;
  scores: {
    businessIdea: number;
    financials: number;
    team: number;
    traction: number;
    total: number;
  };
}

export const generateRecommendations = async (
  assessmentData: AssessmentData,
  scoreResult: ScoreResult
): Promise<RecommendationsData> => {
  try {
    // Check for cached recommendations first
    const cachedRecommendations = await checkCachedRecommendations(assessmentData, scoreResult);
    if (cachedRecommendations) {
      return cachedRecommendations;
    }

    // Prepare input for the edge function
    const input: RecommendationsInput = {
      prototype: assessmentData.prototype!,
      externalCapital: assessmentData.externalCapital!,
      revenue: assessmentData.revenue!,
      fullTimeTeam: assessmentData.fullTimeTeam!,
      termSheets: assessmentData.termSheets!,
      capTable: assessmentData.capTable!,
      mrr: assessmentData.mrr!,
      employees: assessmentData.employees!,
      fundingGoal: assessmentData.fundingGoal!,
      investors: assessmentData.investors!,
      milestones: assessmentData.milestones!,
      scores: {
        businessIdea: scoreResult.businessIdea,
        financials: scoreResult.financials,
        team: scoreResult.team,
        traction: scoreResult.traction,
        total: scoreResult.totalScore,
      },
    };

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: input,
    });

    if (error) {
      console.error('Error calling recommendations function:', error);
      return getFallbackRecommendations();
    }

    const recommendations = data.recommendations as RecommendationsData;

    // Cache the recommendations
    await cacheRecommendations(assessmentData, scoreResult, recommendations);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return getFallbackRecommendations();
  }
};

const checkCachedRecommendations = async (
  assessmentData: AssessmentData,
  scoreResult: ScoreResult
): Promise<RecommendationsData | null> => {
  try {
    const cacheKey = JSON.stringify({
      assessment: assessmentData,
      scores: {
        businessIdea: scoreResult.businessIdea,
        financials: scoreResult.financials,
        team: scoreResult.team,
        traction: scoreResult.traction,
        total: scoreResult.totalScore,
      },
    });

    const { data, error } = await supabase
      .from('ai_responses')
      .select('response_data')
      .eq('assessment_data', cacheKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    
    // Check if the response_data has recommendations
    if (data.response_data && typeof data.response_data === 'object' && 'recommendations' in data.response_data) {
      return (data.response_data as any).recommendations as RecommendationsData;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking cached recommendations:', error);
    return null;
  }
};

const cacheRecommendations = async (
  assessmentData: AssessmentData,
  scoreResult: ScoreResult,
  recommendations: RecommendationsData
): Promise<void> => {
  try {
    const cacheKey = JSON.stringify({
      assessment: assessmentData,
      scores: {
        businessIdea: scoreResult.businessIdea,
        financials: scoreResult.financials,
        team: scoreResult.team,
        traction: scoreResult.traction,
        total: scoreResult.totalScore,
      },
    });

    const { error } = await supabase
      .from('ai_responses')
      .insert({
        assessment_data: cacheKey as any,
        response_data: { recommendations } as any,
      });

    if (error) {
      console.error('Error caching recommendations:', error);
    }
  } catch (error) {
    console.error('Error caching recommendations:', error);
  }
};

const getFallbackRecommendations = (): RecommendationsData => ({
  businessIdea: [
    "Survey 10 customers to refine your value proposition and market fit.",
    "Research market size using industry reports and competitor analysis.",
    "Develop a compelling prototype demo for investor presentations."
  ],
  financials: [
    "Build a lean financial model using SCORE templates or similar tools.",
    "Document your cap table clearly for investor transparency.",
    "Create 12-month revenue projections with realistic assumptions."
  ],
  team: [
    "Validate team expertise with advisor endorsements and credentials.",
    "Consider recruiting a technical co-founder for scalability.",
    "Document team commitment and equity agreements in pitch materials."
  ],
  traction: [
    "Conduct 5 customer interviews for market validation feedback.",
    "Secure 2 letters of intent (LOIs) from potential clients.",
    "Implement analytics tracking to measure user engagement metrics."
  ]
});
