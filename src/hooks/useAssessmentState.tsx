
import { useState, useEffect } from 'react';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { useAuth } from '@/hooks/useAuth';
import { saveDraft, loadDraft, clearDraft } from '@/utils/autosave';
import { useToast } from '@/hooks/use-toast';

const assessmentSteps = [
  { id: 'business', title: 'Business Idea', completed: false },
  { id: 'team', title: 'Team', completed: false },
  { id: 'financials', title: 'Financials', completed: false },
  { id: 'traction', title: 'Traction', completed: false },
];

const defaultAssessmentData: AssessmentData = {
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
};

export const useAssessmentState = () => {
  const [assessmentData, setAssessmentData] = useState<AssessmentData>(defaultAssessmentData);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [badges, setBadges] = useState<{ name: string; explanation: string }[]>([]);
  const [engagementMessage, setEngagementMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState(assessmentSteps);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadExistingDraft = async () => {
    try {
      setIsLoading(true);
      const draft = await loadDraft();
      if (draft && draft.draft_data) {
        const mergedData: AssessmentData = {
          ...defaultAssessmentData,
          ...draft.draft_data
        };
        setAssessmentData(mergedData);
        setCurrentStep(draft.step);
        
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

  const generateBadges = (result: ScoreResult) => {
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
    return earnedBadges;
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

  const handleAssessmentComplete = async (data: AssessmentData, result: ScoreResult) => {
    setIsLoading(true);
    
    try {
      setAssessmentData(data);
      setScoreResult(result);
      
      const earnedBadges = generateBadges(result);
      setBadges(earnedBadges);
      setEngagementMessage(generateEngagementMessage(result));

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

  const handleRestart = async () => {
    setIsLoading(true);
    
    try {
      setAssessmentData(defaultAssessmentData);
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
    
    const updatedSteps = steps.map((stepItem, index) => ({
      ...stepItem,
      completed: index < step
    }));
    setSteps(updatedSteps);
  };

  const handleDataChange = async (data: AssessmentData) => {
    setAssessmentData(data);
    
    if (user) {
      try {
        await saveDraft(data, currentStep);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  };

  return {
    assessmentData,
    scoreResult,
    badges,
    engagementMessage,
    currentStep,
    isLoading,
    steps,
    loadExistingDraft,
    handleAssessmentComplete,
    handleRestart,
    handleLoadDraft,
    handleDataChange,
  };
};
