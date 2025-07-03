
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Users, TrendingUp, Target, DollarSign } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Auricite InvestX",
      content: "Get your startup investment-ready with AI-powered scoring and personalized recommendations.",
      icon: <Target className="h-8 w-8 text-blue-600" />,
      description: "Perfect for pre-seed to Series A startups seeking £25K-£2M funding rounds."
    },
    {
      title: "How It Works",
      content: "Answer 11 strategic questions about your startup in just 5 minutes.",
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      description: "Our AI analyzes 4 key areas: Business Idea, Financials, Team, and Traction."
    },
    {
      title: "Your Investment Score",
      content: "Receive instant scoring (0-999) with detailed explanations and actionable recommendations.",
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      description: "Download professional PDFs and share results confidently with investors."
    },
    {
      title: "Privacy & Security",
      content: "Your data is encrypted and GDPR compliant. You control what gets shared.",
      icon: <Users className="h-8 w-8 text-orange-600" />,
      description: "We never share your information without explicit permission."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-2xl mx-4 p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            {steps[currentStep].content}
          </p>
          <p className="text-sm text-gray-500">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {currentStep + 1} of {steps.length}
            </Badge>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
