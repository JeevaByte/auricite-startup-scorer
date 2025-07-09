
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Users, FileText, TrendingUp, Activity, Star, Download, Filter, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalUsers: number;
  totalAssessments: number;
  averageScore: number;
  assessmentsThisMonth: number;
  completionRate: number;
  userGrowth: Array<{ date: string; users: number; assessments: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  sectorBreakdown: Array<{ sector: string; count: number; avgScore: number }>;
  abuseMetrics: {
    suspiciousActivity: number;
    blockedRequests: number;
    honeypotTriggers: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const EnhancedAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total assessments
      const { count: totalAssessments } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true });

      // Get scores for completion rate and average
      const { data: scores, count: scoresCount } = await supabase
        .from('scores')
        .select('total_score', { count: 'exact' });
      
      const averageScore = scores?.length 
        ? Math.round(scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length)
        : 0;

      const completionRate = totalAssessments && scoresCount 
        ? Math.round((scoresCount / totalAssessments) * 100)
        : 0;

      // Get assessments this month
      const monthStart = new Date();
      monthStart.setDate(1);
      const { count: assessmentsThisMonth } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString());

      // Get abuse metrics
      const { count: suspiciousActivity } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'SUSPICIOUS_ACTIVITY')
        .gte('created_at', startDate.toISOString());

      const { count: honeypotTriggers } = await supabase
        .from('honeypot_submissions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Mock data for charts (replace with real calculations)
      const userGrowth = generateUserGrowthData(startDate, endDate);
      const scoreDistribution = [
        { range: '0-200', count: Math.floor(Math.random() * 20) + 5 },
        { range: '201-400', count: Math.floor(Math.random() * 30) + 15 },
        { range: '401-600', count: Math.floor(Math.random() * 40) + 25 },
        { range: '601-800', count: Math.floor(Math.random() * 35) + 30 },
        { range: '801-1000', count: Math.floor(Math.random() * 25) + 20 },
      ];

      const sectorBreakdown = [
        { sector: 'Technology', count: 45, avgScore: 650 },
        { sector: 'Healthcare', count: 32, avgScore: 620 },
        { sector: 'Finance', count: 28, avgScore: 680 },
        { sector: 'E-commerce', count: 22, avgScore: 580 },
        { sector: 'Education', count: 18, avgScore: 640 },
      ];

      setData({
        totalUsers: totalUsers || 0,
        totalAssessments: totalAssessments || 0,
        averageScore,
        assessmentsThisMonth: assessmentsThisMonth || 0,
        completionRate,
        userGrowth,
        scoreDistribution,
        sectorBreakdown,
        abuseMetrics: {
          suspiciousActivity: suspiciousActivity || 0,
          blockedRequests: Math.floor(Math.random() * 50),
          honeypotTriggers: honeypotTriggers || 0,
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateUserGrowthData = (startDate: Date, endDate: Date) => {
    const data = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      data.push({
        date: current.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 20) + 10,
        assessments: Math.floor(Math.random() * 15) + 5,
      });
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Users,${data.totalUsers}\n`
      + `Total Assessments,${data.totalAssessments}\n`
      + `Average Score,${data.averageScore}\n`
      + `Completion Rate,${data.completionRate}%\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6" role="status" aria-label="Loading analytics">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center" role="alert">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p>Failed to load analytics data.</p>
        <Button onClick={loadAnalytics} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main" aria-label="Analytics Dashboard">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7d" aria-label="Last 7 days">7D</TabsTrigger>
              <TabsTrigger value="30d" aria-label="Last 30 days">30D</TabsTrigger>
              <TabsTrigger value="90d" aria-label="Last 90 days">90D</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={exportData} variant="outline" aria-label="Export analytics data">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold" aria-label={`${data.totalUsers} total users`}>{data.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assessments</p>
                <p className="text-2xl font-bold" aria-label={`${data.totalAssessments} total assessments`}>{data.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold" aria-label={`${data.averageScore} average score`}>{data.averageScore}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold" aria-label={`${data.completionRate} percent completion rate`}>{data.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold" aria-label={`${data.assessmentsThisMonth} assessments this month`}>{data.assessmentsThisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="scores">Score Analysis</TabsTrigger>
          <TabsTrigger value="sectors">Sector Breakdown</TabsTrigger>
          <TabsTrigger value="security">Security Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="growth">
          <Card>
            <CardHeader>
              <CardTitle>User Growth & Assessment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="assessments" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution (Pie)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ range, count }) => `${range}: ${count}`}
                    >
                      {data.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.sectorBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#82ca9d" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Suspicious Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {data.abuseMetrics.suspiciousActivity}
                </div>
                <p className="text-sm text-muted-foreground">Flagged incidents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  Blocked Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {data.abuseMetrics.blockedRequests}
                </div>
                <p className="text-sm text-muted-foreground">Rate limited</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-500" />
                  Bot Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">
                  {data.abuseMetrics.honeypotTriggers}
                </div>
                <p className="text-sm text-muted-foreground">Honeypot triggers</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
