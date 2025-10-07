import React from 'react';
import { useInvestorData } from '@/hooks/useInvestorData';
import { PortfolioTracking } from '@/components/investor/PortfolioTracking';

export default function PortfolioPage() {
  const { portfolioStartups, savedStartups, feedStartups, loading, addToPortfolio } = useInvestorData();

  if (loading) {
    return <div className="text-center py-12">Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Investment Portfolio</h2>
        <p className="text-muted-foreground">
          Track and manage your active investments
        </p>
      </div>

      <PortfolioTracking 
        portfolioStartups={portfolioStartups}
        onAddToPortfolio={addToPortfolio}
        availableStartups={[...savedStartups, ...feedStartups]}
      />
    </div>
  );
}
