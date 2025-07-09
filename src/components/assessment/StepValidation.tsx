
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepValidationProps {
  currentStep: number;
  formData: Record<string, any>;
  questions: any[];
  onValidationChange: (isValid: boolean) => void;
}

export const StepValidation: React.FC<StepValidationProps> = ({
  currentStep,
  formData,
  questions,
  onValidationChange
}) => {
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    validateCurrentStep();
  }, [currentStep, formData]);

  const validateCurrentStep = () => {
    const stepQuestions = questions.filter(q => q.step === currentStep);
    const stepErrors: string[] = [];

    stepQuestions.forEach(question => {
      const value = formData[question.id];
      
      if (question.required && (value === null || value === undefined || value === '')) {
        stepErrors.push(`${question.question} is required`);
      }
    });

    setErrors(stepErrors);
    onValidationChange(stepErrors.length === 0);
  };

  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">Please answer all required questions:</p>
          <ul className="list-disc list-inside text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};
