import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Star, Award, TrendingUp } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: any;
  achieved: boolean;
  achievedAt?: Date;
  color: string;
}

export const MilestoneTracker: React.FC = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (user) {
      checkMilestones();
    }
  }, [user]);

  const checkMilestones = async () => {
    try {
      // Fetch user data
      const { data: assessments } = await supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', user?.id);

      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user?.id);

      const assessmentCount = assessments?.length || 0;
      const badgeCount = badges?.length || 0;
      const scoreResult = assessments?.[0]?.score_result as any;
      const latestScore = scoreResult?.totalScore || 0;

      const milestoneData: Milestone[] = [
        {
          id: '1',
          title: 'First Assessment',
          description: 'Complete your first investment readiness assessment',
          icon: Target,
          achieved: assessmentCount >= 1,
          achievedAt: assessments?.[0] ? new Date(assessments[0].created_at) : undefined,
          color: 'text-blue-500'
        },
        {
          id: '2',
          title: 'Score Achiever',
          description: 'Reach a score of 60 or higher',
          icon: TrendingUp,
          achieved: latestScore >= 60,
          color: 'text-green-500'
        },
        {
          id: '3',
          title: 'Badge Collector',
          description: 'Earn your first badge',
          icon: Award,
          achieved: badgeCount >= 1,
          achievedAt: badges?.[0] ? new Date(badges[0].created_at) : undefined,
          color: 'text-purple-500'
        },
        {
          id: '4',
          title: 'Investment Ready',
          description: 'Achieve a score of 75 or higher',
          icon: Star,
          achieved: latestScore >= 75,
          color: 'text-yellow-500'
        },
        {
          id: '5',
          title: 'Excellence',
          description: 'Score 85+ and join the top performers',
          icon: Trophy,
          achieved: latestScore >= 85,
          color: 'text-orange-500'
        }
      ];

      setMilestones(milestoneData);
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  };

  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Milestones
          </CardTitle>
          <Badge variant="secondary">
            {achievedCount}/{milestones.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                milestone.achieved 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-muted/50'
              }`}
            >
              <div className={`p-2 rounded-full ${
                milestone.achieved ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <milestone.icon className={`h-4 w-4 ${
                  milestone.achieved ? milestone.color : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium text-sm ${
                    milestone.achieved ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {milestone.title}
                  </h4>
                  {milestone.achieved && (
                    <Badge variant="default" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {milestone.description}
                </p>
                {milestone.achieved && milestone.achievedAt && (
                  <p className="text-xs text-primary mt-1">
                    Achieved {milestone.achievedAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
