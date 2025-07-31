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

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Step 1: Product & Business Basics
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
  
  // Step 2: Financial Status
  {
    id: 'externalCapital',
    question: 'Have you raised external capital?',
    type: 'boolean',
    step: 2,
    required: true,
    description: 'Investment from sources outside your personal network'
  },
  {
    id: 'mrr',
    question: 'What is your Monthly Recurring Revenue (MRR)?',
    type: 'select',
    step: 2,
    required: true,
    options: [
      { value: 'none', label: 'No recurring revenue' },
      { value: 'low', label: 'Under $10k/month' },
      { value: 'medium', label: '$10k - $100k/month' },
      { value: 'high', label: 'Over $100k/month' }
    ]
  },
  
  // Step 3: Team & Operations
  {
    id: 'fullTimeTeam',
    question: 'Do you have a full-time team?',
    type: 'boolean',
    step: 3,
    required: true,
    description: 'Core team members dedicated full-time to this venture'
  },
  {
    id: 'employees',
    question: 'How many team members do you have?',
    type: 'select',
    step: 3,
    required: true,
    options: [
      { value: '1-2', label: '1-2 people' },
      { value: '3-10', label: '3-10 people' },
      { value: '11-50', label: '11-50 people' },
      { value: '50+', label: '50+ people' }
    ]
  },

  // Step 4: Investment & Legal
  {
    id: 'termSheets',
    question: 'Have you received any term sheets from investors?',
    type: 'boolean',
    step: 4,
    required: true,
    description: 'Formal investment offers with terms and conditions'
  },
  {
    id: 'capTable',
    question: 'Do you have a documented cap table?',
    type: 'boolean',
    step: 4,
    required: true,
    description: 'Documentation showing company ownership structure'
  },

  // Step 5: Growth & Goals
  {
    id: 'fundingGoal',
    question: 'What is your funding goal?',
    type: 'select',
    step: 5,
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
  {
    id: 'investors',
    question: 'What type of investors are you targeting?',
    type: 'select',
    step: 5,
    required: true,
    options: [
      { value: 'none', label: 'Not seeking investment currently' },
      { value: 'angels', label: 'Angel investors' },
      { value: 'vc', label: 'Venture capital firms' },
      { value: 'lateStage', label: 'Late-stage/growth equity' }
    ]
  },

  // Step 6: Current Stage
  {
    id: 'milestones',
    question: 'What best describes your current stage?',
    type: 'select',
    step: 6,
    required: true,
    options: [
      { value: 'concept', label: 'Concept/ideation stage' },
      { value: 'launch', label: 'Product launch stage' },
      { value: 'scale', label: 'Scaling/growth stage' },
      { value: 'exit', label: 'Exit preparation stage' }
    ]
  }
];

const TOTAL_STEPS = 6;

export const UnifiedAssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Initialize assessment data with proper defaults
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
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
  });

  // Load draft data on component mount
  useEffect(() => {
    if (user) {
      loadDraft();
    }
  }, [user]);

  // Auto-save draft when data changes
  useEffect(() => {
    if (user && (Object.values(assessmentData).some(value => value !== null))) {
      saveDraft();
    }
  }, [assessmentData, currentStep, user]);

  const loadDraft = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assessment_drafts')
        .select('draft_data, step')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading draft:', error);
        return;
      }

      if (data?.draft_data) {
        const draftData = data.draft_data as Record<string, any>;
        setAssessmentData(prevData => ({ ...prevData, ...draftData }));
        setCurrentStep(data.step || 1);
        
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('assessment_drafts')
        .upsert({
          user_id: user.id,
          draft_data: assessmentData as any,
          step: currentStep
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleInputChange = (field: keyof AssessmentData, value: any) => {
    setAssessmentData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user provides input
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepQuestions = ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
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
        term_sheets: assessmentData.termSheets ?? false,
        cap_table: assessmentData.capTable ?? false,
        mrr: assessmentData.mrr || 'none',
        employees: assessmentData.employees || '1-2',
        funding_goal: assessmentData.fundingGoal || '100k',
        investors: assessmentData.investors || 'none',
        milestones: assessmentData.milestones || 'concept'
      };

      // Save assessment to database
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(dbData)
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Calculate score
      const scoreData = {
        prototype: assessmentData.prototype ?? false,
        externalCapital: assessmentData.externalCapital ?? false,
        revenue: assessmentData.revenue ?? false,
        fullTimeTeam: assessmentData.fullTimeTeam ?? false,
        termSheets: assessmentData.termSheets ?? false,
        capTable: assessmentData.capTable ?? false,
        mrr: (assessmentData.mrr || 'none') as 'none' | 'low' | 'medium' | 'high',
        employees: (assessmentData.employees || '1-2') as '1-2' | '3-10' | '11-50' | '50+',
        fundingGoal: (assessmentData.fundingGoal || '100k') as '50k' | '100k' | '500k' | '1m' | '5m' | '10m+',
        investors: (assessmentData.investors || 'none') as 'none' | 'angels' | 'vc' | 'lateStage',
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

      // Clear draft
      await supabase
        .from('assessment_drafts')
        .delete()
        .eq('user_id', user.id);

      // Store result for results page
      const resultData = {
        result: scoreResult,
        assessmentData: assessmentData,
        assessmentId: assessment.id
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
          scoreResult: scoreResult
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

  const currentStepQuestions = ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
  const progress = (currentStep / TOTAL_STEPS) * 100;
  const isLastStep = currentStep === TOTAL_STEPS;
  const canGoNext = validateCurrentStep();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Investment Readiness Assessment</h1>
        <p className="text-muted-foreground text-center mb-6">
          Complete all questions to receive your personalized investment readiness score
        </p>
        <Progress value={progress} className="h-2" />
        <div className="text-sm text-muted-foreground text-center mt-2">
          Step {currentStep} of {TOTAL_STEPS}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {currentStepQuestions[0]?.step === 1 ? 'Product & Business Basics' :
                              currentStepQuestions[0]?.step === 2 ? 'Financial Status' :
                              currentStepQuestions[0]?.step === 3 ? 'Team & Operations' :
                              currentStepQuestions[0]?.step === 4 ? 'Investment & Legal' :
                              currentStepQuestions[0]?.step === 5 ? 'Growth & Goals' :
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