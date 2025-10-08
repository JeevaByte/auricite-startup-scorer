import React, { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, Mail } from 'lucide-react';
import { ScorecardInsights } from '@/components/investor/ScorecardInsights';
import { StartupData } from '@/hooks/useInvestorData';

interface ContactRequest {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  startup_user_id: string;
  profiles?: {
    full_name: string;
    company_name: string;
    email: string;
  };
  scores?: Array<{
    total_score: number;
    business_idea: number;
    team: number;
    traction: number;
    financials: number;
  }>;
}

const InterestRequests: React.FC = () => {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
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
        .eq('investor_user_id', user.id)
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Fetch profiles and scores for all startups
      const startupUserIds = contactData?.map(req => req.startup_user_id) || [];
      
      const [{ data: profiles }, { data: scores }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, company_name, email')
          .in('id', startupUserIds),
        supabase
          .from('scores')
          .select('user_id, total_score, business_idea, team, traction, financials')
          .in('user_id', startupUserIds)
      ]);

      // Combine the data
      const requestsWithDetails = contactData?.map(request => ({
        ...request,
        profiles: profiles?.find(p => p.id === request.startup_user_id),
        scores: scores?.filter(s => s.user_id === request.startup_user_id)
      })) || [];

      setRequests(requestsWithDetails as any);
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

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { icon: Clock, variant: 'outline' as const, label: 'Pending' },
      accepted: { icon: CheckCircle, variant: 'default' as const, label: 'Accepted' },
      declined: { icon: XCircle, variant: 'destructive' as const, label: 'Declined' },
    };

    const { icon: Icon, variant, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const convertToStartupData = (request: ContactRequest): StartupData => ({
    id: request.startup_user_id,
    user_id: request.startup_user_id,
    name: request.profiles?.full_name || 'Unknown',
    company_name: request.profiles?.company_name || 'Unknown Company',
    score: request.scores?.[0]?.total_score || 0,
    business_idea: request.scores?.[0]?.business_idea,
    team: request.scores?.[0]?.team,
    traction: request.scores?.[0]?.traction,
    financials: request.scores?.[0]?.financials,
    verified: false,
  });

  if (loading) {
    return (
      <AuthGuard requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your interest requests...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Interest Requests</h1>
          <p className="text-muted-foreground">
            Track your interest requests and their status
          </p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                You haven't shown interest in any startups yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Browse the deal flow to discover investment opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {request.profiles?.company_name || 'Unknown Company'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.profiles?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sent {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(request.status)}
                      {request.scores?.[0] && (
                        <Badge className="text-lg">
                          Score: {request.scores[0].total_score}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.message && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">Your Message:</p>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <ScorecardInsights startup={convertToStartupData(request)} />
                    {request.status === 'accepted' && request.profiles?.email && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:${request.profiles?.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Founder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default InterestRequests;