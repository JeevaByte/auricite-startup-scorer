
import { useState } from 'react';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { AssessmentHistory } from '@/components/AssessmentHistory';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { saveAssessment, saveScore, saveBadges, assignBadges, checkCachedResponse, cacheResponse, DatabaseAssessment, DatabaseScore } from '@/utils/database';
import { calculateScore } from '@/utils/scoreCalculator';

export interface AssessmentData {
  prototype: boolean | null;
  externalCapital: boolean | null;
  revenue: boolean | null;
  fullTimeTeam: boolean | null;
  termSheets: boolean | null;
  capTable: boolean | null;
  mrr: 'none' | 'low' | 'medium' | 'high' | null;
  employees: '1-2' | '3-10' | '11-50' | '50+' | null;
  fundingGoal: 'mvp' | 'productMarketFit' | 'scale' | 'exit' | null;
  investors: 'none' | 'angels' | 'vc' | 'lateStage' | null;
  milestones: 'concept' | 'launch' | 'scale' | 'exit' | null;
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

const Index = () => {
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results' | 'history'>('intro');
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [engagementMessage, setEngagementMessage] = useState<string>('');

  const handleStartAssessment = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = async (data: AssessmentData, result: ScoreResult) => {
    setAssessmentData(data);
    setScoreResult(result);
    
    if (user) {
      try {
        // Check for cached response first
        const cachedResult = await checkCachedResponse(data);
        if (cachedResult) {
          setScoreResult(cachedResult);
        } else {
          // Cache the new response
          await cacheResponse(data, result);
        }
        
        // Save assessment and score to database
        const assessmentId = await saveAssessment(data);
        await saveScore(assessmentId, result);

        // Assign and save badges
        try {
          const badgeResult = await assignBadges(data, result);
          setBadges(badgeResult.badges || []);
          setEngagementMessage(badgeResult.engagementMessage || '');
          
          if (badgeResult.badges && badgeResult.badges.length > 0) {
            await saveBadges(assessmentId, badgeResult.badges);
          }
        } catch (badgeError) {
          console.error('Error assigning badges:', badgeError);
          // Set fallback badge if badge assignment fails
          const fallbackBadges = [{ name: 'Starter', explanation: 'Early-stage startup with potential to grow.' }];
          setBadges(fallbackBadges);
          setEngagementMessage('Keep building your startup!');
        }
      } catch (error) {
        console.error('Error saving assessment:', error);
      }
    }
    
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setCurrentStep('intro');
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
  };

  const handleViewHistory = () => {
    setCurrentStep('history');
  };

  const handleViewScore = (assessment: DatabaseAssessment, score: DatabaseScore) => {
    // Convert database format to app format with proper type casting
    setAssessmentData({
      prototype: assessment.prototype,
      externalCapital: assessment.external_capital,
      revenue: assessment.revenue,
      fullTimeTeam: assessment.full_time_team,
      termSheets: assessment.term_sheets,
      capTable: assessment.cap_table,
      mrr: assessment.mrr as 'none' | 'low' | 'medium' | 'high',
      employees: assessment.employees as '1-2' | '3-10' | '11-50' | '50+',
      fundingGoal: assessment.funding_goal as 'mvp' | 'productMarketFit' | 'scale' | 'exit',
      investors: assessment.investors as 'none' | 'angels' | 'vc' | 'lateStage',
      milestones: assessment.milestones as 'concept' | 'launch' | 'scale' | 'exit',
    });
    
    setScoreResult({
      businessIdea: score.business_idea,
      businessIdeaExplanation: score.business_idea_explanation,
      financials: score.financials,
      financialsExplanation: score.financials_explanation,
      team: score.team,
      teamExplanation: score.team_explanation,
      traction: score.traction,
      tractionExplanation: score.traction_explanation,
      totalScore: score.total_score,
    });
    
    setCurrentStep('results');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onViewHistory={user ? handleViewHistory : undefined} />
      
      {currentStep === 'intro' && (
        <Hero onStartAssessment={handleStartAssessment} />
      )}
      
      {currentStep === 'assessment' && (
        <AssessmentForm 
          onComplete={handleAssessmentComplete}
          initialData={assessmentData}
        />
      )}
      
      {currentStep === 'results' && scoreResult && (
        <ScoreDisplay
          result={scoreResult}
          assessmentData={assessmentData}
          onRestart={handleRestart}
          badges={badges}
          engagementMessage={engagementMessage}
        />
      )}
      
      {currentStep === 'history' && (
        <AssessmentHistory
          onBack={() => setCurrentStep('intro')}
          onViewScore={handleViewScore}
        />
      )}
      
      <Footer />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Index;
