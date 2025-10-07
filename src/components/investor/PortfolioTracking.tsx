import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Download, Bell, Plus } from 'lucide-react';

export const PortfolioTracking: React.FC = () => {
  const [portfolioStartups] = useState([
    { 
      id: '1', 
      name: 'TechCo AI', 
      sector: 'AI/ML', 
      investmentDate: '2024-01-15',
      amount: '$500K',
      currentScore: 78,
      lastScore: 66,
      trend: 'up',
      alerts: 2
    },
    { 
      id: '2', 
      name: 'FinTech Solutions', 
      sector: 'FinTech', 
      investmentDate: '2024-03-20',
      amount: '$250K',
      currentScore: 72,
      lastScore: 75,
      trend: 'down',
      alerts: 1
    },
    { 
      id: '3', 
      name: 'HealthTech Inc', 
      sector: 'HealthTech', 
      investmentDate: '2023-11-10',
      amount: '$1M',
      currentScore: 85,
      lastScore: 82,
      trend: 'up',
      alerts: 0
    },
  ]);

  const scoreHistoryData = [
    { month: 'Jan', techco: 66, fintech: 70, health: 78 },
    { month: 'Feb', techco: 68, fintech: 73, health: 80 },
    { month: 'Mar', techco: 70, fintech: 75, health: 82 },
    { month: 'Apr', techco: 73, fintech: 74, health: 83 },
    { month: 'May', techco: 75, fintech: 73, health: 84 },
    { month: 'Jun', techco: 78, fintech: 72, health: 85 },
  ];

  const portfolioHealth = {
    totalInvested: '$1.75M',
    avgScore: 78.3,
    topPerformer: 'HealthTech Inc',
    diversificationScore: 8.5
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Portfolio Tracking</h2>
          <p className="text-muted-foreground">
            Monitor your investments and track startup progress over time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Startup
          </Button>
        </div>
      </div>

      {/* Portfolio Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioHealth.totalInvested}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg. Readiness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{portfolioHealth.avgScore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{portfolioHealth.topPerformer}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioHealth.diversificationScore}/10</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Evolution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Evolution Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreHistoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[60, 90]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="techco" stroke="#3b82f6" name="TechCo AI" strokeWidth={2} />
              <Line type="monotone" dataKey="fintech" stroke="#8b5cf6" name="FinTech Solutions" strokeWidth={2} />
              <Line type="monotone" dataKey="health" stroke="#10b981" name="HealthTech Inc" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Portfolio Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Startup</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Investment Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Current Score</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioStartups.map((startup) => (
                <TableRow key={startup.id}>
                  <TableCell className="font-medium">{startup.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{startup.sector}</Badge>
                  </TableCell>
                  <TableCell>{new Date(startup.investmentDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-semibold">{startup.amount}</TableCell>
                  <TableCell>
                    <span className="text-lg font-bold">{startup.currentScore}</span>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 ${startup.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {startup.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-medium">
                        {startup.trend === 'up' ? '+' : ''}{startup.currentScore - startup.lastScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {startup.alerts > 0 && (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Bell className="h-4 w-4" />
                        <span>{startup.alerts}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">TechCo AI's readiness score improved by +12 points</p>
                <p className="text-sm text-muted-foreground">Strong traction growth and new team hire - 2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">FinTech Solutions quarterly re-evaluation due</p>
                <p className="text-sm text-muted-foreground">Schedule assessment for updated metrics - 1 week ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-background rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">HealthTech Inc achieved profitability milestone</p>
                <p className="text-sm text-muted-foreground">Financial metrics significantly improved - 3 weeks ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
