import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { FormNavigation } from '@/components/assessment/FormNavigation';
import { StepValidation } from '@/components/assessment/StepValidation';
import { LoadingState } from '@/components/ui/loading-state';
import { saveAssessmentData } from '@/utils/database';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';
import { calculateConfigBasedScore } from '@/utils/configBasedScoring';
import { sendReportEmail } from '@/utils/emailService';

const ASSESSMENT_QUESTIONS = [
  {
    id: 'prototype',
    question: 'Do you have a working prototype?',
    type: 'boolean' as const,
    step: 1,
    required: true,
    description: 'A functional version of your product that demonstrates core features'
  },
  {
    id: 'externalCapital',
    question: 'Have you raised external capital?',
    type: 'boolean' as const,
    step: 1,
    required: true,
    description: 'Investment from sources outside your personal network'
  },
  {
    id: 'revenue',
    question: 'Are you generating revenue?',
    type: 'boolean' as const,
    step: 2,
    required: true,
    description: 'Currently receiving payment from customers'
  },
  {
    id: 'fullTimeTeam',
    question: 'Is your team full-time?',
    type: 'boolean' as const,
    step: 2,
    required: true,
    description: 'Core team members are dedicated full-time to this venture'
  },
  {
    id: 'termSheets',
    question: 'Have you received term sheets?',
    type: 'boolean' as const,
    step: 3,
    required: true,
    description: 'Formal investment offers from investors'
  },
  {
    id: 'capTable',
    question: 'Do you have a documented cap table?',
    type: 'boolean' as const,
    step: 3,
    required: true,
    description: 'Formal documentation of company ownership structure'
  },
  {
    id: 'mrr',
    question: 'What is your Monthly Recurring Revenue (MRR)?',
    type: 'select' as const,
    step: 4,
    required: true,
    options: [
      { value: 'none', label: 'No recurring revenue' },
      { value: 'low', label: 'Under $10k/month' },
      { value: 'medium', label: '$10k - $100k/month' },
      { value: 'high', label: 'Over $100k/month' }
    ]
  },
  {
    id: 'employees',
    question: 'How many employees do you have?',
    type: 'select' as const,
    step: 4,
    required: true,
    options: [
      { value: '1-2', label: '1-2 employees' },
      { value: '3-10', label: '3-10 employees' },
      { value: '11-50', label: '11-50 employees' },
      { value: '50+', label: '50+ employees' }
    ]
  },
  {
    id: 'fundingGoal',
    question: 'What is your funding goal?',
    type: 'select' as const,
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
    type: 'select' as const,
    step: 5,
    required: true,
    options: [
      { value: 'none', label: 'Not seeking investment' },
      { value: 'angels', label: 'Angel investors' },
      { value: 'vc', label: 'Venture capital' },
      { value: 'lateStage', label: 'Late-stage/growth equity' }
    ]
  },
  {
    id: 'milestones',
    question: 'What is your current milestone?',
    type: 'select' as const,
    step: 6,
    required: true,
    options: [
      { value: 'concept', label: 'Concept/ideation' },
      { value: 'launch', label: 'Product launch' },
      { value: 'scale', label: 'Scaling/growth' },
      { value: 'exit', label: 'Exit preparation' }
    ]
  }
];

const TOTAL_STEPS = 6;

export const AssessmentWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load draft data
  useEffect(() => {
    if (user) {
      loadDraft();
    }
  }, [user]);

  // Save draft data
  useEffect(() => {
    if (user && Object.keys(formData).length > 0) {
      saveDraft();
    }
  }, [formData, currentStep, user]);

  const loadDraft = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('assessment_drafts')
        .select('draft_data, step')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading draft:', error);
        return;
      }

      if (data?.draft_data) {
        setFormData(data.draft_data as Record<string, any>);
        setCurrentStep(data.step || 1);
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
          draft_data: formData,
          step: currentStep
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error when user provides input
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid || !user) return;

    setIsSubmitting(true);
    try {
      // Convert form data to AssessmentData format with proper defaults
      const assessmentData: AssessmentData = {
        prototype: formData.prototype ?? false,
        externalCapital: formData.externalCapital ?? false,
        revenue: formData.revenue ?? false,
        fullTimeTeam: formData.fullTimeTeam ?? false,
        termSheets: formData.termSheets ?? false,
        capTable: formData.capTable ?? false,
        mrr: formData.mrr || 'none',
        employees: formData.employees || '1-2',
        fundingGoal: formData.fundingGoal || '100k',
        investors: formData.investors || 'none',
        milestones: formData.milestones || 'concept',
      };

      console.log('Submitting assessment data:', assessmentData);

      // Calculate score
      const result = await calculateConfigBasedScore(assessmentData);
      console.log('Calculated score result:', result);

      // Save to database with proper data types
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          prototype: assessmentData.prototype,
          external_capital: assessmentData.externalCapital,
          revenue: assessmentData.revenue,
          full_time_team: assessmentData.fullTimeTeam,
          term_sheets: assessmentData.termSheets,
          cap_table: assessmentData.capTable,
          mrr: assessmentData.mrr,
          employees: assessmentData.employees,
          funding_goal: assessmentData.fundingGoal,
          investors: assessmentData.investors,
          milestones: assessmentData.milestones,
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Assessment save error:', assessmentError);
        throw assessmentError;
      }

      // Save score
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          assessment_id: assessment.id,
          user_id: user.id,
          business_idea: result.businessIdea,
          business_idea_explanation: result.businessIdeaExplanation,
          financials: result.financials,
          financials_explanation: result.financialsExplanation,
          team: result.team,
          team_explanation: result.teamExplanation,
          traction: result.traction,
          traction_explanation: result.tractionExplanation,
          total_score: result.totalScore,
        });

      if (scoreError) {
        console.error('Score save error:', scoreError);
        throw scoreError;
      }

      // Save to assessment history
      await saveAssessmentData(assessmentData, user.id);

      // Send email notification if user has email
      if (user.email) {
        try {
          await sendReportEmail({
            email: user.email,
            name: user.user_metadata?.full_name,
            totalScore: result.totalScore,
            assessmentId: assessment.id,
          });

          toast({
            title: 'Assessment Complete!',
            description: 'Your results have been emailed to you.',
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          toast({
            title: 'Assessment Complete!',
            description: 'Your assessment is complete. Check your results below.',
          });
        }
      }

      // Clear draft
      await supabase
        .from('assessment_drafts')
        .delete()
        .eq('user_id', user.id);

      navigate('/results', { 
        state: { result, assessmentData }
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

  const currentStepQuestions = ASSESSMENT_QUESTIONS.filter(q => q.step === currentStep);
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Investment Readiness Assessment</h1>
          <p className="text-muted-foreground text-center mb-6">
            Complete all questions to receive your personalized investment readiness score
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep} of {TOTAL_STEPS}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StepValidation
              currentStep={currentStep}
              formData={formData}
              questions={ASSESSMENT_QUESTIONS}
              onValidationChange={setIsStepValid}
            />

            {currentStepQuestions.map((question) => (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={formData[question.id]}
                onChange={(value) => handleInputChange(question.id, value)}
                error={errors[question.id]}
              />
            ))}

            <FormNavigation
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              isValid={isStepValid}
              isSubmitting={isSubmitting}
              canGoBack={currentStep > 1}
              canGoNext={currentStep < TOTAL_STEPS}
              isLastStep={currentStep === TOTAL_STEPS}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};
