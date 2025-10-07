import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { StartupData } from '@/hooks/useInvestorData';
import { RadarVisualization } from '@/components/RadarVisualization';

interface ScorecardInsightsProps {
  startup: StartupData;
  trigger?: React.ReactNode;
}

export const ScorecardInsights: React.FC<ScorecardInsightsProps> = ({ startup, trigger }) => {
  const scoreCategories = [
    {
      name: 'Business Idea',
      score: startup.business_idea || 0,
      explanation: 'Evaluates market opportunity, problem-solution fit, and unique value proposition.',
      strengths: ['Clear market need', 'Innovative solution'],
      improvements: ['Competitive differentiation could be stronger'],
    },
    {
      name: 'Team',
      score: startup.team || 0,
      explanation: 'Assesses team composition, experience, and capability to execute.',
      strengths: ['Experienced founders', 'Complementary skill sets'],
      improvements: ['Could benefit from technical co-founder'],
    },
    {
      name: 'Traction',
      score: startup.traction || 0,
      explanation: 'Measures customer validation, revenue, and growth metrics.',
      strengths: ['Strong early customer base', 'Consistent MoM growth'],
      improvements: ['Revenue diversification needed'],
    },
    {
      name: 'Financials',
      score: startup.financials || 0,
      explanation: 'Reviews financial planning, runway, and unit economics.',
      strengths: ['Solid financial projections', 'Clear path to profitability'],
      improvements: ['Burn rate could be optimized'],
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            View Scorecard
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Investment Scorecard: {startup.company_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Investment Readiness</span>
                <Badge className={`text-2xl px-4 py-2 ${getScoreColor(startup.score)}`}>
                  {startup.score}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={startup.score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-3">
                {startup.score >= 80 && 'Highly investment-ready. Strong fundamentals across all metrics.'}
                {startup.score >= 60 && startup.score < 80 && 'Investment-ready with some areas for improvement.'}
                {startup.score < 60 && 'Early stage with significant development needed before investment.'}
              </p>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarVisualization
                scoreResult={{
                  businessIdea: startup.business_idea || 0,
                  team: startup.team || 0,
                  traction: startup.traction || 0,
                  financials: startup.financials || 0,
                  totalScore: startup.score,
                  businessIdeaExplanation: '',
                  teamExplanation: '',
                  tractionExplanation: '',
                  financialsExplanation: '',
                }}
              />
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detailed Analysis</h3>
            {scoreCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <Badge variant="secondary" className={getScoreColor(category.score)}>
                      {category.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{category.explanation}</p>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {category.strengths.map((strength, idx) => (
                        <li key={idx} className="text-muted-foreground">{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Areas for Improvement
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {category.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-muted-foreground">{improvement}</li>
                      ))}
                    </ul>
                  </div>

                  <Progress value={category.score} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Investment Memo */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle className="text-base">AI-Generated Investment Memo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                <strong>{startup.company_name}</strong> demonstrates {startup.score >= 70 ? 'strong' : 'moderate'} 
                {' '}investment readiness with a total score of <strong>{startup.score}/100</strong>.
              </p>
              <p>
                The company shows particular strength in{' '}
                {Math.max(
                  startup.business_idea || 0,
                  startup.team || 0,
                  startup.traction || 0,
                  startup.financials || 0
                ) === startup.business_idea ? 'business concept and market opportunity' :
                 Math.max(
                  startup.business_idea || 0,
                  startup.team || 0,
                  startup.traction || 0,
                  startup.financials || 0
                 ) === startup.team ? 'team composition and experience' :
                 Math.max(
                  startup.business_idea || 0,
                  startup.team || 0,
                  startup.traction || 0,
                  startup.financials || 0
                 ) === startup.traction ? 'market traction and customer validation' : 'financial planning and unit economics'}.
              </p>
              <p>
                <strong>Investment Recommendation:</strong>{' '}
                {startup.score >= 80 && 'Strongly recommended for investment consideration. Excellent fundamentals.'}
                {startup.score >= 60 && startup.score < 80 && 'Recommended with due diligence. Solid opportunity with manageable risks.'}
                {startup.score < 60 && 'Monitor for future consideration. Requires further development.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
