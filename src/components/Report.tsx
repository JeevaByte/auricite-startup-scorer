
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScoreResult } from '@/utils/scoreCalculator';
import { RecommendationsData } from '@/utils/recommendationsService';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReportProps {
  scoreResult: ScoreResult;
  recommendations?: RecommendationsData | null;
  onFeedbackClick: (section: 'scoring' | 'recommendations' | 'overall') => void;
}

export const Report = ({ scoreResult, recommendations, onFeedbackClick }: ReportProps) => {
  const categories = [
    {
      name: 'Business Idea',
      score: scoreResult.businessIdea,
      explanation: scoreResult.businessIdeaExplanation,
      color: 'bg-blue-500'
    },
    {
      name: 'Financials',
      score: scoreResult.financials,
      explanation: scoreResult.financialsExplanation,
      color: 'bg-green-500'
    },
    {
      name: 'Team',
      score: scoreResult.team,
      explanation: scoreResult.teamExplanation,
      color: 'bg-purple-500'
    },
    {
      name: 'Traction',
      score: scoreResult.traction,
      explanation: scoreResult.tractionExplanation,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Your Investment Readiness Score</h2>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {scoreResult.totalScore}/999
          </div>
          <Badge variant="outline">Overall Score</Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card key={category.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{category.name}</h3>
                <span className="font-bold">{category.score}/100</span>
              </div>
              <Progress value={category.score} className="mb-2" />
              <p className="text-sm text-gray-600">{category.explanation}</p>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={() => onFeedbackClick('scoring')} variant="outline" size="sm">
            <ThumbsUp className="h-4 w-4 mr-2" />
            Was this scoring helpful?
          </Button>
        </div>
      </Card>

      {recommendations && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {recommendations.businessIdea && recommendations.businessIdea.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Business Idea</h4>
                <ul className="list-disc list-inside space-y-1">
                  {recommendations.businessIdea.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-600">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <Button onClick={() => onFeedbackClick('recommendations')} variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Were these recommendations helpful?
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
