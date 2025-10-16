import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Eye, Calendar, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { mockSavedStartups } from '@/utils/mockInvestorData';
import { useToast } from '@/hooks/use-toast';

export default function SavedStartups() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRemove = (companyName: string) => {
    toast({
      title: 'Removed',
      description: `${companyName} removed from saved list`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Startups</h1>
        <p className="text-muted-foreground">
          Manage your bookmarked investment opportunities - {mockSavedStartups.length} saved
        </p>
      </div>

      {mockSavedStartups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No saved startups yet</h3>
            <p className="text-muted-foreground mb-4">
              Save startups from the Deal Flow to track them here.
            </p>
            <Button onClick={() => navigate('/investor/deal-flow')}>
              Browse Deal Flow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSavedStartups.map((startup) => (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{startup.company_name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {startup.sector.slice(0, 2).map((sector) => (
                        <Badge key={sector} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(startup.company_name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score */}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className={`text-3xl font-bold ${getScoreColor(startup.total_score)}`}>
                    {startup.total_score}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Investment Readiness</div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <div className="font-bold text-primary">{startup.business_idea}</div>
                    <div className="text-xs text-muted-foreground">Idea</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{startup.team}</div>
                    <div className="text-xs text-muted-foreground">Team</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{startup.traction}</div>
                    <div className="text-xs text-muted-foreground">Traction</div>
                  </div>
                  <div>
                    <div className="font-bold text-primary">{startup.financials}</div>
                    <div className="text-xs text-muted-foreground">Finance</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Seeking:</span>
                    <span className="font-medium text-xs">{startup.funding_goal}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">MRR:</span>
                    <span className="font-medium text-xs">{startup.mrr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Saved:</span>
                    <span className="font-medium text-xs">
                      {new Date(startup.saved_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {startup.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">
                      <strong>Notes:</strong> {startup.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    size="sm"
                    onClick={() => navigate(`/investor/startup-details?id=${startup.id}`)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/investor/compare')}
                  >
                    Compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
