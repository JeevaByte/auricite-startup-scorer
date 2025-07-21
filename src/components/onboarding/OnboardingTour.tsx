import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isVisible,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isVisible]);

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Welcome to Investment Assessment
                <Badge variant="secondary">Step {currentStep + 1} of {steps.length}</Badge>
              </CardTitle>
              <CardDescription>
                Let's get you started with a quick tour of the key features
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="flex gap-1 mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : completedSteps.has(step.id)
                    ? 'bg-green-500'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              {completedSteps.has(currentStepData.id) && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {currentStepData.title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
            
            <div className="min-h-[200px]">
              {currentStepData.content}
            </div>
          </div>

          {currentStepData.action && (
            <div className="p-4 bg-muted rounded-lg">
              <Button
                onClick={currentStepData.action.onClick}
                className="w-full"
                variant="outline"
              >
                {currentStepData.action.label}
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="flex items-center gap-2">
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Default onboarding steps for the assessment platform
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Investment Assessment',
    description: 'Your comprehensive platform for startup evaluation',
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
          <h4 className="font-semibold mb-2">What you can do here:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Complete comprehensive startup assessments</li>
            <li>• Get AI-powered insights and recommendations</li>
            <li>• Track your progress with detailed scoring</li>
            <li>• Compare against industry benchmarks</li>
            <li>• Connect with potential investors</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'assessment',
    title: 'Start Your Assessment',
    description: 'Our 5-step assessment evaluates all aspects of your startup',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-1">Business Idea</h5>
            <p className="text-sm text-muted-foreground">Market opportunity and innovation</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-1">Team</h5>
            <p className="text-sm text-muted-foreground">Founder experience and composition</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-1">Financials</h5>
            <p className="text-sm text-muted-foreground">Revenue model and projections</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h5 className="font-medium mb-1">Traction</h5>
            <p className="text-sm text-muted-foreground">Customer validation and growth</p>
          </div>
        </div>
      </div>
    ),
    action: {
      label: 'Start Assessment',
      onClick: () => window.location.href = '/assessment'
    }
  },
  {
    id: 'results',
    title: 'Understanding Your Results',
    description: 'Get detailed insights and actionable recommendations',
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h5 className="font-medium mb-2">You'll receive:</h5>
          <ul className="space-y-2 text-sm">
            <li>• Overall investment readiness score</li>
            <li>• Detailed breakdown by category</li>
            <li>• Personalized improvement recommendations</li>
            <li>• Industry benchmark comparisons</li>
            <li>• Investor matching suggestions (Premium)</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'features',
    title: 'Explore Premium Features',
    description: 'Unlock advanced capabilities with our premium plans',
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2">Premium</Badge>
            <h5 className="font-medium mb-1">Investor Matching</h5>
            <p className="text-sm text-muted-foreground">Connect with investors aligned to your startup</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2">Premium</Badge>
            <h5 className="font-medium mb-1">Advanced Analytics</h5>
            <p className="text-sm text-muted-foreground">Detailed performance tracking and insights</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Badge className="mb-2">Premium</Badge>
            <h5 className="font-medium mb-1">Priority Support</h5>
            <p className="text-sm text-muted-foreground">Get help when you need it most</p>
          </div>
        </div>
      </div>
    ),
    action: {
      label: 'View Pricing',
      onClick: () => window.location.href = '/pricing'
    }
  }
];