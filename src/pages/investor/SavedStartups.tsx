import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInvestorData } from '@/hooks/useInvestorData';
import { ScorecardInsights } from '@/components/investor/ScorecardInsights';
import { Heart } from 'lucide-react';

export default function SavedStartups() {
  const { savedStartups, loading, unsaveStartup } = useInvestorData();

  if (loading) {
    return <div className="text-center py-12">Loading saved startups...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Saved Startups</h2>
        <p className="text-muted-foreground">
          Manage your bookmarked investment opportunities
        </p>
      </div>

      {savedStartups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">No saved startups yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Save startups from the Deal Flow to track them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedStartups.map((startup) => (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{startup.company_name}</CardTitle>
                <div className="text-sm text-muted-foreground">{startup.name}</div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-primary">{startup.score}</div>
                  <div className="text-sm text-muted-foreground">Readiness Score</div>
                </div>
                {startup.notes && (
                  <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded-md">
                    {startup.notes}
                  </p>
                )}
                <div className="space-y-2">
                  <ScorecardInsights 
                    startup={startup}
                    trigger={<Button variant="outline" className="w-full">View Details</Button>}
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => unsaveStartup(startup.user_id)}
                  >
                    Remove from Saved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
