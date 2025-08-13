
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import InvestorAssessmentForm from '@/components/InvestorAssessmentForm';
import InvestorClassification from '@/components/InvestorClassification';
import { getUserInvestorProfiles } from '@/utils/investorDatabase';
import { LoadingState } from '@/components/ui/loading-state';
import { Plus, Crown, Users, TrendingUp, ArrowRight } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPremiumAccess, createPortalSession } = useSubscription();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [latestClassification, setLatestClassification] = useState<any>(null);

  useEffect(() => {
    if (user && hasPremiumAccess) {
      loadProfiles();
    } else {
      setLoading(false);
    }
  }, [user, hasPremiumAccess]);

  const loadProfiles = async () => {
    try {
      const data = await getUserInvestorProfiles();
      setProfiles(data);
      
      // Get the latest classification
      if (data.length > 0 && data[0].classifications.length > 0) {
        setLatestClassification({
          category: data[0].classifications[0].category,
          confidence: data[0].classifications[0].confidence,
          explanation: data[0].classifications[0].explanation,
        });
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentComplete = (classification: any) => {
    setLatestClassification(classification);
    setShowAssessment(false);
    loadProfiles();
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  const premiumFallback = (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
          <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2">
            Premium Feature
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Investor Profiling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get classified as an Angel, VC, Family Office, or Institutional investor 
                based on your investment patterns and preferences.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Personalized investor classification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Investment preference analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Risk profile assessment
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Startup Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Connect with startups that match your investment criteria, stage preferences, 
                and sector focus areas.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI-powered startup recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Direct founder connections
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Deal flow management
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">
              Unlock Your Investor Dashboard
            </h3>
            <p className="text-muted-foreground mb-6">
              Upgrad and start connecting with high-quality startups today.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = '/pricing'}>
                <Crown className="mr-2 h-5 w-5" />
                Upgrad
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.location.href = '/investor-directory'}>
                Go to Investor Directory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <AuthGuard requireAuth requirePremium fallback={premiumFallback}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your investor profile and discover investment opportunities
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
            <Button onClick={() => setShowAssessment(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading your investor dashboard..." />
        ) : showAssessment ? (
          <InvestorAssessmentForm onComplete={handleAssessmentComplete} />
        ) : latestClassification ? (
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList>
              <TabsTrigger value="matches">Startup Matches</TabsTrigger>
              <TabsTrigger value="history">Assessment History</TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Startups</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Startup matching feature coming soon. We'll connect you with startups 
                    that align with your investment profile and preferences.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History & Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* User Profile Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
                    <InvestorClassification classification={latestClassification} />
                  </div>
                  {/* Assessment History Section */}
                  {profiles.length > 0 ? (
                    <div className="space-y-4">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                Assessment on {new Date(profile.created_at).toLocaleDateString()}
                              </p>
                              {profile.classifications.length > 0 && (
                                <Badge className="mt-2">
                                  {profile.classifications[0].category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Check Size: {profile.check_size} • Stage: {profile.stage}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No assessments completed yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Investor Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-6">
                Complete your investor assessment to get classified and matched with relevant startups.
              </p>
              <Button onClick={() => setShowAssessment(true)} size="lg">
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthGuard>
  );
};

export default InvestorDashboard;
