import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, XCircle, User, Building } from 'lucide-react';

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
  investor_profiles?: Array<{
    display_name: string;
    org_name: string;
    verification_status: string;
    bio: string;
  }>;
}

const FundSeekerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          profiles!contact_requests_investor_user_id_fkey (
            full_name,
            email
          ),
          investor_profiles!investor_profiles_user_id_fkey (
            display_name,
            org_name,
            verification_status,
            bio
          )
        `)
        .eq('startup_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as any);
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

  useEffect(() => {
    fetchRequests();
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
            Manage investor interest and connection requests
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

        {/* Requests List */}
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
                  const investorProfile = request.investor_profiles?.[0];
                  return (
                    <Card key={request.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold text-lg">
                                {investorProfile?.display_name || request.profiles?.full_name || 'Unknown Investor'}
                              </h3>
                              {investorProfile?.verification_status === 'verified' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                            {investorProfile?.org_name && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <Building className="h-4 w-4" />
                                {investorProfile.org_name}
                              </div>
                            )}
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

                        {investorProfile?.bio && (
                          <div className="mb-4 p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Investor Bio:</p>
                            <p className="text-sm text-muted-foreground">{investorProfile.bio}</p>
                          </div>
                        )}

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
                                onClick={() => window.open(`mailto:${request.profiles?.email}?subject=Re: Interest in my startup&body=Hi ${investorProfile?.display_name || request.profiles?.full_name},

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
      </div>
    </AuthGuard>
  );
};

export default FundSeekerDashboard;