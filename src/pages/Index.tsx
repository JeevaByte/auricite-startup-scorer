import React, { useState, useEffect } from 'react';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Hero } from '@/components/Hero';
import { DraftSaving } from '@/components/DraftSaving';
import { MobileOptimization } from '@/components/MobileOptimization';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { useAuth } from '@/hooks/useAuth';
import { saveDraft, loadDraft, clearDraft } from '@/utils/autosave';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [currentView, setCurrentView] = useState<'hero' | 'assessment' | 'results'>('hero');
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    prototype: null,
    externalCapital: null,
    revenue: null,
    fullTimeTeam: null,
    termSheets: null,
    capTable: null,
    mrr: null,
    employees: null,
    fundingGoal: null,
    investors: null,
    milestones: null,
  });
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [badges, setBadges] = useState<{ name: string; explanation: string }[]>([]);
  const [engagementMessage, setEngagementMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load draft on mount if user is authenticated
  useEffect(() => {
    if (user && currentView === 'assessment') {
      loadExistingDraft();
    }
  }, [user, currentView]);

  const loadExistingDraft = async () => {
    try {
      const draft = await loadDraft();
      if (draft && draft.draft_data) {
        // Merge draft data with default values to ensure all required properties exist
        const mergedData: AssessmentData = {
          prototype: null,
          externalCapital: null,
          revenue: null,
          fullTimeTeam: null,
          termSheets: null,
          capTable: null,
          mrr: null,
          employees: null,
          fundingGoal: null,
          investors: null,
          milestones: null,
          ...draft.draft_data
        };
        setAssessmentData(mergedData);
        setCurrentStep(draft.step);
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleStartAssessment = () => {
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = (data: AssessmentData, result: ScoreResult) => {
    setAssessmentData(data);
    setScoreResult(result);
    
    // Generate badges based on results
    const earnedBadges = [];
    if (result.businessIdea >= 80) {
      earnedBadges.push({ name: 'Strong Vision', explanation: 'Excellent business idea validation' });
    }
    if (result.financials >= 70) {
      earnedBadges.push({ name: 'Financial Readiness', explanation: 'Strong financial foundation' });
    }
    if (result.team >= 75) {
      earnedBadges.push({ name: 'Team Excellence', explanation: 'Well-rounded founding team' });
    }
    if (result.traction >= 65) {
      earnedBadges.push({ name: 'Market Validation', explanation: 'Proven market traction' });
    }
    if (result.totalScore >= 700) {
      earnedBadges.push({ name: 'Investor Ready', explanation: 'Ready for angel investment' });
    }

    setBadges(earnedBadges);
    setEngagementMessage(generateEngagementMessage(result));
    setCurrentView('results');

    // Clear draft after successful completion
    if (user) {
      clearDraft().catch(console.error);
    }
  };

  const generateEngagementMessage = (result: ScoreResult) => {
    if (result.totalScore >= 800) {
      return "🚀 Outstanding! Your startup shows exceptional investment readiness. Consider reaching out to our investor network.";
    } else if (result.totalScore >= 600) {
      return "💪 Great progress! With a few improvements, you'll be ready to attract serious investors.";
    } else if (result.totalScore >= 400) {
      return "📈 Good foundation! Focus on the recommended areas to strengthen your investment appeal.";
    } else {
      return "🌱 Early stage detected. Use our recommendations to build a stronger foundation for future funding.";
    }
  };

  const handleRestart = () => {
    setCurrentView('hero');
    setAssessmentData({
      prototype: null,
      externalCapital: null,
      revenue: null,
      fullTimeTeam: null,
      termSheets: null,
      capTable: null,
      mrr: null,
      employees: null,
      fundingGoal: null,
      investors: null,
      milestones: null,
    });
    setScoreResult(null);
    setBadges([]);
    setEngagementMessage('');
    setCurrentStep(0);
    if (user) {
      clearDraft().catch(console.error);
    }
  };

  const handleLoadDraft = (data: AssessmentData, step: number) => {
    setAssessmentData(data);
    setCurrentStep(step);
  };

  const handleDataChange = async (data: AssessmentData) => {
    setAssessmentData(data);
    
    // Auto-save if user is authenticated
    if (user) {
      try {
        await saveDraft(data, currentStep);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  return (
    <MobileOptimization>
      <div className="min-h-screen bg-gray-50">
        {currentView === 'hero' && (
          <Hero onStartAssessment={handleStartAssessment} />
        )}

        {currentView === 'assessment' && (
          <div className="container mx-auto px-4 py-8">
            {user && (
              <DraftSaving
                assessmentData={assessmentData}
                currentStep={currentStep}
                onLoadDraft={handleLoadDraft}
              />
            )}
            
            <AssessmentForm
              onComplete={handleAssessmentComplete}
              initialData={assessmentData}
              onDataChange={handleDataChange}
            />
          </div>
        )}

        {currentView === 'results' && scoreResult && (
          <ScoreDisplay
            result={scoreResult}
            assessmentData={assessmentData}
            onRestart={handleRestart}
            badges={badges}
            engagementMessage={engagementMessage}
          />
        )}

        <Footer />
      </div>
    </MobileOptimization>
  );
}
