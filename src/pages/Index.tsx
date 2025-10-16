import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import RoleSelection from './RoleSelection';
import FundSeekerLanding from './FundSeekerLanding';
import InvestorLanding from './InvestorLanding';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Index() {
  const { user, userRole, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Not logged in - show role selection
  if (!user) {
    return <RoleSelection />;
  }

  // Logged in as investor - show investor landing
  if (userRole === 'investor') {
    return <InvestorLanding />;
  }

  // Logged in as fund seeker or default - show fund seeker landing
  return <FundSeekerLanding />;
}
