
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, FileText, TrendingUp, Activity, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalAssessments: number;
  averageScore: number;
  assessmentsThisMonth: number;
  userGrowth: Array<{ date: string; users: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  monthlyAssessments: Array<{ month: string; count: number }>;
  topSectors: Array<{ sector: string; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total assessments
      const { count: totalAssessments } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true });

      // Get average score
      const { data: scores } = await supabase
        .from('scores')
        .select('total_score');
      
      const averageScore = scores?.length 
        ? Math.round(scores.reduce((sum, s) => sum + s.total_score, 0) / scores.length)
        : 0;

      // Get assessments this month
      const monthStart = new Date();
      monthStart.setDate(1);
      const { count: assessmentsThisMonth } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString());

      // Mock data for charts (in real app, calculate from actual data)
      const userGrowth = [
        { date: '2024-01', users: 10 },
        { date: '2024-02', users: 25 },
        { date: '2024-03', users: 45 },
        { date: '2024-04', users: 68 },
        { date: '2024-05', users: 92 },
        { date: '2024-06', users: 120 },
      ];

      const scoreDistribution = [
        { range: '0-200', count: 5 },
        { range: '201-400', count: 15 },
        { range: '401-600', count: 25 },
        { range: '601-800', count: 30 },
        { range: '801-1000', count: 20 },
      ];

      const monthlyAssessments = [
        { month: 'Jan', count: 8 },
        { month: 'Feb', count: 12 },
        { month: 'Mar', count: 18 },
        { month: 'Apr', count: 24 },
        { month: 'May', count: 32 },
        { month: 'Jun', count: 28 },
      ];

      const topSectors = [
        { sector: 'Technology', count: 45 },
        { sector: 'Healthcare', count: 32 },
        { sector: 'Finance', count: 28 },
        { sector: 'E-commerce', count: 22 },
        { sector: 'Education', count: 18 },
      ];

      setData({
        totalUsers: totalUsers || 0,
        totalAssessments: totalAssessments || 0,
        averageScore,
        assessmentsThisMonth: assessmentsThisMonth || 0,
        userGrowth,
        scoreDistribution,
        monthlyAssessments,
        topSectors,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="p-6">Failed to load analytics data.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{data.totalAssessments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{data.averageScore}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{data.assessmentsThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyAssessments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
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
                  label
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

        <Card>
          <CardHeader>
            <CardTitle>Top Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topSectors} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="sector" />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
