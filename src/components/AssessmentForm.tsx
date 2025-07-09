
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';
import { assessmentSteps } from '@/utils/assessmentQuestions';
import { StepContent } from './assessment/StepContent';
import { FormNavigation } from './assessment/FormNavigation';

interface AssessmentFormProps {
  onComplete: (data: AssessmentData, result: ScoreResult) => void;
  initialData?: AssessmentData;
  onDataChange?: (data: AssessmentData) => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onComplete,
  initialData,
  onDataChange,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AssessmentData>(
    initialData || {
      prototype: null,
      externalCapital: null,
      revenue: null,
      fullTimeTeam: null,
      termSheets: null,
      capTable: null,
      mrr: null,
      employees: null,
      fundingGoal: null,
      investors: null,
      milestones: null,
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep + 1) / assessmentSteps.length) * 100;

  const updateFormData = (key: keyof AssessmentData, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  // Check if current step is valid (all required questions answered)
  const isCurrentStepValid = () => {
    const currentStepData = assessmentSteps[currentStep];
    return currentStepData.questions.every(question => {
      const value = formData[question.key as keyof AssessmentData];
      return value !== null && value !== undefined && value !== '';
    });
  };

  const handleNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await calculateDynamicScore(formData);
      onComplete(formData, result);
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = assessmentSteps[currentStep];
  const isLastStep = currentStep === assessmentSteps.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep + 1} of {assessmentSteps.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <StepContent
            step={currentStepData}
            formData={formData}
            onDataChange={updateFormData}
          />

          <FormNavigation
            currentStep={currentStep + 1}
            totalSteps={assessmentSteps.length}
            isValid={isCurrentStepValid()}
            isSubmitting={isSubmitting}
            canGoBack={currentStep > 0}
            canGoNext={isCurrentStepValid()}
            isLastStep={isLastStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};
