
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  isSubmitting: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isValid,
  isSubmitting,
  canGoBack,
  canGoNext,
  isLastStep,
  onPrevious,
  onNext,
  onSubmit
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoBack || isSubmitting}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}
      </div>

      {isLastStep ? (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!isValid || !canGoNext || isSubmitting}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
