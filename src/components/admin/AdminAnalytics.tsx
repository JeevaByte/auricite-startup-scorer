
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

// Mock data - replace with real data from your analytics
const scoreDistribution = [
  { range: '0-200', count: 12 },
  { range: '201-400', count: 28 },
  { range: '401-600', count: 45 },
  { range: '601-800', count: 32 },
  { range: '801-1000', count: 18 },
];

const monthlyTrends = [
  { month: 'Jan', assessments: 45, avgScore: 520 },
  { month: 'Feb', assessments: 52, avgScore: 535 },
  { month: 'Mar', assessments: 68, avgScore: 548 },
  { month: 'Apr', assessments: 71, avgScore: 562 },
  { month: 'May', assessments: 83, avgScore: 578 },
  { month: 'Jun', assessments: 89, avgScore: 585 },
];

const categoryBreakdown = [
  { name: 'Business Idea', value: 25, color: '#3b82f6' },
  { name: 'Team', value: 22, color: '#10b981' },
  { name: 'Financials', value: 28, color: '#f59e0b' },
  { name: 'Traction', value: 25, color: '#ef4444' },
];

export const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+24%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Scorers</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">700+ score this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">Assessment completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="assessments" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Assessments"
                />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Daily Active Users</span>
                <span className="text-sm text-muted-foreground">432</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weekly Active Users</span>
                <span className="text-sm text-muted-foreground">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Monthly Active Users</span>
                <span className="text-sm text-muted-foreground">3,891</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Session Duration</span>
                <span className="text-sm text-muted-foreground">12m 34s</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
