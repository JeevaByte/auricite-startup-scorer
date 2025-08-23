import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreResult } from '@/utils/scoreCalculator';

interface RadarVisualizationProps {
  scoreResult: ScoreResult;
  benchmarkData?: {
    businessIdea: number;
    financials: number;
    team: number;
    traction: number;
  };
  showBenchmark?: boolean;
}

export const RadarVisualization: React.FC<RadarVisualizationProps> = ({
  scoreResult,
  benchmarkData,
  showBenchmark = false
}) => {
  const data = [
    {
      category: 'Business Idea',
      yourScore: scoreResult.businessIdea,
      benchmark: benchmarkData?.businessIdea || 0,
      fullMark: 100
    },
    {
      category: 'Financials',
      yourScore: scoreResult.financials,
      benchmark: benchmarkData?.financials || 0,
      fullMark: 100
    },
    {
      category: 'Team',
      yourScore: scoreResult.team,
      benchmark: benchmarkData?.team || 0,
      fullMark: 100
    },
    {
      category: 'Traction',
      yourScore: scoreResult.traction,
      benchmark: benchmarkData?.traction || 0,
      fullMark: 100
    }
  ];

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { level: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { level: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Needs Work', color: 'bg-red-100 text-red-800' };
  };

  const overallScore = Math.round((scoreResult.businessIdea + scoreResult.financials + scoreResult.team + scoreResult.traction) / 4);
  const performance = getPerformanceLevel(overallScore);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Performance Radar
            <Badge className={performance.color}>
              {performance.level}
            </Badge>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Overall: {overallScore}/100
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fontSize: 12, fill: '#374151' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Your Score"
                dataKey="yourScore"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              {showBenchmark && benchmarkData && (
                <Radar
                  name="Industry Average"
                  dataKey="benchmark"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              )}
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((item) => {
            const categoryPerf = getPerformanceLevel(item.yourScore);
            const improvement = showBenchmark && benchmarkData ? item.yourScore - item.benchmark : 0;
            
            return (
              <div key={item.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{item.category}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={categoryPerf.color}>
                      {item.yourScore}
                    </Badge>
                    {showBenchmark && improvement !== 0 && (
                      <span className={`text-xs ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {improvement > 0 ? '+' : ''}{improvement} vs avg
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};