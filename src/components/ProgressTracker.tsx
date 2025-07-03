
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentHistory {
  id: string;
  totalScore: number;
  createdAt: string;
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
}

interface ProgressTrackerProps {
  assessments: AssessmentHistory[];
  currentScore: number;
}

export const ProgressTracker = ({ assessments, currentScore }: ProgressTrackerProps) => {
  if (assessments.length < 2) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Progress</h3>
          <p className="text-gray-600 mb-4">
            Complete more assessments to see your improvement over time
          </p>
          <Badge variant="outline">First Assessment Complete</Badge>
        </div>
      </Card>
    );
  }

  const sortedAssessments = [...assessments].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const latestAssessment = sortedAssessments[sortedAssessments.length - 1];
  const previousAssessment = sortedAssessments[sortedAssessments.length - 2];
  
  const scoreDifference = latestAssessment.totalScore - previousAssessment.totalScore;
  const improvementPercentage = ((scoreDifference / previousAssessment.totalScore) * 100);

  const getTrendIcon = () => {
    if (scoreDifference > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (scoreDifference < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (scoreDifference > 0) return 'text-green-600';
    if (scoreDifference < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const categories = [
    { name: 'Business Idea', current: latestAssessment.businessIdea, previous: previousAssessment.businessIdea },
    { name: 'Financials', current: latestAssessment.financials, previous: previousAssessment.financials },
    { name: 'Team', current: latestAssessment.team, previous: previousAssessment.team },
    { name: 'Traction', current: latestAssessment.traction, previous: previousAssessment.traction },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress Overview</h3>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {format(new Date(latestAssessment.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {latestAssessment.totalScore}
            </div>
            <div className="text-sm text-gray-600">Current Score</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getTrendColor()} mb-1 flex items-center justify-center space-x-1`}>
              {getTrendIcon()}
              <span>{scoreDifference > 0 ? '+' : ''}{scoreDifference}</span>
            </div>
            <div className="text-sm text-gray-600">
              {Math.abs(improvementPercentage).toFixed(1)}% change
            </div>
          </div>
        </div>

        <Progress value={(latestAssessment.totalScore / 999) * 100} className="mb-2" />
        <div className="text-sm text-gray-600 text-center">
          {latestAssessment.totalScore}/999 points
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Category Breakdown</h4>
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryChange = category.current - category.previous;
            return (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{category.current}/100</span>
                      <span className={`text-xs ${categoryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({categoryChange >= 0 ? '+' : ''}{categoryChange})
                      </span>
                    </div>
                  </div>
                  <Progress value={category.current} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Assessment History</h4>
        <div className="space-y-2">
          {sortedAssessments.slice(-5).reverse().map((assessment, index) => (
            <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant={index === 0 ? "default" : "outline"}>
                  {index === 0 ? 'Latest' : `${index + 1} ago`}
                </Badge>
                <span className="text-sm text-gray-600">
                  {format(new Date(assessment.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="text-sm font-medium">
                {assessment.totalScore}/999
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
