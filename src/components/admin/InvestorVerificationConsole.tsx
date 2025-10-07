import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Loader2, Mail, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InvestorProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  org_name: string | null;
  bio: string | null;
  sectors: string[] | null;
  ticket_min: number | null;
  ticket_max: number | null;
  region: string | null;
  verification_status: string;
  is_qualified: boolean;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export const InvestorVerificationConsole = () => {
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<InvestorProfile | null>(null);
  const { toast } = useToast();

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately
      const profilesWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', profile.user_id)
            .single();
          
          return {
            ...profile,
            profiles: userData || { email: '', full_name: '' },
          };
        })
      );

      setProfiles(profilesWithEmails as InvestorProfile[]);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load investor profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleVerificationUpdate = async (
    profileId: string,
    newStatus: 'verified' | 'rejected',
    isQualified: boolean
  ) => {
    setProcessing(profileId);
    try {
      const { error } = await supabase
        .from('investor_profiles')
        .update({
          verification_status: newStatus,
          is_qualified: isQualified,
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Investor profile ${newStatus === 'verified' ? 'verified' : 'rejected'} successfully`,
      });

      await loadProfiles();
      setSelectedProfile(null);
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update verification status',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const pendingCount = profiles.filter((p) => p.verification_status === 'pending').length;
  const verifiedCount = profiles.filter((p) => p.verification_status === 'verified').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Investor Verification Console</CardTitle>
          <CardDescription>
            Review and approve investor profiles for verified badge eligibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-lg">{pendingCount}</div>
                <div className="text-sm">Pending Review</div>
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-lg">{verifiedCount}</div>
                <div className="text-sm">Verified</div>
              </AlertDescription>
            </Alert>
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-lg">{profiles.length}</div>
                <div className="text-sm">Total Profiles</div>
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {profile.display_name || profile.profiles?.full_name || 'Unnamed Investor'}
                      </h3>
                      {getStatusBadge(profile.verification_status)}
                      {profile.is_qualified && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Qualified
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {profile.org_name && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          {profile.org_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {profile.profiles?.email}
                      </div>
                      {profile.sectors && profile.sectors.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {profile.sectors.map((sector) => (
                            <Badge key={sector} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {(profile.ticket_min || profile.ticket_max) && (
                        <p className="mt-1">
                          Ticket: ${(profile.ticket_min || 0).toLocaleString()} - $
                          {(profile.ticket_max || 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      Review
                    </Button>
                    {profile.verification_status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerificationUpdate(profile.id, 'verified', true)}
                          disabled={processing === profile.id}
                        >
                          {processing === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerificationUpdate(profile.id, 'rejected', false)}
                          disabled={processing === profile.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No investor profiles found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investor Profile Details</DialogTitle>
            <DialogDescription>Review complete profile information</DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Display Name</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProfile.display_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Organization</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProfile.org_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedProfile.profiles?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Region</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProfile.region || 'Not provided'}
                  </p>
                </div>
              </div>
              {selectedProfile.bio && (
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <p className="text-sm text-muted-foreground">{selectedProfile.bio}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() =>
                    handleVerificationUpdate(selectedProfile.id, 'verified', true)
                  }
                  disabled={processing === selectedProfile.id}
                  className="flex-1"
                >
                  Verify & Qualify
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    handleVerificationUpdate(selectedProfile.id, 'rejected', false)
                  }
                  disabled={processing === selectedProfile.id}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
