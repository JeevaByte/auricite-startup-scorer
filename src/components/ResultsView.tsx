
import React from 'react';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Badge } from '@/components/ui/badge';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';

interface ResultsViewProps {
  scoreResult: ScoreResult;
  assessmentData: AssessmentData;
  badges: Array<{ name: string; explanation: string }>;
  engagementMessage: string;
  onRestart: () => Promise<void>;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  scoreResult,
  assessmentData,
  badges,
  engagementMessage,
  onRestart,
}) => {
  return (
    <div className="space-y-8">
      {badges.length > 0 && (
        <div className="container mx-auto px-4 pt-8">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">🏆 Achievements Unlocked</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="animate-in fade-in duration-500" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {badge.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <ScoreDisplay
        result={scoreResult}
        assessmentData={assessmentData}
        onRestart={onRestart}
        badges={badges}
        engagementMessage={engagementMessage}
      />
    </div>
  );
};
