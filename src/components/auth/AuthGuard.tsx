
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Crown } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requirePremium?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requirePremium = false,
  fallback
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPremiumAccess, loading: subLoading, plans } = useSubscription();

  if (authLoading || subLoading) {
    return <LoadingState message="Checking access..." />;
  }

  if (requireAuth && !user) {
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You need to be logged in to access this feature.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (requirePremium && !hasPremiumAccess) {
    const premiumPlan = plans.find(p => p.name === 'Premium');
    
    return fallback || (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <CardTitle>Premium Access Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            This feature is available for Premium subscribers only.
          </p>
          {premiumPlan && (
            <div className="mb-4 p-4 bg-muted rounded-lg">
              <p className="font-semibold">${premiumPlan.price_monthly}/month</p>
              <ul className="text-sm text-muted-foreground mt-2">
                {premiumPlan.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrad
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
