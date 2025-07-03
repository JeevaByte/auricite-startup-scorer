
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData, ScoreResult } from '@/pages/Index';

export interface BenchmarkData {
  sector: string;
  stage: string;
  business_idea_avg: number;
  financials_avg: number;
  team_avg: number;
  traction_avg: number;
  total_score_avg: number;
  sample_size: number;
}

export interface PercentileRanking {
  business_idea_percentile: number;
  financials_percentile: number;
  team_percentile: number;
  traction_percentile: number;
  total_percentile: number;
  sector: string;
  stage: string;
  cluster_id: number;
}

// Clustering algorithm using k-means approach
export const calculateCluster = (assessmentData: AssessmentData, scoreResult: ScoreResult): number => {
  // Simple clustering based on score ranges
  const totalScore = scoreResult.totalScore;
  
  if (totalScore >= 800) return 1; // High performers
  if (totalScore >= 600) return 2; // Above average
  if (totalScore >= 400) return 3; // Average
  if (totalScore >= 200) return 4; // Below average
  return 5; // Early stage
};

// Determine sector from assessment data
export const determineSector = (assessmentData: AssessmentData): string => {
  // Simple heuristic based on business characteristics
  if (assessmentData.mrr && assessmentData.revenue) {
    return 'B2B SaaS';
  }
  if (assessmentData.externalCapital && assessmentData.termSheets) {
    return 'FinTech';
  }
  if (assessmentData.prototype && !assessmentData.revenue) {
    return 'B2C Consumer';
  }
  return 'B2B SaaS'; // Default
};

// Determine funding stage
export const determineStage = (assessmentData: AssessmentData): string => {
  if (assessmentData.termSheets || assessmentData.externalCapital) {
    return 'seed';
  }
  return 'pre-seed';
};

// Get benchmark data for sector and stage
export const getBenchmarkData = async (sector: string, stage: string): Promise<BenchmarkData | null> => {
  try {
    const { data, error } = await supabase
      .from('benchmark_data')
      .select('*')
      .eq('sector', sector)
      .eq('stage', stage)
      .single();

    if (error || !data) return null;
    return data as BenchmarkData;
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return null;
  }
};

// Calculate percentile rankings
export const calculatePercentiles = (
  scoreResult: ScoreResult,
  benchmarkData: BenchmarkData
): Omit<PercentileRanking, 'sector' | 'stage' | 'cluster_id'> => {
  // Simple percentile calculation (in real implementation, this would use historical data)
  const calculatePercentile = (score: number, average: number): number => {
    // Simplified percentile calculation
    const ratio = score / average;
    if (ratio >= 1.5) return 95;
    if (ratio >= 1.3) return 85;
    if (ratio >= 1.1) return 75;
    if (ratio >= 0.9) return 50;
    if (ratio >= 0.7) return 25;
    if (ratio >= 0.5) return 15;
    return 5;
  };

  return {
    business_idea_percentile: calculatePercentile(scoreResult.businessIdea, benchmarkData.business_idea_avg),
    financials_percentile: calculatePercentile(scoreResult.financials, benchmarkData.financials_avg),
    team_percentile: calculatePercentile(scoreResult.team, benchmarkData.team_avg),
    traction_percentile: calculatePercentile(scoreResult.traction, benchmarkData.traction_avg),
    total_percentile: calculatePercentile(scoreResult.totalScore / 10, benchmarkData.total_score_avg / 10),
  };
};

// Save clustering data to database
export const saveClusteringData = async (
  assessmentId: string,
  assessmentData: AssessmentData,
  scoreResult: ScoreResult,
  percentiles: PercentileRanking
): Promise<void> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  try {
    const { error } = await supabase
      .from('startup_clusters')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        sector: percentiles.sector,
        stage: percentiles.stage,
        cluster_id: percentiles.cluster_id,
        percentile_business_idea: percentiles.business_idea_percentile,
        percentile_financials: percentiles.financials_percentile,
        percentile_team: percentiles.team_percentile,
        percentile_traction: percentiles.traction_percentile,
        percentile_total: percentiles.total_percentile,
      });

    if (error) {
      throw new Error('Failed to save clustering data');
    }
  } catch (error) {
    console.error('Error saving clustering data:', error);
    throw new Error('Clustering data could not be saved');
  }
};

// Main benchmarking function
export const generateBenchmarking = async (
  assessmentId: string,
  assessmentData: AssessmentData,
  scoreResult: ScoreResult
): Promise<PercentileRanking | null> => {
  try {
    const sector = determineSector(assessmentData);
    const stage = determineStage(assessmentData);
    const clusterId = calculateCluster(assessmentData, scoreResult);

    const benchmarkData = await getBenchmarkData(sector, stage);
    if (!benchmarkData) {
      console.warn(`No benchmark data found for ${sector} - ${stage}`);
      return null;
    }

    const percentiles = calculatePercentiles(scoreResult, benchmarkData);
    
    const fullPercentiles: PercentileRanking = {
      ...percentiles,
      sector,
      stage,
      cluster_id: clusterId,
    };

    // Save to database
    await saveClusteringData(assessmentId, assessmentData, scoreResult, fullPercentiles);

    return fullPercentiles;
  } catch (error) {
    console.error('Error generating benchmarking:', error);
    return null;
  }
};
