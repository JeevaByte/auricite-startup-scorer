import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Target, Eye, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { mockMatches } from '@/utils/mockInvestorData';
import { useToast } from '@/hooks/use-toast';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getMatchBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'bg-green-100 text-green-700' };
    if (score >= 80) return { label: 'Good Match', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Potential Match', color: 'bg-yellow-100 text-yellow-700' };
  };

  const handleAccept = (companyName: string) => {
    toast({
      title: 'Match Accepted',
      description: `${companyName} has been accepted. We'll notify them of your interest.`,
    });
  };

  const handleReject = (companyName: string) => {
    toast({
      title: 'Match Rejected',
      description: `${companyName} has been removed from your matches.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">AI-Powered Matches</h1>
        <p className="text-muted-foreground">
          Startups that match your investment criteria and preferences
        </p>
      </div>

      {/* Match Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMatches.length}</div>
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
              {mockMatches.filter(s => s.match_score >= 90).length}
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
              {Math.round(mockMatches.reduce((acc, s) => acc + s.match_score, 0) / mockMatches.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Lightbulb className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockMatches.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your decision</p>
          </CardContent>
        </Card>
      </div>

      {/* Matched Startups */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Top Matches for You</h3>
        {mockMatches.map((startup) => {
          const matchBadge = getMatchBadge(startup.match_score);
          return (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CardTitle className="text-xl">{startup.company_name}</CardTitle>
                      <Badge className={matchBadge.color}>{matchBadge.label}</Badge>
                      <Badge variant="outline" className="text-lg font-bold">
                        {startup.match_score}% Match
                      </Badge>
                      <Badge 
                        variant={startup.status === 'accepted' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {startup.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {startup.description}
                    </p>
                  </div>
                  <div className="text-center ml-4">
                    <div className="text-3xl font-bold text-primary">{startup.total_score}</div>
                    <div className="text-xs text-muted-foreground">Readiness</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Why Matched */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-blue-900">
                    <Lightbulb className="h-4 w-4" />
                    Why This is a Good Match
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {startup.match_reason.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sectors & Details */}
                <div className="flex flex-wrap gap-2">
                  {startup.sector.map((sector) => (
                    <Badge key={sector} variant="secondary">{sector}</Badge>
                  ))}
                  <Badge variant="outline">{startup.stage}</Badge>
                  <Badge variant="outline">{startup.region}</Badge>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{startup.business_idea}</div>
                    <div className="text-xs text-muted-foreground">Idea</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{startup.team}</div>
                    <div className="text-xs text-muted-foreground">Team</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{startup.traction}</div>
                    <div className="text-xs text-muted-foreground">Traction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{startup.financials}</div>
                    <div className="text-xs text-muted-foreground">Finance</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: 'Opening Details',
                        description: `Viewing ${startup.company_name} full scorecard`,
                      });
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Full Scorecard
                  </Button>
                  {startup.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleAccept(startup.company_name)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject(startup.company_name)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Pass
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
