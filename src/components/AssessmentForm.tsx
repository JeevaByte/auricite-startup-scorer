import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { AssessmentData, ScoreResult } from '@/pages/Index';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';

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

  const steps = [
    {
      title: 'Product Development',
      questions: [
        {
          key: 'prototype' as keyof AssessmentData,
          question: 'Do you have a working prototype or MVP?',
          type: 'boolean',
        },
      ],
    },
    {
      title: 'Financial Status',
      questions: [
        {
          key: 'externalCapital' as keyof AssessmentData,
          question: 'Have you raised external capital?',
          type: 'boolean',
        },
        {
          key: 'revenue' as keyof AssessmentData,
          question: 'Are you generating revenue?',
          type: 'boolean',
        },
        {
          key: 'mrr' as keyof AssessmentData,
          question: 'What is your Monthly Recurring Revenue (MRR)?',
          type: 'text',
        },
      ],
    },
    {
      title: 'Team & Operations',
      questions: [
        {
          key: 'fullTimeTeam' as keyof AssessmentData,
          question: 'Do you have a full-time team?',
          type: 'boolean',
        },
        {
          key: 'employees' as keyof AssessmentData,
          question: 'How many employees do you have?',
          type: 'text',
        },
      ],
    },
    {
      title: 'Investment Readiness',
      questions: [
        {
          key: 'termSheets' as keyof AssessmentData,
          question: 'Have you received any term sheets?',
          type: 'boolean',
        },
        {
          key: 'capTable' as keyof AssessmentData,
          question: 'Do you have a cap table?',
          type: 'boolean',
        },
        {
          key: 'fundingGoal' as keyof AssessmentData,
          question: 'What is your funding goal?',
          type: 'text',
        },
        {
          key: 'investors' as keyof AssessmentData,
          question: 'How many investors are you targeting?',
          type: 'text',
        },
      ],
    },
    {
      title: 'Growth & Milestones',
      questions: [
        {
          key: 'milestones' as keyof AssessmentData,
          question: 'What are your key milestones for the next 12 months?',
          type: 'textarea',
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
    const value = formData[question.key];

    if (question.type === 'boolean') {
      return (
        <RadioGroup
          value={value === null ? '' : value.toString()}
          onValueChange={(val) => updateFormData(question.key, val === 'true')}
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

    if (question.type === 'textarea') {
      return (
        <Textarea
          value={value || ''}
          onChange={(e) => updateFormData(question.key, e.target.value)}
          placeholder="Enter your response..."
          rows={4}
        />
      );
    }

    return (
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => updateFormData(question.key, e.target.value)}
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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Calculating...' : 'Complete Assessment'}
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
