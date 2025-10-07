import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { ScoreGauge } from '@/components/ScoreGauge';
import { RoadmapVisualization } from '@/components/progress/RoadmapVisualization';
import { MilestoneTracker } from '@/components/progress/MilestoneTracker';
import { ActionItems } from '@/components/progress/ActionItems';
import { 
  TrendingUp, 
  Target, 
  Users, 
  FileText, 
  ArrowRight, 
  BarChart3, 
  Clock,
  CheckCircle,
  AlertCircle,
  Brain
} from 'lucide-react';

export default function FundSeekerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [latestScore, setLatestScore] = useState<any>(null);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [investorMatches, setInvestorMatches] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch latest assessment
      const { data: assessments } = await supabase
        .from('assessment_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (assessments && assessments.length > 0) {
        setLatestScore(assessments[0].score_result);
      }

      // Count total assessments
      const { count } = await supabase
        .from('assessment_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      setAssessmentCount(count || 0);

      // Count investor matches
      const { count: matchCount } = await supabase
        .from('investor_matches')
        .select('*', { count: 'exact', head: true })
        .eq('startup_user_id', user?.id);

      setInvestorMatches(matchCount || 0);

      // Fetch recent activity
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activity = [
        ...(assessments || []).map(a => ({
          type: 'assessment',
          title: 'Completed Assessment',
          date: new Date(a.created_at),
          icon: BarChart3
        })),
        ...(badges || []).map(b => ({
          type: 'badge',
          title: `Earned: ${b.badge_name}`,
          date: new Date(b.created_at),
          icon: CheckCircle
        }))
      ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const hasCompletedAssessment = latestScore !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Track your fundraising progress and take action to improve your readiness.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasCompletedAssessment ? (
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{latestScore.totalScore || 0}</span>
                  <Target className="h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Not assessed</span>
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{assessmentCount}</span>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Investor Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{investorMatches}</span>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Improvement Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {hasCompletedAssessment ? '2-3' : '-'}
                </span>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Call to Action & Score */}
          <div className="lg:col-span-2 space-y-6">
            {/* CTA Card */}
            {!hasCompletedAssessment ? (
              <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Get Your Investment Readiness Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="opacity-90">
                    Start your journey to fundraising success with our comprehensive assessment tool.
                    Get detailed insights in just 10 minutes.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => navigate('/?assessment=true')}
                    className="w-full sm:w-auto"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Start Assessment Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Your Investment Readiness Score
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/?assessment=true')}
                    >
                      Retake Assessment
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <ScoreGauge 
                      score={latestScore.totalScore} 
                      maxScore={100} 
                      title="Overall Score" 
                      size="large" 
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {latestScore.businessIdea || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Business Idea</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {latestScore.team || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Team</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {latestScore.traction || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Traction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {latestScore.financials || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Financials</div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate('/results')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Full Report
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate('/ai-feedback')}
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      AI Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Roadmap */}
            <Card>
              <CardHeader>
                <CardTitle>Your Fundraising Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <RoadmapVisualization currentScore={latestScore?.totalScore || 0} />
              </CardContent>
            </Card>

            {/* Action Items */}
            <ActionItems score={latestScore} />
          </div>

          {/* Right Column: Activity & Milestones */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className="p-2 rounded-full bg-primary/10">
                          <activity.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Milestones */}
            <MilestoneTracker />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/investor-directory')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Browse Investors
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/learn')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Learning Resources
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/profile')}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
