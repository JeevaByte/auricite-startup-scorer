import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Heart, Crown, Loader2 } from 'lucide-react';
import { DonationButton } from './DonationButton';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/ui/loading-state';

interface AccessControlProps {
  accessType: 'investor_directory' | 'learning_resources' | 'pitch_upload';
  children: React.ReactNode;
  title: string;
  description: string;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  accessType,
  children,
  title,
  description
}) => {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('has_paid_access', { 
          user_uuid: user.id, 
          access_type_param: accessType 
        });

      if (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } else {
        setHasAccess(data || false);
      }
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkAccess();
    }
  }, [user, authLoading, accessType]);

  if (authLoading || loading) {
    return <LoadingState message="Checking access permissions..." />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access {title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Unlock with a Donation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Support our mission and get instant access to:
              </p>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Complete Investor Directory
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Premium Learning Resources
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Pitch Deck Upload & Management
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Priority Support
                </li>
              </ul>
              <DonationButton size="lg" className="w-full" />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Prefer a subscription? Get unlimited access with premium plans.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/pricing'}
                className="w-full"
              >
                <Crown className="h-4 w-4 mr-2" />
                View Pricing Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};