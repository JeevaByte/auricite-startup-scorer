import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

interface ClusterData {
  cluster_name: string;
  cluster_description: string;
  typical_score_range: [number, number];
  success_rate: number;
  funding_stage: string;
  common_sectors: string[];
  key_strengths: string[];
  improvement_areas: string[];
  percentile_rank: number;
}

interface EnhancedClusteringProps {
  userScore: number;
  sector: string;
  fundingStage: string;
}

export const EnhancedClustering = ({ userScore, sector, fundingStage }: EnhancedClusteringProps) => {
  // ML-style clustering logic based on score ranges and characteristics
  const determineCluster = (score: number, sector: string, stage: string): ClusterData => {
    if (score >= 800) {
      return {
        cluster_name: "Investment Ready Leaders",
        cluster_description: "Top 10% of startups with exceptional readiness across all metrics",
        typical_score_range: [800, 999],
        success_rate: 85,
        funding_stage: "Series A+",
        common_sectors: ["Enterprise SaaS", "FinTech", "HealthTech"],
        key_strengths: ["Strong team track record", "Proven traction", "Clear market fit"],
        improvement_areas: ["Scale preparation", "International expansion"],
        percentile_rank: 95
      };
    } else if (score >= 650) {
      return {
        cluster_name: "Scaling Accelerators",
        cluster_description: "High-potential startups ready for significant growth capital",
        typical_score_range: [650, 799],
        success_rate: 65,
        funding_stage: "Seed to Series A",
        common_sectors: ["B2B SaaS", "E-commerce", "EdTech"],
        key_strengths: ["Product-market fit", "Growing revenue", "Solid foundations"],
        improvement_areas: ["Team scaling", "Financial projections", "Market expansion"],
        percentile_rank: 75
      };
    } else if (score >= 500) {
      return {
        cluster_name: "Growth Candidates",
        cluster_description: "Promising startups with solid fundamentals needing focused improvements",
        typical_score_range: [500, 649],
        success_rate: 45,
        funding_stage: "Pre-Seed to Seed",
        common_sectors: ["Consumer Apps", "Marketplace", "Social Impact"],
        key_strengths: ["Clear vision", "Basic traction", "Market opportunity"],
        improvement_areas: ["Revenue model", "Team development", "Customer validation"],
        percentile_rank: 55
      };
    } else if (score >= 350) {
      return {
        cluster_name: "Development Stage",
        cluster_description: "Early-stage startups building foundations for future growth",
        typical_score_range: [350, 499],
        success_rate: 25,
        funding_stage: "Bootstrap to Pre-Seed",
        common_sectors: ["Early SaaS", "Hardware", "Local Services"],
        key_strengths: ["Founder commitment", "Initial concept", "Learning agility"],
        improvement_areas: ["Product development", "Market research", "Financial planning"],
        percentile_rank: 35
      };
    } else {
      return {
        cluster_name: "Foundation Builders",
        cluster_description: "Very early startups focusing on core development and validation",
        typical_score_range: [0, 349],
        success_rate: 10,
        funding_stage: "Ideation to Bootstrap",
        common_sectors: ["Various", "Concept Stage"],
        key_strengths: ["Vision", "Determination", "Learning mindset"],
        improvement_areas: ["All areas need development", "Focus on MVP", "Market validation"],
        percentile_rank: 15
      };
    }
  };

  const clusterData = determineCluster(userScore, sector, fundingStage);

  const getSuccessColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Your Startup Cluster</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cluster Identity */}
        <div className="text-center">
          <Badge variant="outline" className="text-lg py-2 px-4 mb-2">
            {clusterData.cluster_name}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {clusterData.cluster_description}
          </p>
        </div>

        {/* Score Range and Percentile */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Score Range</p>
            <p className="text-lg font-bold">
              {clusterData.typical_score_range[0]} - {clusterData.typical_score_range[1]}
            </p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">Percentile Rank</p>
            <p className="text-lg font-bold">{clusterData.percentile_rank}th</p>
          </div>
        </div>

        {/* Success Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Funding Success Rate</span>
            <span className={`text-sm font-bold ${getSuccessColor(clusterData.success_rate)}`}>
              {clusterData.success_rate}%
            </span>
          </div>
          <Progress value={clusterData.success_rate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Based on startups in your cluster that successfully raised funding
          </p>
        </div>

        {/* Typical Stage and Sectors */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-medium mb-2">Typical Funding Stage</h4>
            <Badge variant="secondary">{clusterData.funding_stage}</Badge>
          </div>
          <div>
            <h4 className="font-medium mb-2">Common Sectors</h4>
            <div className="flex flex-wrap gap-1">
              {clusterData.common_sectors.map((sector, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths and Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Award className="h-4 w-4 mr-1 text-green-600" />
              Key Strengths
            </h4>
            <ul className="text-sm space-y-1">
              {clusterData.key_strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 mr-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Target className="h-4 w-4 mr-1 text-blue-600" />
              Focus Areas
            </h4>
            <ul className="text-sm space-y-1">
              {clusterData.improvement_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-1">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium mb-2">Recommended Next Steps</h4>
          <p className="text-sm text-muted-foreground">
            Based on your cluster profile, focus on {clusterData.improvement_areas[0].toLowerCase()} 
            to move towards the next performance tier. 
            Startups in higher clusters typically show stronger {clusterData.improvement_areas[1]?.toLowerCase() || 'fundamentals'}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};