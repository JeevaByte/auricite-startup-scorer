
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreResult } from '@/utils/scoreCalculator';
import { calculateDynamicScore, getInvestmentReadinessLevel } from '@/utils/dynamicScoreCalculator';
import { Report } from '@/components/Report';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { ProgressTracker } from '@/components/ProgressTracker';
import { FeedbackCollection } from '@/components/FeedbackCollection';
import { downloadAsJSON, downloadAsCSV, generateReportData } from '@/utils/reportGenerator';
import { generateRecommendations, RecommendationsData } from '@/utils/recommendationsService';
import { BrandMessaging } from '@/components/BrandVoice';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { TargetAudienceSelector } from '@/components/TargetAudienceSelector';
import { TrustSignals } from '@/components/TrustSignals';
import { supabase } from '@/integrations/supabase/client';

export interface AssessmentData {
  prototype: boolean | null;
  externalCapital: boolean | null;
  revenue: boolean | null;
  fullTimeTeam: boolean | null;
  termSheets: boolean | null;
  capTable: boolean | null;
  mrr: string | null;
  employees: string | null;
  fundingGoal: string | null;
  investors: string | null;
  milestones: string | null;
}

export { ScoreResult };

export default function Index() {
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
  const [showAssessment, setShowAssessment] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSection, setFeedbackSection] = useState<'scoring' | 'recommendations' | 'overall'>('overall');
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const [userStage, setUserStage] = useState('');
  const [userIndustry, setUserIndustry] = useState('');

  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('assessment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching assessment history:', error);
        } else {
          setAssessmentHistory(data || []);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const handleAssessmentChange = (data: AssessmentData) => {
    setAssessmentData(data);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowTargetSelector(true);
  };

  const handleTargetSelection = (stage: string, industry: string) => {
    setUserStage(stage);
    setUserIndustry(industry);
    setShowTargetSelector(false);
    setShowAssessment(true);
  };

  const handleStartAssessment = () => {
    // Check if user is new (no previous assessments)
    if (!user || assessmentHistory.length === 0) {
      setShowOnboarding(true);
    } else {
      setShowAssessment(true);
    }
  };

  const handleSubmitAssessment = async (data: AssessmentData, result: ScoreResult) => {
    try {
      setScoreResult(result);
      setAssessmentData(data);

      // Generate recommendations
      const generatedRecommendations = await generateRecommendations(data, result);
      setRecommendations(generatedRecommendations);

      setShowAssessment(false);
      setShowResults(true);

      if (user) {
        const { data: savedData, error } = await supabase
          .from('assessment_history')
          .insert([
            {
              user_id: user.id,
              assessment_data: data,
              score_result: result,
            },
          ])
          .select()

        if (error) {
          console.error('Error saving assessment:', error);
        } else {
          console.log('Assessment saved successfully!', savedData);
          setCurrentAssessmentId(savedData[0].id);

          // Optimistically update assessment history
          setAssessmentHistory((prevHistory) => [savedData[0], ...prevHistory]);
        }
      }
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleDownloadReport = (format: 'json' | 'csv') => {
    if (scoreResult) {
      const reportData = generateReportData(assessmentData, scoreResult, recommendations);
      const filename = `investment_readiness_report_${new Date().toISOString()}.${format}`;

      if (format === 'json') {
        downloadAsJSON(reportData, filename);
      } else if (format === 'csv') {
        downloadAsCSV(reportData, filename);
      }
    }
  };

  const readinessLevel = scoreResult ? getInvestmentReadinessLevel(scoreResult.totalScore) : null;

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (showTargetSelector) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <TargetAudienceSelector onSelect={handleTargetSelection} />
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Startup Investment Readiness Assessment
          </h1>
          <AssessmentForm onComplete={handleSubmitAssessment} initialData={assessmentData} />
        </div>
        <Footer />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Assessment Results
          </h1>

          {scoreResult && readinessLevel && (
            <div className="mb-8">
              <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${readinessLevel.color.replace('text-', '')}-500`}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Investment Readiness: <span className={readinessLevel.color}>{readinessLevel.level}</span>
                </h2>
                <p className="text-gray-600 mb-4">{readinessLevel.description}</p>
                <div className="flex flex-wrap gap-2">
                  {readinessLevel.nextSteps && readinessLevel.nextSteps.map((step, index) => (
                    <span key={index} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {scoreResult && (
            <Report
              scoreResult={scoreResult}
              recommendations={recommendations}
              onFeedbackClick={(section) => {
                setFeedbackSection(section);
                setShowFeedbackModal(true);
              }}
            />
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => handleDownloadReport('json')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download as JSON
            </button>
            <button
              onClick={() => handleDownloadReport('csv')}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download as CSV
            </button>
          </div>
          <button
            onClick={() => {
              setFeedbackSection('overall');
              setShowFeedbackModal(true);
            }}
            className="mt-4 text-blue-600 hover:underline block text-center"
          >
            Provide overall feedback on this assessment
          </button>
        </div>
        <Footer />
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <FeedbackCollection
              section={feedbackSection}
              assessmentId={currentAssessmentId || undefined}
              onClose={() => setShowFeedbackModal(false)}
            />
          </div>
        )}
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onViewHistory={handleViewHistory} />
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Your Assessment History
          </h1>
          <ProgressTracker assessments={assessmentHistory} currentScore={scoreResult?.totalScore || 0} />
          <button
            onClick={handleCloseHistory}
            className="mt-4 text-blue-600 hover:underline block text-center"
          >
            Close History
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onViewHistory={() => setShowHistory(true)} />
      
      <Hero onStartAssessment={handleStartAssessment} />
      
      {/* Add Trust Signals section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TrustSignals />
      </div>
      
      <Footer />
    </div>
  );
}
