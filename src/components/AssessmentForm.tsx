import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';

interface AssessmentFormProps {
  onComplete: (data: AssessmentData, result: ScoreResult) => void;
  initialData?: AssessmentData;
  onDataChange?: (data: AssessmentData) => void;
  isLoading?: boolean;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onComplete,
  initialData,
  onDataChange,
  isLoading = false,
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

  const steps = [
    {
      title: 'Product Development',
      questions: [
        {
          key: 'prototype',
          question: 'Do you have a working prototype or MVP?',
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Financial Status',
      questions: [
        {
          key: 'externalCapital',
          question: 'Have you raised external capital?',
          type: 'boolean',
        },
        {
          key: 'revenue',
          question: 'Are you generating revenue?',
          type: 'boolean',
        },
        {
          key: 'mrr',
          question: 'What is your Monthly Recurring Revenue (MRR)?',
          type: 'select',
          options: [
            { value: 'none', label: 'No recurring revenue' },
            { value: 'low', label: 'Low MRR ($1K-$10K)' },
            { value: 'medium', label: 'Medium MRR ($10K-$100K)' },
            { value: 'high', label: 'High MRR ($100K+)' }
          ]
        },
      ],
    },
    {
      title: 'Team & Operations',
      questions: [
        {
          key: 'fullTimeTeam',
          question: 'Do you have a full-time team?',
          type: 'boolean',
        },
        {
          key: 'employees',
          question: 'How many employees do you have?',
          type: 'select',
          options: [
            { value: '1-2', label: '1-2 employees' },
            { value: '3-10', label: '3-10 employees' },
            { value: '11-50', label: '11-50 employees' },
            { value: '50+', label: '50+ employees' }
          ]
        },
      ],
    },
    {
      title: 'Investment Readiness',
      questions: [
        {
          key: 'termSheets',
          question: 'Have you received any term sheets?',
          type: 'boolean',
        },
        {
          key: 'capTable',
          question: 'Do you have a cap table?',
          type: 'boolean',
        },
        {
          key: 'fundingGoal',
          question: 'What is your funding goal?',
          type: 'text',
        },
        {
          key: 'investors',
          question: 'What type of investors are you targeting?',
          type: 'select',
          options: [
            { value: 'none', label: 'Not targeting investors yet' },
            { value: 'angels', label: 'Angel investors' },
            { value: 'vc', label: 'Venture capital' },
            { value: 'lateStage', label: 'Late-stage investors' }
          ]
        },
      ],
    },
    {
      title: 'Growth & Milestones',
      questions: [
        {
          key: 'milestones',
          question: 'What best describes your current stage?',
          type: 'select',
          options: [
            { value: 'concept', label: 'Concept stage' },
            { value: 'launch', label: 'MVP launched' },
            { value: 'scale', label: 'Scaling business' },
            { value: 'exit', label: 'Exit preparation' }
          ]
        },
      ],
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateFormData = (key: keyof AssessmentData, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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

  const renderQuestion = (question: any) => {
    const value = formData[question.key as keyof AssessmentData];

    if (question.type === 'boolean') {
      return (
        <RadioGroup
          value={value === null ? '' : String(value)}
          onValueChange={(val: string) => updateFormData(question.key as keyof AssessmentData, val === 'true')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id={`${question.key}-yes`} />
            <Label htmlFor={`${question.key}-yes`}>Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id={`${question.key}-no`} />
            <Label htmlFor={`${question.key}-no`}>No</Label>
          </div>
        </RadioGroup>
      );
    }

    if (question.type === 'select') {
      return (
        <RadioGroup
          value={value || ''}
          onValueChange={(val: string) => updateFormData(question.key as keyof AssessmentData, val)}
        >
          {question.options?.map((option: any) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
              <Label htmlFor={`${question.key}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    if (question.type === 'textarea') {
      return (
        <Textarea
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData(question.key as keyof AssessmentData, e.target.value)}
          placeholder="Enter your response..."
          rows={4}
        />
      );
    }

    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData(question.key as keyof AssessmentData, e.target.value)}
        placeholder="Enter your response..."
      />
    );
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.questions.map((question, index) => (
            <div key={question.key} className="space-y-2">
              <Label className="text-base font-medium">{question.question}</Label>
              {renderQuestion(question)}
            </div>
          ))}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {isLastStep ? (
              <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? 'Calculating...' : 'Complete Assessment'}
              </Button>
            ) : (
              <Button onClick={handleNext}>Next</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
