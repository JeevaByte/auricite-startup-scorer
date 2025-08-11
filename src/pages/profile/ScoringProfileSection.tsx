import React, { Suspense } from 'react';
const ScoringProfileManager = React.lazy(() => import('./scoring/ScoringProfileManager'));

export default function ScoringProfileSection() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <ScoringProfileManager />
    </Suspense>
  );
}
