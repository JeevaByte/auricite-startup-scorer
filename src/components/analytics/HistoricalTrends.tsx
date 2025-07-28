import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AssessmentHistoryItem {
  id: string;
  created_at: string;
  business_idea: number;
  financials: number;
  team: number;
  traction: number;
  total_score: number;
}

interface TrendData {
  date: string;
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
  total: number;
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted-foreground))',
  destructive: 'hsl(var(--destructive))',
  success: '#10b981'
};

export const HistoricalTrends: React.FC = () => {
  const { user } = useAuth();
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    if (user) {
      fetchAssessmentHistory();
    }
  }, [user, timeRange]);

  const fetchAssessmentHistory = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch assessment history and scores
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (assessmentError) throw assessmentError;

      // Also fetch scores separately
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (scoresError) throw scoresError;

      // Create a map of assessment_id to scores
      const scoresMap = new Map(scores?.map(score => [score.assessment_id, score]) || []);

      const formattedData = assessments?.map(assessment => {
        const score = scoresMap.get(assessment.id);
        return {
          id: assessment.id,
          created_at: assessment.created_at,
          business_idea: score?.business_idea || 0,
          financials: score?.financials || 0,
          team: score?.team || 0,
          traction: score?.traction || 0,
          total_score: score?.total_score || 0
        };
      }).filter(item => item.business_idea > 0) || []; // Only include items with actual scores

      setAssessmentHistory(formattedData);
      
      // Transform data for charts
      const chartData = formattedData.map(item => ({
        date: new Date(item.created_at).toLocaleDateString(),
        businessIdea: item.business_idea,
        financials: item.financials,
        team: item.team,
        traction: item.traction,
        total: item.total_score
      }));

      setTrendData(chartData);
    } catch (error) {
      console.error('Error fetching assessment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLatestScore = () => {
    if (assessmentHistory.length === 0) return null;
    return assessmentHistory[assessmentHistory.length - 1];
  };

  const getScoreChange = () => {
    if (assessmentHistory.length < 2) return null;
    const latest = assessmentHistory[assessmentHistory.length - 1];
    const previous = assessmentHistory[assessmentHistory.length - 2];
    return latest.total_score - previous.total_score;
  };

  const getAverageScores = () => {
    if (assessmentHistory.length === 0) return null;
    
    const totals = assessmentHistory.reduce(
      (acc, item) => ({
        businessIdea: acc.businessIdea + item.business_idea,
        financials: acc.financials + item.financials,
        team: acc.team + item.team,
        traction: acc.traction + item.traction
      }),
      { businessIdea: 0, financials: 0, team: 0, traction: 0 }
    );

    const count = assessmentHistory.length;
    return {
      businessIdea: Math.round(totals.businessIdea / count),
      financials: Math.round(totals.financials / count),
      team: Math.round(totals.team / count),
      traction: Math.round(totals.traction / count)
    };
  };

  const radarData = () => {
    const latest = getLatestScore();
    if (!latest) return [];

    return [
      { category: 'Business Idea', score: latest.business_idea, fullMark: 100 },
      { category: 'Financials', score: latest.financials, fullMark: 100 },
      { category: 'Team', score: latest.team, fullMark: 100 },
      { category: 'Traction', score: latest.traction, fullMark: 100 }
    ];
  };

  const pieData = () => {
    const averages = getAverageScores();
    if (!averages) return [];

    return [
      { name: 'Business Idea', value: averages.businessIdea, color: COLORS.primary },
      { name: 'Financials', value: averages.financials, color: COLORS.secondary },
      { name: 'Team', value: averages.team, color: COLORS.accent },
      { name: 'Traction', value: averages.traction, color: COLORS.success }
    ];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="h-64 bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (assessmentHistory.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assessment History</h3>
          <p className="text-muted-foreground">
            Complete multiple assessments to see your progress trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestScore = getLatestScore();
  const scoreChange = getScoreChange();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Historical Trends</h2>
          <p className="text-muted-foreground">
            Track your investment readiness progress over time
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Score</p>
                <p className="text-2xl font-bold">{latestScore?.total_score}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Change</p>
                <p className={`text-2xl font-bold ${scoreChange && scoreChange > 0 ? 'text-green-600' : scoreChange && scoreChange < 0 ? 'text-red-600' : ''}`}>
                  {scoreChange !== null ? (scoreChange > 0 ? '+' : '') + scoreChange : 'N/A'}
                </p>
              </div>
              <Target className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessments</p>
                <p className="text-2xl font-bold">{assessmentHistory.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Score Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
          <TabsTrigger value="radar">Current Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke={COLORS.primary} 
                    strokeWidth={3}
                    dot={{ fill: COLORS.primary, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="businessIdea" 
                    stackId="1"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="financials" 
                    stackId="1"
                    stroke={COLORS.secondary} 
                    fill={COLORS.secondary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="team" 
                    stackId="1"
                    stroke={COLORS.accent} 
                    fill={COLORS.accent}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="traction" 
                    stackId="1"
                    stroke={COLORS.success} 
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[getAverageScores()]} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="businessIdea" fill={COLORS.primary} name="Business Idea" />
                    <Bar dataKey="financials" fill={COLORS.secondary} name="Financials" />
                    <Bar dataKey="team" fill={COLORS.accent} name="Team" />
                    <Bar dataKey="traction" fill={COLORS.success} name="Traction" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="radar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Score Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke={COLORS.primary}
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};