
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestorAssessmentForm from '@/components/InvestorAssessmentForm';
import InvestorClassification from '@/components/InvestorClassification';
import { getUserInvestorProfiles } from '@/utils/investorDatabase';
import { Loader2, Plus } from 'lucide-react';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [latestClassification, setLatestClassification] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InvestorAssessmentForm onComplete={handleAssessmentComplete} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <Button onClick={() => setShowAssessment(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>

      {latestClassification ? (
        <Tabs defaultValue="classification" className="space-y-6">
          <TabsList>
            <TabsTrigger value="classification">Your Classification</TabsTrigger>
            <TabsTrigger value="matches">Startup Matches</TabsTrigger>
            <TabsTrigger value="history">Assessment History</TabsTrigger>
          </TabsList>

          <TabsContent value="classification">
            <InvestorClassification classification={latestClassification} />
          </TabsContent>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Startups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Startup matching feature coming soon. We'll connect you with startups that align with your investment profile.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
              </CardHeader>
              <CardContent>
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
                              <p className="text-sm text-muted-foreground">
                                Classified as: {profile.classifications[0].category}
                              </p>
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
            <CardTitle>Welcome to the Investor Dashboard</CardTitle>
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
  );
};

export default InvestorDashboard;
