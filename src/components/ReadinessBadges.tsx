
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, Shield, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface ReadinessBadge {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  progress: number;
  earned: boolean;
  icon: React.ReactNode;
  color: string;
}

interface ReadinessBadgesProps {
  assessmentData?: any;
  scoreResult?: any;
}

export const ReadinessBadges = ({ assessmentData, scoreResult }: ReadinessBadgesProps) => {
  const badges: ReadinessBadge[] = [
    {
      id: 'mvp-ready',
      name: 'MVP Ready',
      description: 'Has a working prototype and basic functionality',
      criteria: ['Working prototype', 'User testing completed', 'Core features defined'],
      progress: assessmentData?.prototype ? 100 : 30,
      earned: assessmentData?.prototype || false,
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'revenue-generator',
      name: 'Revenue Generator',
      description: 'Successfully generating recurring revenue',
      criteria: ['Paying customers', 'Recurring revenue model', 'Positive unit economics'],
      progress: assessmentData?.revenue ? 100 : 20,
      earned: assessmentData?.revenue || false,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'team-committed',
      name: 'Team Committed',
      description: 'Full-time founding team with complementary skills',
      criteria: ['Full-time founders', 'Complementary skills', 'Proven track record'],
      progress: assessmentData?.fullTimeTeam ? 100 : 50,
      earned: assessmentData?.fullTimeTeam || false,
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'investor-ready',
      name: 'Investor Ready',
      description: 'Meets key criteria that angel investors look for',
      criteria: ['Strong pitch deck', 'Financial projections', 'Market validation'],
      progress: scoreResult?.totalScore ? Math.min(100, (scoreResult.totalScore / 700) * 100) : 0,
      earned: scoreResult?.totalScore >= 700,
      icon: <Trophy className="h-5 w-5" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'market-validated',
      name: 'Market Validated',
      description: 'Proven market demand and customer validation',
      criteria: ['Customer interviews', 'Market research', 'Product-market fit signals'],
      progress: assessmentData?.termSheets ? 100 : 40,
      earned: assessmentData?.termSheets || false,
      icon: <Target className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'growth-ready',
      name: 'Growth Ready',
      description: 'Positioned for rapid scaling and growth',
      criteria: ['Scalable business model', 'Growth metrics', 'Operational systems'],
      progress: 60,
      earned: false,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-indigo-500'
    }
  ];

  const earnedBadges = badges.filter(badge => badge.earned);
  const availableBadges = badges.filter(badge => !badge.earned);

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
            Earned Badges ({earnedBadges.length})
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`${badge.color} text-white p-2 rounded-lg`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      EARNED
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                <div className="space-y-1">
                  {badge.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-gray-600">{criterion}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Badges */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-gray-500" />
          Available Badges ({availableBadges.length})
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableBadges.map((badge) => (
            <Card key={badge.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`${badge.color} text-white p-2 rounded-lg opacity-60`}>
                  {badge.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {badge.progress}% Complete
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
              <Progress value={badge.progress} className="mb-3" />
              <div className="space-y-1">
                {badge.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className="h-3 w-3 rounded-full border-2 border-gray-300"></div>
                    <span className="text-gray-600">{criterion}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Badge Progress Summary */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h4 className="font-semibold mb-4">Badge Progress Summary</h4>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">Badges Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{availableBadges.length}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((earnedBadges.length / badges.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
