
import React, { useState, useEffect } from 'react';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Hero } from '@/components/Hero';
import { DraftSaving } from '@/components/DraftSaving';
import { MobileOptimization } from '@/components/MobileOptimization';
import { LoadingState } from '@/components/ui/loading-state';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { Badge } from '@/components/ui/badge';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { useAuth } from '@/hooks/useAuth';
import { saveDraft, loadDraft, clearDraft } from '@/utils/autosave';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

const assessmentSteps = [
  { id: 'business', title: 'Business Idea', completed: false },
  { id: 'team', title: 'Team', completed: false },
  { id: 'financials', title: 'Financials', completed: false },
  { id: 'traction', title: 'Traction', completed: false },
];

export default function Index() {
  const [searchParams] = useSearchParams();
  const shouldStartAssessment = searchParams.get('assessment') === 'true';
  
  const [currentView, setCurrentView] = useState<'hero' | 'assessment' | 'results'>(() => {
    return shouldStartAssessment ? 'assessment' : 'hero';
  });
  
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
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState(assessmentSteps);
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
      setIsLoading(true);
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
        
        // Update step completion status
        const updatedSteps = steps.map((step, index) => ({
          ...step,
          completed: index < draft.step
        }));
        setSteps(updatedSteps);
        
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast({
        title: "Error",
        description: "Failed to load your previous progress.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = () => {
    setCurrentView('assessment');
  };

  const handleAssessmentComplete = async (data: AssessmentData, result: ScoreResult) => {
    setIsLoading(true);
    
    try {
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
        await clearDraft();
      }
      
      toast({
        title: "Assessment Complete!",
        description: `Your startup scored ${result.totalScore} points.`,
      });
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  const handleRestart = async () => {
    setIsLoading(true);
    
    try {
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
      setSteps(assessmentSteps.map(step => ({ ...step, completed: false })));
      
      if (user) {
        await clearDraft();
      }
    } catch (error) {
      console.error('Error restarting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDraft = (data: AssessmentData, step: number) => {
    setAssessmentData(data);
    setCurrentStep(step);
    
    // Update step completion
    const updatedSteps = steps.map((stepItem, index) => ({
      ...stepItem,
      completed: index < step
    }));
    setSteps(updatedSteps);
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

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // Update step completion
    const updatedSteps = steps.map((stepItem, index) => ({
      ...stepItem,
      completed: index < step
    }));
    setSteps(updatedSteps);
  };

  if (isLoading && currentView === 'assessment') {
    return (
      <MobileOptimization>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <LoadingState message="Loading your assessment..." />
          </div>
        </div>
      </MobileOptimization>
    );
  }

  return (
    <MobileOptimization>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {currentView === 'hero' && (
          <Hero onStartAssessment={handleStartAssessment} />
        )}

        {currentView === 'assessment' && (
          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Progress Indicator */}
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <ProgressIndicator steps={steps} currentStep={currentStep} />
            </div>
            
            {user && (
              <DraftSaving
                assessmentData={assessmentData}
                currentStep={currentStep}
                onLoadDraft={handleLoadDraft}
              />
            )}
            
            <div className="bg-card rounded-lg shadow-sm border">
              <AssessmentForm
                onComplete={handleAssessmentComplete}
                initialData={assessmentData}
                onDataChange={handleDataChange}
                onStepChange={handleStepChange}
              />
            </div>
          </div>
        )}

        {currentView === 'results' && scoreResult && (
          <div className="space-y-8">
            {badges.length > 0 && (
              <div className="container mx-auto px-4 pt-8">
                <div className="bg-card rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">🏆 Achievements Unlocked</h3>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="animate-in fade-in duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <ScoreDisplay
              result={scoreResult}
              assessmentData={assessmentData}
              onRestart={handleRestart}
              badges={badges}
              engagementMessage={engagementMessage}
            />
          </div>
        )}
      </div>
    </MobileOptimization>
  );
}
