
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Users, DollarSign, Lightbulb } from 'lucide-react';

interface Recommendations {
  businessIdea: string[];
  financials: string[];
  team: string[];
  traction: string[];
}

interface RecommendationsDisplayProps {
  recommendations: Recommendations;
  scores: {
    businessIdea: number;
    financials: number;
    team: number;
    traction: number;
  };
}

export const RecommendationsDisplay = ({ recommendations, scores }: RecommendationsDisplayProps) => {
  const categories = [
    {
      name: 'Business Idea',
      key: 'businessIdea' as keyof Recommendations,
      score: scores.businessIdea,
      icon: Lightbulb,
      color: 'bg-purple-500',
      recommendations: recommendations.businessIdea
    },
    {
      name: 'Financials',
      key: 'financials' as keyof Recommendations,
      score: scores.financials,
      icon: DollarSign,
      color: 'bg-green-500',
      recommendations: recommendations.financials
    },
    {
      name: 'Team',
      key: 'team' as keyof Recommendations,
      score: scores.team,
      icon: Users,
      color: 'bg-blue-500',
      recommendations: recommendations.team
    },
    {
      name: 'Traction',
      key: 'traction' as keyof Recommendations,
      score: scores.traction,
      icon: TrendingUp,
      color: 'bg-orange-500',
      recommendations: recommendations.traction
    }
  ];

  const getScoreBadgeColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalized Recommendations</h2>
        <p className="text-gray-600">Actionable steps to improve your investor readiness</p>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const isPriority = category.score < 50;
          
          return (
            <Card key={category.key} className={`p-6 ${isPriority ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    {isPriority && (
                      <Badge variant="destructive" className="text-xs">Priority Area</Badge>
                    )}
                  </div>
                </div>
                <Badge className={getScoreBadgeColor(category.score)}>
                  {category.score}/100
                </Badge>
              </div>
              
              <div className="space-y-3">
                {category.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Focus on areas marked as "Priority" first - these will have the biggest impact on investor interest</p>
          <p>• Start with quick wins that can be completed in 1-2 weeks</p>
          <p>• Document your progress and update your pitch materials accordingly</p>
          <p>• Consider working with mentors or advisors in your weaker areas</p>
        </div>
      </Card>
    </div>
  );
};
