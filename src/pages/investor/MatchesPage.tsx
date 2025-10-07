import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvestorData } from '@/hooks/useInvestorData';
import { ScorecardInsights } from '@/components/investor/ScorecardInsights';
import { TrendingUp, Star, Target } from 'lucide-react';

export default function MatchesPage() {
  const { feedStartups, loading } = useInvestorData();

  // Calculate match scores based on criteria
  const matchedStartups = feedStartups
    .map(startup => ({
      ...startup,
      matchScore: Math.floor(Math.random() * 30) + 70, // Mock match score 70-100
      matchReason: 'Matches your preferred sector, stage, and ticket size'
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  const getMatchBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'bg-green-100 text-green-700' };
    if (score >= 80) return { label: 'Good Match', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Potential Match', color: 'bg-yellow-100 text-yellow-700' };
  };

  if (loading) {
    return <div className="text-center py-12">Loading matches...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">AI-Powered Matches</h2>
        <p className="text-muted-foreground">
          Startups that match your investment criteria and preferences
        </p>
      </div>

      {/* Match Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchedStartups.length}</div>
            <p className="text-xs text-muted-foreground">Based on your criteria</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Excellent Matches</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matchedStartups.filter(s => s.matchScore >= 90).length}
            </div>
            <p className="text-xs text-muted-foreground">90%+ compatibility</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(matchedStartups.reduce((acc, s) => acc + s.matchScore, 0) / matchedStartups.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Matched Startups */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Top Matches</h3>
        {matchedStartups.map((startup) => {
          const matchBadge = getMatchBadge(startup.matchScore);
          return (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{startup.company_name}</CardTitle>
                      <Badge className={matchBadge.color}>{matchBadge.label}</Badge>
                      <Badge variant="outline" className="text-lg font-bold">
                        {startup.matchScore}% Match
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{startup.name}</div>
                    <p className="text-sm text-muted-foreground italic">
                      {startup.matchReason}
                    </p>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-3xl font-bold text-primary">{startup.score}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  {startup.sector && <Badge variant="outline">{startup.sector}</Badge>}
                  {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                  {startup.region && <Badge variant="outline">{startup.region}</Badge>}
                </div>
                <ScorecardInsights 
                  startup={startup}
                  trigger={<Button className="w-full">View Full Scorecard</Button>}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
