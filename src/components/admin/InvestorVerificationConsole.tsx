import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InvestorProfile {
  id: string;
  user_id: string;
  display_name: string;
  org_name: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes: string | null;
  personal_capital: boolean;
  structured_fund: boolean;
  registered_entity: boolean;
  check_size: string;
  stage: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export const InvestorVerificationConsole: React.FC = () => {
  const [profiles, setProfiles] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<InvestorProfile | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_profiles')
        .select(`
          *,
          profiles!investor_profiles_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles((data || []) as any);
    } catch (error: any) {
      toast({
        title: 'Error loading profiles',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleVerification = async (
    profileId: string,
    status: 'verified' | 'rejected',
    verificationNotes: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_profiles')
        .update({
          verification_status: status,
          verification_notes: verificationNotes,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: `Investor ${status}`,
        description: `The investor profile has been ${status}.`,
      });

      setSelectedProfile(null);
      setNotes('');
      await fetchProfiles();
    } catch (error: any) {
      toast({
        title: 'Error updating verification',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { icon: React.ReactNode; variant: any; label: string }> = {
      pending: {
        icon: <Clock className="h-4 w-4 mr-1" />,
        variant: 'outline',
        label: 'Pending',
      },
      verified: {
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        variant: 'default',
        label: 'Verified',
      },
      rejected: {
        icon: <XCircle className="h-4 w-4 mr-1" />,
        variant: 'destructive',
        label: 'Rejected',
      },
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading investor verification queue...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Investor Verification Console
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No investor profiles to review.
              </p>
            ) : (
              profiles.map((profile) => (
                <Card key={profile.id} className="border">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {profile.display_name || profile.profiles?.full_name || 'Unknown'}
                        </h3>
                        {profile.org_name && (
                          <p className="text-sm text-muted-foreground">{profile.org_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{profile.profiles?.email}</p>
                      </div>
                      {getStatusBadge(profile.verification_status)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Investment Details:</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Personal Capital: {profile.personal_capital ? 'Yes' : 'No'}</li>
                          <li>• Structured Fund: {profile.structured_fund ? 'Yes' : 'No'}</li>
                          <li>• Registered Entity: {profile.registered_entity ? 'Yes' : 'No'}</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Preferences:</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          <li>• Check Size: {profile.check_size}</li>
                          <li>• Stage: {profile.stage}</li>
                        </ul>
                      </div>
                    </div>

                    {profile.verification_notes && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm text-muted-foreground">{profile.verification_notes}</p>
                      </div>
                    )}

                    {profile.verification_status === 'pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedProfile(profile);
                              setNotes(profile.verification_notes || '');
                            }}
                          >
                            Review Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Verify Investor Profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium mb-2">
                                {profile.display_name || profile.profiles?.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                {profile.profiles?.email}
                              </p>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Verification Notes
                              </label>
                              <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this verification..."
                                rows={4}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className="flex-1"
                                onClick={() =>
                                  handleVerification(profile.id, 'verified', notes)
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() =>
                                  handleVerification(profile.id, 'rejected', notes)
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};