
import React from 'react';
import { Label } from '@/components/ui/label';
import { QuestionRenderer } from './QuestionRenderer';
import { AssessmentStep } from '@/utils/assessmentQuestions';
import { AssessmentData } from '@/utils/scoreCalculator';

interface StepContentProps {
  step: AssessmentStep;
  formData: AssessmentData;
  onDataChange: (key: keyof AssessmentData, value: any) => void;
}

export const StepContent: React.FC<StepContentProps> = ({
  step,
  formData,
  onDataChange,
}) => {
  return (
    <div className="space-y-6">
      {step.questions.map((question) => {
        // Convert AssessmentQuestion to Question format
        const questionWithRequiredProps = {
          id: question.key,
          question: question.question,
          type: question.type,
          required: true, // All assessment questions are required
          options: question.options,
        };

        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-base font-medium">{question.question}</Label>
            <QuestionRenderer
              question={questionWithRequiredProps}
              value={formData[question.key as keyof AssessmentData]}
              onChange={(value) => onDataChange(question.key as keyof AssessmentData, value)}
            />
          </div>
        );
      })}
    </div>
  );
};
