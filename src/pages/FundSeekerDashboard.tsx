import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, XCircle, User, Building, TrendingUp, DollarSign, ArrowRight, MapPin, Star } from 'lucide-react';
import { mockInvestorDirectory, mockStartupDirectory } from '@/utils/directoryMockData';
import { useNavigate } from 'react-router-dom';

interface IncomingRequest {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  investor_user_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const FundSeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [investors, setInvestors] = useState(mockInvestorDirectory);
  const [startups, setStartups] = useState(mockStartupDirectory);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch contact requests
      const { data: contactData, error: contactError } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('startup_user_id', user.id)
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Fetch investor profiles
      if (contactData && contactData.length > 0) {
        const investorIds = contactData.map(r => r.investor_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', investorIds);

        if (profilesError) throw profilesError;

        // Merge data
        const requestsWithProfiles = contactData.map(request => ({
          ...request,
          profiles: profilesData?.find(p => p.id === request.investor_user_id)
        }));

        setRequests(requestsWithProfiles as any);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      toast({
        title: 'Error loading requests',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectories = async () => {
    try {
      // Fetch investors from Supabase
      const { data: investorData, error: investorError } = await supabase
        .from('investor_directory')
        .select('*')
        .eq('is_active', true)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(12);

      if (!investorError && investorData && investorData.length > 0) {
        setInvestors(investorData as any);
      }

      // Fetch startups from Supabase
      const { data: startupData, error: startupError } = await supabase
        .from('startup_directory')
        .select('*')
        .eq('is_active', true)
        .eq('visibility', 'public')
        .eq('seeking_funding', true)
        .order('readiness_score', { ascending: false })
        .limit(12);

      if (!startupError && startupData && startupData.length > 0) {
        setStartups(startupData as any);
      }
    } catch (error: any) {
      console.log('Using mock data - Supabase fetch failed:', error.message);
      // Fallback to mock data (already set in state)
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchDirectories();
  }, []);

  const handleRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: `Request ${status}`,
        description: `You have ${status} the investor's interest.`,
      });

      await fetchRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <AuthGuard requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fundraiser Dashboard</h1>
          <p className="text-muted-foreground">
            Manage investor interest and explore opportunities
          </p>
        </div>

        {/* Summary Card */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accepted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {requests.filter(r => r.status === 'accepted').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="requests">
              <Mail className="h-4 w-4 mr-2" />
              Investor Requests
            </TabsTrigger>
            <TabsTrigger value="investors">
              <User className="h-4 w-4 mr-2" />
              Investor Directory
            </TabsTrigger>
            <TabsTrigger value="startups">
              <Building className="h-4 w-4 mr-2" />
              Startup Directory
            </TabsTrigger>
          </TabsList>

          {/* Investor Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Investor Interest Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No investor interest yet. Complete your assessment to attract investors!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => {
                      return (
                        <Card key={request.id} className="border">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                  <h3 className="font-semibold text-lg">
                                    {request.profiles?.full_name || 'Unknown Investor'}
                                  </h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {request.profiles?.email}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Received {new Date(request.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={
                                request.status === 'pending' ? 'outline' :
                                request.status === 'accepted' ? 'default' : 'destructive'
                              }>
                                {request.status}
                              </Badge>
                            </div>

                            {request.message && (
                              <div className="mb-4 p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium mb-1">Message:</p>
                                <p className="text-sm text-muted-foreground">{request.message}</p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleRequest(request.id, 'accepted')}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleRequest(request.id, 'declined')}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              {request.status === 'accepted' && request.profiles?.email && (
                                <div className="w-full">
                                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800 font-medium mb-2 flex items-center">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Contact information unlocked!
                                    </p>
                                    <p className="text-xs text-green-700">
                                      You can now reach out to this investor via email.
                                    </p>
                                  </div>
                                  <Button
                                    onClick={() => window.open(`mailto:${request.profiles?.email}?subject=Re: Interest in my startup&body=Hi ${request.profiles?.full_name},

Thank you for expressing interest in my startup! I'd love to discuss this opportunity with you.

Best regards`, '_blank')}
                                    className="w-full"
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email: {request.profiles.email}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investor Directory Tab */}
          <TabsContent value="investors">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Investor Directory</CardTitle>
                    <p className="text-sm text-muted-foreground">Connect with investors looking for opportunities like yours</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/investors')}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {investors.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No investors found matching your criteria
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investors.slice(0, 6).map((investor) => (
                      <Card key={investor.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold mb-1">{investor.name}</h3>
                            <p className="text-sm text-muted-foreground">{investor.organization}</p>
                            <p className="text-xs text-muted-foreground">{investor.title}</p>
                          </div>
                          {investor.is_verified && (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{investor.bio}</p>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {investor.regions.join(', ')}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            ${(investor.ticket_min / 1000).toFixed(0)}K - ${(investor.ticket_max / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {investor.sectors.slice(0, 2).map((sector) => (
                            <Badge key={sector} variant="outline" className="text-xs">{sector}</Badge>
                          ))}
                        </div>
                        <Button size="sm" className="w-full" onClick={() => navigate('/investors')}>
                          View Profile
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Startup Directory Tab */}
          <TabsContent value="startups">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">Startup Directory</CardTitle>
                    <p className="text-sm text-muted-foreground">Discover investment-ready startups</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate('/startup-directory')}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {startups.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No startups found
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startups.slice(0, 6).map((startup) => (
                      <Card key={startup.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{startup.company_name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{startup.tagline}</p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                            <Star className="h-3 w-3 text-primary fill-primary" />
                            <span className="text-xs font-semibold text-primary">{startup.readiness_score}</span>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            {startup.team_size} employees • {startup.stage}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {startup.current_mrr ? `$${(startup.current_mrr / 1000).toFixed(0)}K MRR` : startup.sector}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {startup.location}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs">{startup.sector}</Badge>
                          {startup.is_verified && (
                            <Badge variant="default" className="text-xs">Verified</Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="w-full" onClick={() => navigate('/startup-directory')}>
                          View Details
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
};

export default FundSeekerDashboard;
