import React from 'react';
import { useInvestorData } from '@/hooks/useInvestorData';
import { StartupComparison } from '@/components/investor/StartupComparison';

export default function ComparisonPage() {
  const { savedStartups, feedStartups, loading } = useInvestorData();

  if (loading) {
    return <div className="text-center py-12">Loading comparison tool...</div>;
  }

  const allStartups = [...savedStartups, ...feedStartups.slice(0, 20)];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Startup Comparison</h2>
        <p className="text-muted-foreground">
          Compare up to 4 startups side-by-side to make informed investment decisions
        </p>
      </div>

      <StartupComparison startups={allStartups} />
    </div>
  );
}
