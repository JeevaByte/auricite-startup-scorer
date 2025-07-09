
import React from 'react';
import { Progress } from './progress';
import { CheckCircle } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep
}) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {steps.length}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 text-xs p-2 rounded ${
              index === currentStep
                ? 'bg-primary/10 text-primary border border-primary/20'
                : index < currentStep
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.completed ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <div className={`h-3 w-3 rounded-full border-2 ${
                index === currentStep ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`} />
            )}
            <span className="font-medium">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
