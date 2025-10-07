import React from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  minScore: number;
  completed: boolean;
}

interface RoadmapVisualizationProps {
  currentScore: number;
}

export const RoadmapVisualization: React.FC<RoadmapVisualizationProps> = ({ currentScore }) => {
  const steps: RoadmapStep[] = [
    {
      id: 1,
      title: 'Initial Assessment',
      description: 'Complete your first investment readiness assessment',
      minScore: 0,
      completed: currentScore > 0
    },
    {
      id: 2,
      title: 'Basic Readiness',
      description: 'Achieve a score of 40+ with core business fundamentals',
      minScore: 40,
      completed: currentScore >= 40
    },
    {
      id: 3,
      title: 'Growing Momentum',
      description: 'Score 60+ with demonstrated traction and team strength',
      minScore: 60,
      completed: currentScore >= 60
    },
    {
      id: 4,
      title: 'Investment Ready',
      description: 'Score 75+ indicating strong investor appeal',
      minScore: 75,
      completed: currentScore >= 75
    },
    {
      id: 5,
      title: 'Highly Competitive',
      description: 'Score 85+ positioning you among top startups',
      minScore: 85,
      completed: currentScore >= 85
    }
  ];

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isActive = currentScore >= step.minScore && currentScore < (steps[index + 1]?.minScore || 100);
        const isCompleted = step.completed;

        return (
          <div key={step.id} className="relative">
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-10 w-0.5 h-12 bg-border" />
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                isCompleted 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : isActive
                  ? "bg-background border-primary text-primary animate-pulse"
                  : "bg-background border-border text-muted-foreground"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={cn(
                    "font-semibold",
                    isCompleted ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {isActive && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      Current Stage
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Required Score: {step.minScore}+</span>
                  {isCompleted && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </>
                  )}
                </div>

                {/* Progress for current stage */}
                {isActive && index < steps.length - 1 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress to next stage</span>
                      <span className="font-medium">
                        {Math.round(((currentScore - step.minScore) / ((steps[index + 1]?.minScore || 100) - step.minScore)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((currentScore - step.minScore) / ((steps[index + 1]?.minScore || 100) - step.minScore)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
