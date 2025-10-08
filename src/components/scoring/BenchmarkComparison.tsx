import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BenchmarkComparisonProps {
  sector: string;
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'growth';
  scores: {
    business_idea: number;
    team: number;
    traction: number;
    financials: number;
  };
}

interface BenchmarkData {
  business_idea_p25: number;
  business_idea_p50: number;
  business_idea_p75: number;
  team_p25: number;
  team_p50: number;
  team_p75: number;
  traction_p25: number;
  traction_p50: number;
  traction_p75: number;
  financials_p25: number;
  financials_p50: number;
  financials_p75: number;
  sample_size: number;
}

const getPercentileRank = (score: number, p25: number, p50: number, p75: number): string => {
  if (score >= p75) return 'Top 25%';
  if (score >= p50) return 'Top 50%';
  if (score >= p25) return 'Bottom 50%';
  return 'Bottom 25%';
};

const getPercentileBadgeVariant = (score: number, p25: number, p50: number, p75: number) => {
  if (score >= p75) return 'default';
  if (score >= p50) return 'secondary';
  return 'outline';
};

export const BenchmarkComparison: React.FC<BenchmarkComparisonProps> = ({
  sector,
  stage,
  scores
}) => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, [sector, stage]);

  const fetchBenchmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('benchmark_metrics')
        .select('*')
        .eq('sector', sector)
        .eq('stage', stage)
        .single();

      if (error) throw error;
      setBenchmarks(data);
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading benchmark data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!benchmarks) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No benchmark data available for {sector} at {stage} stage
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      category: 'Business Idea',
      'Your Score': scores.business_idea,
      '25th %ile': benchmarks.business_idea_p25,
      'Median': benchmarks.business_idea_p50,
      '75th %ile': benchmarks.business_idea_p75,
    },
    {
      category: 'Team',
      'Your Score': scores.team,
      '25th %ile': benchmarks.team_p25,
      'Median': benchmarks.team_p50,
      '75th %ile': benchmarks.team_p75,
    },
    {
      category: 'Traction',
      'Your Score': scores.traction,
      '25th %ile': benchmarks.traction_p25,
      'Median': benchmarks.traction_p50,
      '75th %ile': benchmarks.traction_p75,
    },
    {
      category: 'Financials',
      'Your Score': scores.financials,
      '25th %ile': benchmarks.financials_p25,
      'Median': benchmarks.financials_p50,
      '75th %ile': benchmarks.financials_p75,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Industry Benchmarks</span>
          <Badge variant="outline">
            {sector} - {stage}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comparing your scores against {benchmarks.sample_size} similar startups
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Your Score" fill="hsl(var(--primary))" />
              <Bar dataKey="25th %ile" fill="hsl(var(--muted))" />
              <Bar dataKey="Median" fill="hsl(var(--secondary))" />
              <Bar dataKey="75th %ile" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(scores).map(([key, score]) => {
            const category = key.replace('_', ' ');
            const p25 = benchmarks[`${key}_p25` as keyof BenchmarkData] as number;
            const p50 = benchmarks[`${key}_p50` as keyof BenchmarkData] as number;
            const p75 = benchmarks[`${key}_p75` as keyof BenchmarkData] as number;
            
            return (
              <div key={key} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{category}</span>
                  <Badge variant={getPercentileBadgeVariant(score, p25, p50, p75)}>
                    {getPercentileRank(score, p25, p50, p75)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Your score: {score}</span>
                  {score >= p50 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : score >= p25 ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span>Median: {p50}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};