
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isLastStep,
  isSubmitting,
  isLoading,
  onPrevious,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        Previous
      </Button>

      {isLastStep ? (
        <Button onClick={onSubmit} disabled={isSubmitting || isLoading}>
          {isSubmitting || isLoading ? 'Calculating...' : 'Complete Assessment'}
        </Button>
      ) : (
        <Button onClick={onNext}>Next</Button>
      )}
    </div>
  );
};
