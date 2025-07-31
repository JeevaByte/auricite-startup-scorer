
import React from 'react';
import { UnifiedAssessmentWizard } from '@/components/assessment/UnifiedAssessmentWizard';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const AssessmentView: React.FC = () => {
  return (
    <AuthGuard requireAuth>
      <UnifiedAssessmentWizard />
    </AuthGuard>
  );
};
