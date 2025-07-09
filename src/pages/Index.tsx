
import React, { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { AssessmentView } from '@/components/AssessmentView';
import { ResultsView } from '@/components/ResultsView';
import { MobileOptimization } from '@/components/MobileOptimization';
import { LoadingState } from '@/components/ui/loading-state';
import { useAssessmentState } from '@/hooks/useAssessmentState';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

export default function Index() {
  const [searchParams] = useSearchParams();
  const shouldStartAssessment = searchParams.get('assessment') === 'true';
  
  const [currentView, setCurrentView] = useState<'hero' | 'assessment' | 'results'>(() => {
    return shouldStartAssessment ? 'assessment' : 'hero';
  });
  
  const { user } = useAuth();
  const {
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
  } = useAssessmentState();

  // Load draft on mount if user is authenticated
  useEffect(() => {
    if (user && currentView === 'assessment') {
      loadExistingDraft();
    }
  }, [user, currentView]);

  const handleStartAssessment = () => {
    setCurrentView('assessment');
  };

  const onAssessmentComplete = async (data: any, result: any) => {
    await handleAssessmentComplete(data, result);
    setCurrentView('results');
  };

  const onRestart = async () => {
    await handleRestart();
    setCurrentView('hero');
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
          <AssessmentView
            assessmentData={assessmentData}
            currentStep={currentStep}
            steps={steps}
            isLoading={isLoading}
            onComplete={onAssessmentComplete}
            onDataChange={handleDataChange}
            onLoadDraft={handleLoadDraft}
          />
        )}

        {currentView === 'results' && scoreResult && (
          <ResultsView
            scoreResult={scoreResult}
            assessmentData={assessmentData}
            badges={badges}
            engagementMessage={engagementMessage}
            onRestart={onRestart}
          />
        )}
      </div>
    </MobileOptimization>
  );
}
