import React from 'react';
import { UnifiedAssessmentWizard } from '@/components/assessment/UnifiedAssessmentWizard';
import { AuthGuard } from '@/components/auth/AuthGuard';

const Assessment: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
      <AuthGuard requireAuth>
        <UnifiedAssessmentWizard />
      </AuthGuard>
    </div>
  );
};

export default Assessment;