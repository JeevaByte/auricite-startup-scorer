import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';
import { calculateScore } from '@/utils/scoreCalculator';

interface AssessmentQuestion {
  id: keyof AssessmentData;
  question: string;
  type: 'boolean' | 'select';
  step: number;
  required: true;
  description?: string;
  options?: Array<{ value: string; label: string }>;
}

const SIMPLE_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Step 1: Core Questions
  {
    id: 'prototype',
    question: 'Do you have a working prototype or MVP?',
    type: 'boolean',
    step: 1,
    required: true,
    description: 'A functional version that demonstrates your core product features'
  },
  {
    id: 'revenue',
    question: 'Are you currently generating revenue?',
    type: 'boolean',
    step: 1,
    required: true,
    description: 'Receiving payments from customers for your product/service'
  },
  {
    id: 'fullTimeTeam',
    question: 'Do you have a full-time team?',
    type: 'boolean',
    step: 1,
    required: true,
    description: 'Core team members dedicated full-time to this venture'
  },

  // Step 2: Funding & Growth
  {
    id: 'externalCapital',
    question: 'Have you raised external capital?',
    type: 'boolean',
    step: 2,
    required: true,
    description: 'Investment from sources outside your personal network'
  },
  {
    id: 'fundingGoal',
    question: 'What is your funding goal?',
    type: 'select',
    step: 2,
    required: true,
    options: [
      { value: '50k', label: 'Under $50k' },
      { value: '100k', label: '$50k - $100k' },
      { value: '500k', label: '$100k - $500k' },
      { value: '1m', label: '$500k - $1M' },
      { value: '5m', label: '$1M - $5M' },
      { value: '10m+', label: 'Over $5M' }
    ]
  },

  // Step 3: Current Stage
  {
    id: 'milestones',
    question: 'What best describes your current stage?',
    type: 'select',
    step: 3,
    required: true,
    options: [
      { value: 'concept', label: 'Concept/ideation stage' },
      { value: 'launch', label: 'Product launch stage' },
      { value: 'scale', label: 'Scaling/growth stage' },
      { value: 'exit', label: 'Exit preparation stage' }
    ]
  }
];

const TOTAL_STEPS = 3;

export const SimpleAssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Initialize assessment data with defaults for simple assessment
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    prototype: null,
    externalCapital: null,
    revenue: null,
    fullTimeTeam: null,
    termSheets: false, // Default values for non-asked questions
    capTable: false,
    mrr: 'none',
    employees: '1-2',
    fundingGoal: null,
    investors: 'none',
    milestones: null,
  });

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user provides input
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepQuestions = SIMPLE_ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
    const stepErrors: string[] = [];

    currentStepQuestions.forEach(question => {
      const value = assessmentData[question.id];
      if (question.required && (value === null || value === undefined)) {
        const fieldName = question.question;
        stepErrors.push(fieldName);
      }
    });

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !user) return;

    setIsSubmitting(true);
    try {
      // Prepare data for database with proper defaults
      const dbData = {
        user_id: user.id,
        prototype: assessmentData.prototype ?? false,
        external_capital: assessmentData.externalCapital ?? false,
        revenue: assessmentData.revenue ?? false,
        full_time_team: assessmentData.fullTimeTeam ?? false,
        term_sheets: false, // Not asked in simple assessment
        cap_table: false, // Not asked in simple assessment
        mrr: 'none', // Default for simple assessment
        employees: '1-2', // Default for simple assessment
        funding_goal: assessmentData.fundingGoal || '100k',
        investors: 'none', // Default for simple assessment
        milestones: assessmentData.milestones || 'concept'
      };

      // Save assessment to database
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(dbData)
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Calculate score with defaults
      const scoreData = {
        prototype: assessmentData.prototype ?? false,
        externalCapital: assessmentData.externalCapital ?? false,
        revenue: assessmentData.revenue ?? false,
        fullTimeTeam: assessmentData.fullTimeTeam ?? false,
        termSheets: false,
        capTable: false,
        mrr: 'none' as const,
        employees: '1-2' as const,
        fundingGoal: (assessmentData.fundingGoal || '100k') as '50k' | '100k' | '500k' | '1m' | '5m' | '10m+',
        investors: 'none' as const,
        milestones: (assessmentData.milestones || 'concept') as 'concept' | 'launch' | 'scale' | 'exit'
      };

      const scoreResult = calculateScore(scoreData);

      // Save score to database
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          business_idea: scoreResult.businessIdea,
          business_idea_explanation: scoreResult.businessIdeaExplanation,
          financials: scoreResult.financials,
          financials_explanation: scoreResult.financialsExplanation,
          team: scoreResult.team,
          team_explanation: scoreResult.teamExplanation,
          traction: scoreResult.traction,
          traction_explanation: scoreResult.tractionExplanation,
          total_score: scoreResult.totalScore,
        });

      if (scoreError) throw scoreError;

      // Save to assessment history
      const { error: historyError } = await supabase
        .from('assessment_history')
        .insert({
          user_id: user.id,
          assessment_data: assessmentData as any,
          score_result: scoreResult as any
        });

      if (historyError) {
        console.error('Error saving to assessment history:', historyError);
      }

      // Store result for results page
      const resultData = {
        result: scoreResult,
        assessmentData: assessmentData,
        assessmentId: assessment.id,
        assessmentType: 'simple'
      };
      
      sessionStorage.setItem('assessmentResult', JSON.stringify(resultData));

      toast({
        title: 'Assessment Complete!',
        description: `Your startup scored ${scoreResult.totalScore} points.`,
      });

      // Navigate to results
      navigate('/results', { 
        state: { 
          result: scoreResult, 
          assessmentData: assessmentData,
          scoreResult: scoreResult,
          assessmentType: 'simple'
        }
      });

    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const value = assessmentData[question.id];

    switch (question.type) {
      case 'boolean':
        return (
          <div key={question.id} className="space-y-3">
            <div>
              <Label className="text-base font-medium">{question.question} *</Label>
              {question.description && (
                <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
              )}
            </div>
            <RadioGroup
              value={value === null ? '' : String(value)}
              onValueChange={(val) => handleInputChange(question.id, val === 'true')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`}>No</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'select':
        return (
          <div key={question.id} className="space-y-3">
            <div>
              <Label className="text-base font-medium">{question.question} *</Label>
              {question.description && (
                <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
              )}
            </div>
            <Select 
              value={value?.toString() || ''} 
              onValueChange={(val) => handleInputChange(question.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepQuestions = SIMPLE_ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS;
  
  // Calculate validation without triggering state updates
  const canGoNext = React.useMemo(() => {
    const currentStepQuestions = SIMPLE_ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
    return currentStepQuestions.every(question => {
      const value = assessmentData[question.id];
      return !(question.required && (value === null || value === undefined));
    });
  }, [currentStep, assessmentData]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Quick Investment Assessment</h1>
        <p className="text-muted-foreground text-center mb-6">
          Get a quick assessment of your startup's investment readiness in just 3 steps
        </p>
        <Progress value={progress} className="h-2" />
        <div className="text-sm text-muted-foreground text-center mt-2">
          Step {currentStep} of {TOTAL_STEPS}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {currentStepQuestions[0]?.step === 1 ? 'Core Business Questions' :
                               currentStepQuestions[0]?.step === 2 ? 'Funding & Growth' :
                               'Current Stage'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please answer all required questions before proceeding.
              </AlertDescription>
            </Alert>
          )}

          {currentStepQuestions.map(renderQuestion)}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {isLastStep ? (
              <Button 
                onClick={handleSubmit} 
                disabled={!canGoNext || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Assessment
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canGoNext}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};