
import React from 'react';
import { DraftSaving } from '@/components/DraftSaving';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { useAuth } from '@/hooks/useAuth';
import { AssessmentWizard } from '@/components/AssessmentWizard';

interface AssessmentViewProps {
  assessmentData: AssessmentData;
  currentStep: number;
  steps: Array<{ id: string; title: string; completed: boolean }>;
  isLoading: boolean;
  onComplete: (data: AssessmentData, result: ScoreResult) => Promise<void>;
  onDataChange: (data: AssessmentData) => Promise<void>;
  onLoadDraft: (data: AssessmentData, step: number) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  assessmentData,
  currentStep,
  steps,
  isLoading,
  onComplete,
  onDataChange,
  onLoadDraft,
}) => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Progress Indicator */}
      <div className="bg-card rounded-lg p-6 shadow-sm border">
        <ProgressIndicator steps={steps} currentStep={currentStep} />
      </div>
      
      {user && (
        <DraftSaving
          assessmentData={assessmentData}
          currentStep={currentStep}
          onLoadDraft={onLoadDraft}
        />
      )}
      
      <div className="bg-card rounded-lg shadow-sm border">
        <AssessmentWizard />
      </div>
    </div>
  );
};
