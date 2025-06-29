
import { useState } from 'react';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';

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
  const [currentStep, setCurrentStep] = useState<'intro' | 'assessment' | 'results'>('intro');
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

  const handleStartAssessment = () => {
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = (data: AssessmentData, result: ScoreResult) => {
    setAssessmentData(data);
    setScoreResult(result);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
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
        />
      )}
    </div>
  );
};

export default Index;
