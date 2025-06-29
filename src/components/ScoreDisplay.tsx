
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScoreResult, AssessmentData } from '@/pages/Index';
import { RotateCcw, Download, Share2 } from 'lucide-react';

interface ScoreDisplayProps {
  result: ScoreResult;
  assessmentData: AssessmentData;
  onRestart: () => void;
}

export const ScoreDisplay = ({ result, onRestart }: ScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 800) return 'A+';
    if (score >= 700) return 'A';
    if (score >= 600) return 'B+';
    if (score >= 500) return 'B';
    if (score >= 400) return 'C+';
    if (score >= 300) return 'C';
    return 'D';
  };

  const categories = [
    {
      name: 'Business Idea',
      score: result.businessIdea,
      explanation: result.businessIdeaExplanation,
      weight: '30%',
      color: 'bg-blue-500'
    },
    {
      name: 'Financials',
      score: result.financials,
      explanation: result.financialsExplanation,
      weight: '25%',
      color: 'bg-green-500'
    },
    {
      name: 'Team',
      score: result.team,
      explanation: result.teamExplanation,
      weight: '25%',
      color: 'bg-purple-500'
    },
    {
      name: 'Traction',
      score: result.traction,
      explanation: result.tractionExplanation,
      weight: '20%',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investment Score</h1>
        <p className="text-lg text-gray-600">Here's how your startup scored across key investment criteria</p>
      </div>

      {/* Total Score Card */}
      <Card className="p-8 mb-8 text-center bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {result.totalScore}
            <span className="text-2xl text-gray-500">/999</span>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getScoreColor(result.totalScore / 10)}`}>
            Grade: {getScoreGrade(result.totalScore)}
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <Progress value={(result.totalScore / 999) * 100} className="h-4 mb-4" />
          <p className="text-gray-600">
            {result.totalScore >= 700 ? 'Excellent! Your startup shows strong investment potential.' :
             result.totalScore >= 500 ? 'Good foundation with room for improvement.' :
             result.totalScore >= 300 ? 'Early stage with key areas to develop.' :
             'Focus on strengthening core fundamentals.'}
          </p>
        </div>
      </Card>

      {/* Category Scores */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {categories.map((category) => (
          <Card key={category.name} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${category.color}`}></div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <span className="text-sm text-gray-500">({category.weight})</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {category.score}/100
              </div>
            </div>
            <Progress value={category.score} className="mb-4" />
            <p className="text-gray-600 text-sm">{category.explanation}</p>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Take Again</span>
        </Button>
        <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </Button>
      </div>

      {/* Next Steps */}
      <Card className="p-6 mt-8 bg-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {result.businessIdea < 70 && (
            <p>• <strong>Business Idea:</strong> Develop a stronger prototype and clarify your market positioning</p>
          )}
          {result.financials < 70 && (
            <p>• <strong>Financials:</strong> Focus on revenue generation and document your cap table properly</p>
          )}
          {result.team < 70 && (
            <p>• <strong>Team:</strong> Ensure full-time commitment and consider expanding your core team</p>
          )}
          {result.traction < 70 && (
            <p>• <strong>Traction:</strong> Build relationships with potential investors and gather market validation</p>
          )}
          <p>• Consider joining an accelerator program to strengthen weak areas</p>
          <p>• Prepare a compelling pitch deck highlighting your strongest categories</p>
        </div>
      </Card>
    </div>
  );
};
