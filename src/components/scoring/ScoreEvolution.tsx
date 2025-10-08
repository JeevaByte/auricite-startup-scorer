import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScoreEvolutionProps {
  userId: string;
}

interface ScoreSnapshot {
  id: string;
  total_score: number;
  business_idea: number;
  team: number;
  traction: number;
  financials: number;
  snapshot_date: string;
  score_delta: number;
}

export const ScoreEvolution: React.FC<ScoreEvolutionProps> = ({ userId }) => {
  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | 'all'>('3m');

  useEffect(() => {
    fetchScoreHistory();
  }, [userId, timeRange]);

  const fetchScoreHistory = async () => {
    try {
      let query = supabase
        .from('score_history')
        .select('*')
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: true });

      // Filter by time range
      if (timeRange !== 'all') {
        const months = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : 6;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        query = query.gte('snapshot_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistory((data || []) as any);
    } catch (error) {
      console.error('Error fetching score history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading score evolution...</p>
        </CardContent>
      </Card>
    );
  }

  if (history.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Score Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete more assessments to track your progress over time
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = history.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    'Total Score': snapshot.total_score,
    'Business Idea': snapshot.business_idea,
    'Team': snapshot.team,
    'Traction': snapshot.traction,
    'Financials': snapshot.financials
  }));

  const latestScore = history[history.length - 1];
  const previousScore = history[history.length - 2];
  const scoreTrend = latestScore.total_score - previousScore.total_score;
  const trendPercentage = ((scoreTrend / previousScore.total_score) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Score Evolution
          </CardTitle>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Month</SelectItem>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-sm text-muted-foreground">Latest Score</p>
            <p className="text-2xl font-bold">{latestScore.total_score}</p>
          </div>
          <div className="flex items-center gap-2">
            {scoreTrend > 0 ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <Badge variant={scoreTrend > 0 ? 'default' : 'destructive'}>
              {scoreTrend > 0 ? '+' : ''}{scoreTrend} ({trendPercentage}%)
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Total Score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Business Idea" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Team" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Traction" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="Financials" 
                stroke="hsl(var(--chart-4))" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['business_idea', 'team', 'traction', 'financials'].map((key) => {
            const latest = latestScore[key as keyof ScoreSnapshot] as number;
            const previous = previousScore[key as keyof ScoreSnapshot] as number;
            const delta = latest - previous;
            
            return (
              <div key={key} className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground capitalize mb-1">
                  {key.replace('_', ' ')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{latest}</span>
                  <Badge 
                    variant={delta >= 0 ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {delta > 0 ? '+' : ''}{delta}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};