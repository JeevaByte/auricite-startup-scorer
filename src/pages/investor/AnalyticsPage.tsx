import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Eye, 
  Bookmark, 
  Briefcase, 
  BarChart3, 
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { mockAnalytics, mockStartups } from '@/utils/mockInvestorData';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your deal flow activity and market insights
        </p>
      </div>

      {/* Your Activity Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.yourActivity.startupsViewed}</div>
            <p className="text-xs text-muted-foreground">Being evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-green-600">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8x</div>
            <p className="text-xs text-muted-foreground">Portfolio average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-green-600">Highly active</p>
          </CardContent>
        </Card>
      </div>

      {/* Deal Flow Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deal Flow by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalytics.dealFlowByMonth.map((month, idx) => {
              const maxCount = Math.max(...mockAnalytics.dealFlowByMonth.map(m => m.count));
              const percentage = (month.count / maxCount) * 100;
              return (
                <div key={month.month}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-muted-foreground">{month.count} startups</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary rounded-full h-3 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.scoreDistribution.map((range) => {
                const total = mockAnalytics.scoreDistribution.reduce((sum, r) => sum + r.count, 0);
                const percentage = Math.round((range.count / total) * 100);
                return (
                  <div key={range.range}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{range.range}</span>
                      <span className="text-muted-foreground">{range.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.stageDistribution.map((stage) => {
                const total = mockAnalytics.stageDistribution.reduce((sum, s) => sum + s.count, 0);
                const percentage = Math.round((stage.count / total) * 100);
                return (
                  <div key={stage.stage}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">{stage.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Sector Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.sectorBreakdown.map((sector) => {
              const total = mockAnalytics.sectorBreakdown.reduce((sum, s) => sum + s.count, 0);
              const percentage = Math.round((sector.count / total) * 100);
              const getScoreColor = (score: number) => {
                if (score >= 80) return 'text-green-600';
                if (score >= 60) return 'text-yellow-600';
                return 'text-orange-600';
              };
              
              return (
                <div key={sector.sector} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="font-semibold">{sector.sector}</h4>
                      <p className="text-sm text-muted-foreground">
                        {sector.count} startups ({percentage}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(sector.avgScore)}`}>
                        {sector.avgScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card className="bg-gradient-to-br from-primary/10 to-blue-50 border-primary/20">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <span>
                <strong>Deal Flow is Growing:</strong> You've reviewed {mockAnalytics.dealFlowByMonth[mockAnalytics.dealFlowByMonth.length - 1].count} startups this month, up {Math.round(((mockAnalytics.dealFlowByMonth[mockAnalytics.dealFlowByMonth.length - 1].count - mockAnalytics.dealFlowByMonth[0].count) / mockAnalytics.dealFlowByMonth[0].count) * 100)}% from {mockAnalytics.dealFlowByMonth[0].month}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <PieChart className="h-5 w-5 text-primary mt-0.5" />
              <span>
                <strong>Top Sector:</strong> {mockAnalytics.sectorBreakdown[0].sector} leads with {mockAnalytics.sectorBreakdown[0].count} startups and an average score of {mockAnalytics.sectorBreakdown[0].avgScore}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
              <span>
                <strong>Quality Pipeline:</strong> {mockAnalytics.scoreDistribution.filter(s => parseInt(s.range.split('-')[0]) >= 60).reduce((sum, s) => sum + s.count, 0)} startups ({Math.round((mockAnalytics.scoreDistribution.filter(s => parseInt(s.range.split('-')[0]) >= 60).reduce((sum, s) => sum + s.count, 0) / mockAnalytics.scoreDistribution.reduce((sum, s) => sum + s.count, 0)) * 100)}%) have scores above 60
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
