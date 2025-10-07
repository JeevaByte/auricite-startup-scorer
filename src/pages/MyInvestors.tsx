import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingState } from '@/components/ui/loading-state';
import { 
  Bookmark, 
  Eye, 
  MessageSquare, 
  ExternalLink, 
  Trash2,
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedInvestor {
  id: string;
  investor_user_id: string;
  notes: string;
  saved_at: string;
  investor_profile: any;
}

interface InvestorView {
  id: string;
  investor_user_id: string;
  viewed_at: string;
  investor_profile: any;
}

export default function MyInvestors() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savedInvestors, setSavedInvestors] = useState<SavedInvestor[]>([]);
  const [viewedBy, setViewedBy] = useState<InvestorView[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchInvestorData();
    }
  }, [user]);

  const fetchInvestorData = async () => {
    try {
      setLoading(true);

      // Fetch saved investors
      const { data: saved } = await supabase
        .from('investor_saved_startups')
        .select(`
          *,
          investor_profile:investor_profiles!investor_saved_startups_investor_user_id_fkey(*)
        `)
        .eq('startup_user_id', user?.id);

      setSavedInvestors(saved || []);

      // Fetch investor matches
      const { data: matchData } = await supabase
        .from('investor_matches')
        .select(`
          *,
          investor_profile:investor_profiles!investor_matches_investor_user_id_fkey(*)
        `)
        .eq('startup_user_id', user?.id)
        .order('created_at', { ascending: false });

      setMatches(matchData || []);

    } catch (error) {
      console.error('Error fetching investor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (investorId: string) => {
    try {
      await supabase
        .from('investor_saved_startups')
        .delete()
        .eq('id', investorId);

      setSavedInvestors(prev => prev.filter(inv => inv.id !== investorId));
      
      toast({
        title: 'Removed',
        description: 'Investor removed from saved list',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove investor',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return <LoadingState message="Loading your investors..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Investors</h1>
          <p className="text-muted-foreground text-lg">
            Track saved investors, matches, and engagement history.
          </p>
        </div>

        <Tabs defaultValue="saved" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved ({savedInvestors.length})
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
          </TabsList>

          {/* Saved Investors Tab */}
          <TabsContent value="saved">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedInvestors.length > 0 ? (
                savedInvestors.map((saved) => (
                  <Card key={saved.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {saved.investor_profile?.display_name || 'Anonymous Investor'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {saved.investor_profile?.org_name || 'Independent'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSaved(saved.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {saved.investor_profile?.sectors?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {saved.investor_profile.sectors.slice(0, 3).map((sector: string) => (
                              <Badge key={sector} variant="secondary" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {saved.investor_profile?.ticket_min && saved.investor_profile?.ticket_max && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            ${saved.investor_profile.ticket_min.toLocaleString()} - 
                            ${saved.investor_profile.ticket_max.toLocaleString()}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Saved {new Date(saved.saved_at).toLocaleDateString()}
                        </div>
                      </div>

                      {saved.notes && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {saved.notes}
                          </p>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/investor/${saved.investor_user_id}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Saved Investors</h3>
                    <p className="text-muted-foreground mb-4">
                      Start browsing and save investors you're interested in connecting with.
                    </p>
                    <Button onClick={() => navigate('/investor-directory')}>
                      Browse Investors
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <Card key={match.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {match.investor_profile?.display_name || 'Anonymous Investor'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {match.investor_profile?.org_name || 'Independent'}
                          </p>
                        </div>
                        <Badge 
                          variant={match.match_score >= 75 ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {match.match_score}% Match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {match.investor_profile?.sectors?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {match.investor_profile.sectors.slice(0, 3).map((sector: string) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={match.status === 'accepted' ? 'default' : 'secondary'}>
                            {match.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/investor/${match.investor_user_id}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete your assessment to get matched with relevant investors.
                    </p>
                    <Button onClick={() => navigate('/?assessment=true')}>
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communication">
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Communication History</h3>
                <p className="text-muted-foreground mb-4">
                  Track your interactions with investors. This feature is coming soon.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
