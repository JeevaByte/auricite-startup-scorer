import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, History, Settings, FileText, Eye, Edit, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataPrivacySettings } from '@/components/profile/DataPrivacySettings';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { SubscriptionManager } from '@/components/premium/SubscriptionManager';
import { PrivacyControls } from '@/components/profile/PrivacyControls';
import { TwoFactorAuth } from '@/components/security/TwoFactorAuth';
import { DataExport } from '@/components/profile/DataExport';

interface AssessmentHistoryItem {
  id: string;
  created_at: string;
  assessment_data: any;
  score_result: any;
}

export default function Profile() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssessmentHistory();
    }
  }, [user]);

  const fetchAssessmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewAssessment = (assessment: AssessmentHistoryItem) => {
    navigate('/results', {
      state: {
        assessmentData: assessment.assessment_data,
        scoreResult: assessment.score_result
      }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'bg-green-100 text-green-800';
    if (score >= 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your profile</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your assessments and account settings</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Investment History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-gray-900">
                      {new Date(user.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Investment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Assessments</span>
                    <span className="font-semibold">{assessments.length}</span>
                  </div>
                  {assessments.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latest Score</span>
                      <Badge className={getScoreColor(assessments[0]?.score_result?.totalScore || 0)}>
                        {assessments[0]?.score_result?.totalScore || 0}/999
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <ProfileEdit />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Subscription</h3>
              <SubscriptionManager />
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Investment History</h3>
              {userRole === 'investor' ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">Track your investment portfolio and deal history</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Investments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Active portfolio companies</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Deployed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">$2.4M</div>
                        <p className="text-xs text-muted-foreground">Across all deals</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Recent Investments</h4>
                    <div className="space-y-3">
                      {[
                        { company: 'TechVenture AI', amount: '$250K', date: '2024-10-01', stage: 'Series A' },
                        { company: 'GreenTech Solutions', amount: '$150K', date: '2024-09-15', stage: 'Seed' },
                        { company: 'FinanceFlow', amount: '$200K', date: '2024-08-20', stage: 'Series A' },
                      ].map((investment, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{investment.company}</div>
                              <div className="text-sm text-muted-foreground">
                                {investment.stage} • {new Date(investment.date).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant="secondary">{investment.amount}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/investor/portfolio')}>
                      View Full Portfolio
                    </Button>
                  </div>
                </div>
              ) : (
                loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading assessments...</p>
                  </div>
                ) : assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assessments yet</p>
                    <Button onClick={() => navigate('/unified-assessment')} className="mt-4">
                      Take Your First Assessment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={getScoreColor(assessment.score_result?.totalScore || 0)}>
                                {assessment.score_result?.totalScore || 0}/100
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(assessment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Business:</span>
                                <span className="ml-1 font-medium">
                                  {assessment.score_result?.businessIdea || 0}/100
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Financials:</span>
                                <span className="ml-1 font-medium">
                                  {assessment.score_result?.financials || 0}/100
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Team:</span>
                                <span className="ml-1 font-medium">
                                  {assessment.score_result?.team || 0}/100
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Traction:</span>
                                <span className="ml-1 font-medium">
                                  {assessment.score_result?.traction || 0}/100
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewAssessment(assessment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <PrivacyControls />
              <DataPrivacySettings />
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <TwoFactorAuth />
              <DataExport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
