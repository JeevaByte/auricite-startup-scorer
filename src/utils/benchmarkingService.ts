
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/pages/Index';
import { ScoreResult } from '@/utils/scoreCalculator';
import { determineSectorFromAssessment, determineStageFromAssessment } from './sectorSpecificScoring';

export interface BenchmarkingData {
  business_idea_percentile: number;
  financials_percentile: number;
  team_percentile: number;
  traction_percentile: number;
  total_percentile: number;
  sector: string;
  stage: string;
  cluster_id: number;
}

// K-means clustering algorithm implementation
class KMeansClusterer {
  private k: number;
  private maxIterations: number;
  private centroids: number[][];
  
  constructor(k: number = 3, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
  }

  private distance(point1: number[], point2: number[]): number {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  }

  private initializeCentroids(data: number[][]): void {
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      this.centroids.push([...data[randomIndex]]);
    }
  }

  cluster(data: number[][]): number[] {
    if (data.length === 0) return [];
    
    this.initializeCentroids(data);
    const clusters: number[] = new Array(data.length);
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Assign points to clusters
      for (let i = 0; i < data.length; i++) {
        let minDistance = Infinity;
        let assignedCluster = 0;
        
        for (let j = 0; j < this.k; j++) {
          const dist = this.distance(data[i], this.centroids[j]);
          if (dist < minDistance) {
            minDistance = dist;
            assignedCluster = j;
          }
        }
        clusters[i] = assignedCluster;
      }
      
      // Update centroids
      const newCentroids: number[][] = Array(this.k).fill(null).map(() => 
        Array(data[0].length).fill(0)
      );
      const clusterCounts = Array(this.k).fill(0);
      
      for (let i = 0; i < data.length; i++) {
        const cluster = clusters[i];
        clusterCounts[cluster]++;
        for (let j = 0; j < data[i].length; j++) {
          newCentroids[cluster][j] += data[i][j];
        }
      }
      
      for (let i = 0; i < this.k; i++) {
        if (clusterCounts[i] > 0) {
          for (let j = 0; j < newCentroids[i].length; j++) {
            newCentroids[i][j] /= clusterCounts[i];
          }
        }
      }
      
      this.centroids = newCentroids;
    }
    
    return clusters;
  }
}

// Calculate percentile ranking
function calculatePercentile(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  
  const sortedValues = values.sort((a, b) => a - b);
  let rank = 0;
  
  for (let i = 0; i < sortedValues.length; i++) {
    if (sortedValues[i] < value) {
      rank++;
    }
  }
  
  return Math.round((rank / sortedValues.length) * 100);
}

export const generateBenchmarking = async (
  assessmentId: string,
  assessmentData: AssessmentData,
  scoreResult: ScoreResult
): Promise<BenchmarkingData | null> => {
  try {
    const sector = determineSectorFromAssessment(assessmentData);
    const stage = determineStageFromAssessment(assessmentData);
    
    // Get benchmark data for the sector and stage
    const { data: benchmarkData, error: benchmarkError } = await supabase
      .from('benchmark_data')
      .select('*')
      .eq('sector', sector)
      .eq('stage', stage)
      .single();
    
    if (benchmarkError || !benchmarkData) {
      console.warn('No benchmark data found, using default percentiles');
      return {
        business_idea_percentile: 50,
        financials_percentile: 50,
        team_percentile: 50,
        traction_percentile: 50,
        total_percentile: 50,
        sector,
        stage,
        cluster_id: 1
      };
    }

    // Get historical scores for percentile calculation
    const { data: historicalScores, error: scoresError } = await supabase
      .from('scores')
      .select('business_idea, financials, team, traction, total_score')
      .limit(1000); // Get recent scores for comparison
    
    if (scoresError || !historicalScores) {
      console.warn('Could not fetch historical scores for percentile calculation');
      return null;
    }

    // Calculate percentiles
    const businessIdeaPercentile = calculatePercentile(
      scoreResult.businessIdea,
      historicalScores.map(s => s.business_idea)
    );
    
    const financialsPercentile = calculatePercentile(
      scoreResult.financials,
      historicalScores.map(s => s.financials)
    );
    
    const teamPercentile = calculatePercentile(
      scoreResult.team,
      historicalScores.map(s => s.team)
    );
    
    const tractionPercentile = calculatePercentile(
      scoreResult.traction,
      historicalScores.map(s => s.traction)
    );
    
    const totalPercentile = calculatePercentile(
      scoreResult.totalScore,
      historicalScores.map(s => s.total_score)
    );

    // Perform clustering
    const scoreVectors = historicalScores.map(score => [
      score.business_idea,
      score.financials,
      score.team,
      score.traction
    ]);
    
    const clusterer = new KMeansClusterer(5); // 5 clusters
    const clusters = clusterer.cluster(scoreVectors);
    
    // Find which cluster this startup belongs to
    const currentScoreVector = [
      scoreResult.businessIdea,
      scoreResult.financials,
      scoreResult.team,
      scoreResult.traction
    ];
    
    let minDistance = Infinity;
    let clusterId = 0;
    
    for (let i = 0; i < scoreVectors.length; i++) {
      const distance = Math.sqrt(
        scoreVectors[i].reduce((sum, val, idx) => 
          sum + Math.pow(val - currentScoreVector[idx], 2), 0
        )
      );
      if (distance < minDistance) {
        minDistance = distance;
        clusterId = clusters[i];
      }
    }

    const benchmarkingData: BenchmarkingData = {
      business_idea_percentile: businessIdeaPercentile,
      financials_percentile: financialsPercentile,
      team_percentile: teamPercentile,
      traction_percentile: tractionPercentile,
      total_percentile: totalPercentile,
      sector,
      stage,
      cluster_id: clusterId
    };

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user && assessmentId !== 'cached') {
      await supabase
        .from('startup_clusters')
        .insert({
          assessment_id: assessmentId,
          user_id: user.id,
          sector,
          stage,
          cluster_id: clusterId,
          percentile_business_idea: businessIdeaPercentile,
          percentile_financials: financialsPercentile,
          percentile_team: teamPercentile,
          percentile_traction: tractionPercentile,
          percentile_total: totalPercentile
        });
    }

    return benchmarkingData;
  } catch (error) {
    console.error('Benchmarking generation failed:', error);
    return null;
  }
};
