import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AssessmentData, ScoreResult } from '@/pages/Index';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle } from 'lucide-react';
import { sanitizeAssessmentData, sanitizeText } from '@/utils/inputSanitization';
import { formRateLimiter } from '@/utils/rateLimiting';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AssessmentWizardProps {
  onComplete: (data: AssessmentData, result: ScoreResult) => void;
  initialData: AssessmentData;
  onSaveDraft: (data: Partial<AssessmentData>, step: number) => Promise<void>;
}

const questionSteps = [
  {
    title: "Business Foundation",
    description: "Let's start with your business idea and financial basics",
    questions: ['prototype', 'revenue', 'mrr', 'capTable']
  },
  {
    title: "Team & Operations", 
    description: "Tell us about your team and current stage",
    questions: ['fullTimeTeam', 'employees', 'milestones']
  },
  {
    title: "Funding & Growth",
    description: "Share your funding goals and investor interactions",
    questions: ['fundingGoal', 'termSheets', 'investors', 'externalCapital']
  }
];

const questionConfig = {
  prototype: {
    question: 'Do you have a working prototype?',
    description: 'A functional version of your product, even if basic',
    type: 'boolean' as const,
    tooltip: 'This includes MVPs, demos, or any functional version of your product'
  },
  revenue: {
    question: 'Do you currently generate revenue?',
    description: 'Any paying customers or revenue streams',
    type: 'boolean' as const,
    tooltip: 'Include any form of income: sales, subscriptions, services, etc.'
  },
  mrr: {
    question: 'What is your Monthly Recurring Revenue (MRR)?',
    type: 'select' as const,
    tooltip: 'MRR is predictable revenue that recurs every month',
    options: [
      { value: 'none', label: 'No recurring revenue' },
      { value: 'low', label: '£1 - £5,000' },
      { value: 'medium', label: '£5,001 - £25,000' },
      { value: 'high', label: '£25,000+' }
    ]
  },
  capTable: {
    question: 'Do you have a documented cap table?',
    description: 'Clear ownership structure and equity distribution',
    type: 'boolean' as const,
    tooltip: 'A cap table shows who owns what percentage of your company'
  },
  fullTimeTeam: {
    question: 'Is your core team working full-time on this startup?',
    description: 'Founders and key team members fully committed',
    type: 'boolean' as const,
    tooltip: 'Full-time commitment shows dedication and reduces execution risk'
  },
  employees: {
    question: 'How many people are in your team?',
    type: 'select' as const,
    tooltip: 'Include founders, employees, and committed co-founders',
    options: [
      { value: '1-2', label: '1-2 people' },
      { value: '3-10', label: '3-10 people' },
      { value: '11-50', label: '11-50 people' },
      { value: '50+', label: '50+ people' }
    ]
  },
  milestones: {
    question: 'What stage best describes your startup?',
    type: 'select' as const,
    tooltip: 'This helps us understand your current development phase',
    options: [
      { value: 'concept', label: 'Concept/Idea stage' },
      { value: 'launch', label: 'MVP launched' },
      { value: 'scale', label: 'Proven model, scaling' },
      { value: 'exit', label: 'Preparing for exit' }
    ]
  },
  fundingGoal: {
    question: 'What is your primary funding goal?',
    type: 'select' as const,
    tooltip: 'This helps match you with the right type of investors',
    options: [
      { value: 'mvp', label: 'Build/improve MVP' },
      { value: 'productMarketFit', label: 'Achieve product-market fit' },
      { value: 'scale', label: 'Scale operations' },
      { value: 'exit', label: 'Prepare for exit' }
    ]
  },
  termSheets: {
    question: 'Have you received any term sheets?',
    description: 'Formal investment offers from investors',
    type: 'boolean' as const,
    tooltip: 'Term sheets show serious investor interest in your startup'
  },
  investors: {
    question: 'What type of investors have you engaged with?',
    type: 'select' as const,
    tooltip: 'This helps us understand your fundraising experience',
    options: [
      { value: 'none', label: 'No investors yet' },
      { value: 'angels', label: 'Angel investors' },
      { value: 'vc', label: 'Venture capital firms' },
      { value: 'lateStage', label: 'Late-stage investors' }
    ]
  },
  externalCapital: {
    question: 'Have you raised external capital?',
    description: 'Any investment from outside sources',
    type: 'boolean' as const,
    tooltip: 'This includes angel investment, VC, grants, or any external funding'
  }
};

export const AssessmentWizard = ({ onComplete, initialData, onSaveDraft }: AssessmentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentData>(initialData);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAnswer = (questionId: string, value: any) => {
    // Sanitize input before setting
    const sanitizedValue = typeof value === 'string' ? sanitizeText(value) : value;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: sanitizedValue
    }));
  };

  const getCurrentStepQuestions = () => {
    return questionSteps[currentStep].questions.map(qId => ({
      id: qId,
      ...questionConfig[qId as keyof typeof questionConfig]
    }));
  };

  const isStepComplete = (stepIndex: number) => {
    const stepQuestions = questionSteps[stepIndex].questions;
    return stepQuestions.every(qId => {
      const answer = answers[qId as keyof AssessmentData];
      return answer !== null && answer !== undefined;
    });
  };

  const handleNext = async () => {
    // Authentication check
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to complete the assessment.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < questionSteps.length - 1) {
      const newCompletedSteps = [...completedSteps];
      newCompletedSteps[currentStep] = isStepComplete(currentStep);
      setCompletedSteps(newCompletedSteps);
      
      // Save draft before moving to next step
      try {
        await onSaveDraft(answers, currentStep + 1);
      } catch (error) {
        console.error('Error saving draft:', error);
        // Don't block progression if draft save fails
      }
      
      setCurrentStep(prev => prev + 1);
    } else {
      // Rate limiting check before submission
      const userId = user.id;
      if (formRateLimiter.isRateLimited(userId)) {
        const remainingTime = formRateLimiter.getRemainingTime(userId);
        toast({
          title: 'Too Many Submissions',
          description: `Please wait ${remainingTime} seconds before submitting again.`,
          variant: 'destructive',
        });
        return;
      }

      try {
        // Sanitize all assessment data before processing
        const sanitizedAnswers = sanitizeAssessmentData(answers);
        
        // Validate required fields
        const requiredFields = ['prototype', 'revenue', 'mrr', 'capTable', 'fullTimeTeam', 'employees', 'milestones', 'fundingGoal', 'termSheets', 'investors', 'externalCapital'];
        const missingFields = requiredFields.filter(field => 
          sanitizedAnswers[field] === null || sanitizedAnswers[field] === undefined
        );

        if (missingFields.length > 0) {
          toast({
            title: 'Incomplete Assessment',
            description: 'Please answer all questions before submitting.',
            variant: 'destructive',
          });
          return;
        }

        // Use the new dynamic scoring engine
        const result = calculateDynamicScore(sanitizedAnswers);
        onComplete(sanitizedAnswers, result);
      } catch (error) {
        console.error('Assessment submission error:', error);
        toast({
          title: 'Submission Error',
          description: 'An error occurred while processing your assessment. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const overallProgress = ((currentStep + 1) / questionSteps.length) * 100;
  const currentStepProgress = (questionSteps[currentStep].questions.filter(qId => 
    answers[qId as keyof AssessmentData] !== null && answers[qId as keyof AssessmentData] !== undefined
  ).length / questionSteps[currentStep].questions.length) * 100;

  const canProceed = isStepComplete(currentStep);
  const isLastStep = currentStep === questionSteps.length - 1;

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Startup Assessment</h2>
              <p className="text-gray-600">{questionSteps[currentStep].description}</p>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {questionSteps.length}
            </Badge>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mb-4">
            {questionSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < currentStep ? 'bg-green-500 border-green-500 text-white' :
                  index === currentStep ? 'bg-blue-500 border-blue-500 text-white' :
                  'border-gray-300 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < questionSteps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Progress value={overallProgress} className="h-2 mb-2" />
          <div className="text-sm text-gray-500">
            Overall progress: {Math.round(overallProgress)}% complete
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {questionSteps[currentStep].title}
            </h3>
            <Progress value={currentStepProgress} className="h-1" />
          </div>

          <div className="space-y-6">
            {getCurrentStepQuestions().map((question) => {
              const currentAnswer = answers[question.id as keyof AssessmentData];
              
              return (
                <div key={question.id} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {question.question}
                      </h4>
                      {'description' in question && question.description && (
                        <p className="text-gray-600 text-sm mb-3">{question.description}</p>
                      )}
                    </div>
                    {'tooltip' in question && question.tooltip && (
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{question.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {question.type === 'boolean' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={currentAnswer === true ? "default" : "outline"}
                        onClick={() => handleAnswer(question.id, true)}
                        className="p-4 h-auto"
                        disabled={!user}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={currentAnswer === false ? "default" : "outline"}
                        onClick={() => handleAnswer(question.id, false)}
                        className="p-4 h-auto"
                        disabled={!user}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {'options' in question && question.options?.map((option) => (
                        <Button
                          key={option.value}
                          variant={currentAnswer === option.value ? "default" : "outline"}
                          onClick={() => handleAnswer(question.id, option.value)}
                          className="w-full p-4 h-auto justify-start text-left"
                          disabled={!user}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Please sign in to complete and submit your assessment.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <span>{isLastStep ? 'Get My Results' : 'Next Step'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};
