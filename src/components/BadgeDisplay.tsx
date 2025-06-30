
import React from 'react';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Trophy, Lightbulb, TrendingUp, DollarSign, Target } from 'lucide-react';

interface Badge {
  name: string;
  explanation: string;
}

interface Props {
  badges: Badge[];
  engagementMessage?: string;
}

const badgeIcons = {
  'Rising Star': Star,
  'Team Titan': Trophy,
  'Visionary': Lightbulb,
  'Traction Trailblazer': TrendingUp,
  'Financial Pioneer': DollarSign,
  'Angel Ready': Target,
  'Starter': Star,
};

const badgeColors = {
  'Rising Star': 'bg-yellow-500 text-white',
  'Team Titan': 'bg-purple-500 text-white',
  'Visionary': 'bg-blue-500 text-white',
  'Traction Trailblazer': 'bg-green-500 text-white',
  'Financial Pioneer': 'bg-orange-500 text-white',
  'Angel Ready': 'bg-red-500 text-white',
  'Starter': 'bg-gray-500 text-white',
};

const BadgeDisplay: React.FC<Props> = ({ badges, engagementMessage }) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mb-6">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 Your Achievement Badges</h3>
          {engagementMessage && (
            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
              {engagementMessage}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, index) => {
            const Icon = badgeIcons[badge.name as keyof typeof badgeIcons] || Star;
            const colorClass = badgeColors[badge.name as keyof typeof badgeColors] || 'bg-gray-500 text-white';
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2 max-w-xs">
                <div className={`p-3 rounded-full ${colorClass} shadow-lg`}>
                  <Icon className="h-8 w-8" />
                </div>
                <BadgeUI variant="secondary" className="text-sm font-semibold">
                  {badge.name}
                </BadgeUI>
                <p className="text-xs text-gray-600 text-center leading-tight">
                  {badge.explanation}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Keep improving your scores to unlock more badges!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;
