
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Target, DollarSign, Lightbulb } from 'lucide-react';

interface BenchmarkDisplayProps {
  percentiles: {
    business_idea_percentile: number;
    financials_percentile: number;
    team_percentile: number;
    traction_percentile: number;
    total_percentile: number;
    sector: string;
    stage: string;
    cluster_id: number;
  };
}

export const BenchmarkDisplay: React.FC<BenchmarkDisplayProps> = ({ percentiles }) => {
  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 80) return 'bg-green-500';
    if (percentile >= 60) return 'bg-blue-500';
    if (percentile >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPercentileText = (percentile: number): string => {
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 80) return 'Top 20%';
    if (percentile >= 70) return 'Top 30%';
    if (percentile >= 50) return 'Above Average';
    if (percentile >= 30) return 'Average';
    return 'Below Average';
  };

  const getClusterDescription = (clusterId: number): string => {
    switch (clusterId) {
      case 1: return 'High Performers';
      case 2: return 'Above Average';
      case 3: return 'Average';
      case 4: return 'Below Average';
      case 5: return 'Early Stage';
      default: return 'Unclassified';
    }
  };

  const metrics = [
    {
      label: 'Business Idea',
      percentile: percentiles.business_idea_percentile,
      icon: Lightbulb,
    },
    {
      label: 'Financials',
      percentile: percentiles.financials_percentile,
      icon: DollarSign,
    },
    {
      label: 'Team',
      percentile: percentiles.team_percentile,
      icon: Users,
    },
    {
      label: 'Traction',
      percentile: percentiles.traction_percentile,
      icon: Target,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Peer Benchmarking
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">{percentiles.sector}</Badge>
          <Badge variant="outline">{percentiles.stage}</Badge>
          <Badge variant="outline">{getClusterDescription(percentiles.cluster_id)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Ranking */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {getPercentileText(percentiles.total_percentile)}
          </div>
          <div className="text-sm text-gray-600">
            Your startup ranks in the top {100 - percentiles.total_percentile}% of {percentiles.sector} startups at {percentiles.stage} stage
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {metric.percentile}th percentile
                  </span>
                </div>
                <Progress 
                  value={metric.percentile} 
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  {getPercentileText(metric.percentile)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Benchmarking Insights</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• You're competing with {percentiles.sector} startups at the {percentiles.stage} stage</li>
            <li>• Focus on areas where you're below the 50th percentile for maximum impact</li>
            <li>• Your cluster group: {getClusterDescription(percentiles.cluster_id)}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
