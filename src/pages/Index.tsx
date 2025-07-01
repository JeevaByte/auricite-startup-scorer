import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { ConsentCheckbox } from '@/components/ConsentCheckbox';
import { saveAssessment, saveScore, assignBadges, saveBadges } from '@/utils/database';
import { loadDraft, saveDraft, clearDraft } from '@/utils/autosave';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';
import { useNavigate } from 'react-router-dom';

export interface AssessmentData {
  prototype: boolean | null;
  revenue: boolean | null;
  mrr: string | null;
  capTable: boolean | null;
  fullTimeTeam: boolean | null;
  employees: string | null;
  milestones: string | null;
  fundingGoal: string | null;
  termSheets: boolean | null;
  investors: string | null;
  externalCapital: boolean | null;
}

export interface ScoreResult {
  businessIdea: number;
  businessIdeaExplanation: string;
  financials: number;
  financialsExplanation: string;
  team: number;
  teamExplanation: string;
  traction: number;
  tractionExplanation: string;
  totalScore: number;
}

const initialData: AssessmentData = {
  prototype: null,
  revenue: null,
  mrr: null,
  capTable: null,
  fullTimeTeam: null,
  employees: null,
  milestones: null,
  fundingGoal: null,
  termSheets: null,
  investors: null,
  externalCapital: null
};

const Index = () => {
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(initialData);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [badges, setBadges] = useState<{ name: string; explanation: string }[]>([]);
  const [engagementMessage, setEngagementMessage] = useState<string>('');
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssessmentDraft = async () => {
      try {
        setLoadingDraft(true);
        const draft = await loadDraft();
        if (draft) {
          setAssessmentData(draft.draft_data as AssessmentData);
          setAssessmentStarted(true);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setLoadingDraft(false);
      }
    };

    loadAssessmentDraft();
  }, []);

  const handleStartAssessment = () => {
    if (!consentGiven) {
      toast({
        title: 'Consent Required',
        description: 'Please agree to the terms and privacy policy to proceed.',
        variant: 'destructive',
      });
      return;
    }
    setAssessmentStarted(true);
  };

  const handleSaveDraft = async (data: Partial<AssessmentData>, step: number) => {
    try {
      await saveDraft(data, step);
      toast({
        title: 'Draft Saved',
        description: 'Your progress has been saved.',
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'Error Saving Draft',
        description: 'Failed to save your progress. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssessmentRestart = async () => {
    setAssessmentStarted(false);
    setAssessmentComplete(false);
    setAssessmentData(initialData);
    setScoreResult(null);
    setBadges([]);
    setEngagementMessage('');
    try {
      await clearDraft();
      toast({
        title: 'Assessment Reset',
        description: 'Your assessment has been reset.',
      });
    } catch (error) {
      console.error('Error clearing draft:', error);
      toast({
        title: 'Error Resetting Assessment',
        description: 'Failed to reset the assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (data: AssessmentData, result: ScoreResult) => {
    console.log('Assessment completed:', { data, result });
    
    try {
      // Save assessment to database
      const assessmentId = await saveAssessment(data);
      await saveScore(assessmentId, result);
      
      // Get badges
      const badgeData = await assignBadges(data, result);
      if (badgeData?.badges) {
        await saveBadges(assessmentId, badgeData.badges);
        setBadges(badgeData.badges);
      }
      
      // Set engagement message
      setEngagementMessage(badgeData?.engagementMessage || 'Great job completing your assessment!');
      
      // Clear any saved draft
      await clearDraft();
      
      // Navigate to results page with data
      navigate('/results', {
        state: {
          assessmentData: data,
          scoreResult: result
        }
      });
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container max-w-4xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Startup Investment Readiness Assessment
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Evaluate your startup's potential for investment with our comprehensive assessment tool.
          </p>
        </header>

        <main className="mb-8">
          {!assessmentStarted ? (
            <Card className="p-8">
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  This assessment will help you understand your startup's strengths and weaknesses across key
                  investment criteria. By answering a series of questions, you'll receive a detailed score and
                  personalized recommendations to improve your investment readiness.
                </p>
                <ConsentCheckbox
                  checked={consentGiven}
                  onCheckedChange={setConsentGiven}
                />
                <Button onClick={handleStartAssessment} disabled={loadingDraft || !consentGiven} className="w-full">
                  {loadingDraft ? 'Loading Draft...' : 'Start Assessment'}
                </Button>
              </div>
            </Card>
          ) : assessmentComplete && scoreResult ? (
            <ScoreDisplay
              result={scoreResult}
              assessmentData={assessmentData}
              onRestart={handleAssessmentRestart}
              badges={badges}
              engagementMessage={engagementMessage}
            />
          ) : (
            <AssessmentWizard
              onComplete={handleComplete}
              initialData={assessmentData}
              onSaveDraft={handleSaveDraft}
            />
          )}
        </main>

        <footer className="text-center text-gray-500 mt-8">
          <p>&copy; 2024 Startup Assessment Tool. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
