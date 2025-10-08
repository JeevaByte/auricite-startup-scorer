import { supabase } from "@/integrations/supabase/client";

export interface AdvancedScoreResult {
  score: number;
  calibratedScore: number;
  confidence: number;
  breakdown: {
    llm: number;
    embedding: number;
    ml: number;
  };
  categories: {
    innovation: number;
    traction: number;
    team: number;
    market: number;
  };
  explanations: {
    detailed: Record<string, string>;
    strengths: string[];
    weaknesses: string[];
    phrases: Record<string, any>;
  };
  processingTimeMs: number;
}

export async function calculateAdvancedScore(
  assessmentData: any,
  assessmentId: string
): Promise<AdvancedScoreResult> {
  try {
    const { data, error } = await supabase.functions.invoke('advanced-scoring', {
      body: {
        assessmentData,
        assessmentId,
      },
    });

    if (error) {
      console.error('Advanced scoring error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling advanced scoring:', error);
    throw error;
  }
}

export async function getExtractedFeatures(assessmentId: string) {
  const { data, error } = await supabase
    .from('extracted_features')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching extracted features:', error);
    return null;
  }

  return data;
}

export async function getAdvancedScores(assessmentId: string) {
  const { data, error } = await supabase
    .from('advanced_scores')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching advanced scores:', error);
    return null;
  }

  return data;
}

export async function getScoreHistory(assessmentId: string) {
  const { data, error } = await supabase
    .from('advanced_scores')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching score history:', error);
    return [];
  }

  return data;
}
