import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, Heart, Briefcase, BarChart3, PieChart } from 'lucide-react';
import { useInvestorData } from '@/hooks/useInvestorData';

export default function AnalyticsPage() {
  const { savedStartups, portfolioStartups, feedStartups, loading } = useInvestorData();

  const stats = {
    totalViewed: feedStartups.length,
    totalSaved: savedStartups.length,
    activeInvestments: portfolioStartups.length,
    avgScore: Math.round(
      feedStartups.reduce((acc, s) => acc + (s.score || 0), 0) / (feedStartups.length || 1)
    ),
  };

  const sectorDistribution = feedStartups.reduce((acc, startup) => {
    const sector = startup.sector || 'Other';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Track your deal flow activity and market insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Startups Viewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViewed}</div>
            <p className="text-xs text-muted-foreground">In deal flow</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Startups</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSaved}</div>
            <p className="text-xs text-muted-foreground">Bookmarked opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">In portfolio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <p className="text-xs text-muted-foreground">Deal flow quality</p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Top Sectors in Deal Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSectors.map(([sector, count]) => {
              const percentage = Math.round((count / feedStartups.length) * 100);
              return (
                <div key={sector}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{sector}</span>
                    <span className="text-muted-foreground">{count} startups ({percentage}%)</span>
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
            {[
              { range: '80-100', label: 'Excellent', count: feedStartups.filter(s => s.score >= 80).length },
              { range: '60-79', label: 'Good', count: feedStartups.filter(s => s.score >= 60 && s.score < 80).length },
              { range: '40-59', label: 'Fair', count: feedStartups.filter(s => s.score >= 40 && s.score < 60).length },
              { range: '0-39', label: 'Needs Work', count: feedStartups.filter(s => s.score < 40).length },
            ].map(({ range, label, count }) => {
              const percentage = Math.round((count / (feedStartups.length || 1)) * 100);
              return (
                <div key={range}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{range} - {label}</span>
                    <span className="text-muted-foreground">{count} startups ({percentage}%)</span>
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
  );
}
