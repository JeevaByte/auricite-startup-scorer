import React from 'react';
import { UnifiedAssessmentWizard } from '@/components/assessment/UnifiedAssessmentWizard';
import { AuthGuard } from '@/components/auth/AuthGuard';


interface UnifiedAssessmentProps {
  mode?: 'quick' | 'comprehensive';
  onComplete?: (result: any) => void;
}

export const UnifiedAssessment: React.FC<UnifiedAssessmentProps> = ({ 
  mode = 'comprehensive',
  onComplete 
}) => {
  return (
    <AuthGuard requireAuth>
      <UnifiedAssessmentWizard />
    </AuthGuard>
  );
};