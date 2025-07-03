import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { AssessmentForm } from '@/components/AssessmentForm';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { RecommendationsDisplay } from '@/components/RecommendationsDisplay';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareButtons } from '@/components/ShareButtons';
import { AssessmentHistory } from '@/components/AssessmentHistory';
import { assignBadges } from '@/utils/database';
import { checkCachedResponse, cacheResponse, saveAssessment, saveScore } from '@/utils/database';
import { generateRecommendations } from '@/utils/recommendationsService';
import { AssessmentData } from './Index';
import { ScoreResult } from '@/utils/scoreCalculator';
import { Badge } from '@/utils/database';
import { calculateEnhancedScore } from '@/utils/enhancedScoreCalculator';
import { generateBenchmarking } from '@/utils/benchmarkingService';
import { BenchmarkDisplay } from '@/components/BenchmarkDisplay';

export interface AssessmentData {
  prototype?: boolean | null;
  externalCapital?: boolean | null;
  revenue?: boolean | null;
  fullTimeTeam?: boolean | null;
  termSheets?: boolean | null;
  capTable?: boolean | null;
  mrr?: string | null;
  employees?: string | null;
  fundingGoal?: string | null;
  investors?: string | null;
  milestones?: string | null;
}

interface BenchmarkingData {
  business_idea_percentile: number;
  financials_percentile: number;
  team_percentile: number;
  traction_percentile: number;
  total_percentile: number;
  sector: string;
  stage: string;
  cluster_id: number;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({});
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkingData | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep === 4 && !scoreResult) {
      setCurrentStep(1);
    }
  }, [currentStep, scoreResult]);

  const updateAssessmentData = (data: AssessmentData) => {
    setAssessmentData(prevData => ({ ...prevData, ...data }));
  };

  const handleSubmit = async (data: AssessmentData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your assessment.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Assessment data:', data);
      
      // Check cache first
      const cachedResult = await checkCachedResponse(data);
      if (cachedResult) {
        console.log('Using cached result:', cachedResult);
        setScoreResult(cachedResult);
        
        // Generate benchmarking for cached results too
        try {
          const benchmarking = await generateBenchmarking('cached', data, cachedResult);
          if (benchmarking) {
            setBenchmarkData(benchmarking);
          }
        } catch (error) {
          console.error('Benchmarking generation failed:', error);
        }
        
        setCurrentStep(4);
        setIsLoading(false);
        return;
      }

      // Use enhanced scoring algorithm
      const score = calculateEnhancedScore(data);
      console.log('Calculated score:', score);
      
      setScoreResult(score);

      // Save assessment and get ID
      const assessmentId = await saveAssessment(data);
      console.log('Assessment saved with ID:', assessmentId);

      // Save score
      await saveScore(assessmentId, score);
      console.log('Score saved');

      // Generate and save benchmarking data
      try {
        const benchmarking = await generateBenchmarking(assessmentId, data, score);
        if (benchmarking) {
          setBenchmarkData(benchmarking);
          console.log('Benchmarking generated:', benchmarking);
        }
      } catch (error) {
        console.error('Benchmarking generation failed:', error);
      }

      // Generate recommendations
      try {
        const recommendations = await generateRecommendations(data, score);
        setRecommendations(recommendations);
        console.log('Recommendations generated:', recommendations);
      } catch (error) {
        console.error('Recommendations generation failed:', error);
        setRecommendations({
          businessIdea: ['Focus on validating your business concept with potential customers'],
          financials: ['Develop a comprehensive financial model and funding strategy'],
          team: ['Strengthen your team with complementary skills and experience'],
          traction: ['Build measurable traction through customer acquisition and engagement']
        });
      }

      // Generate badges
      try {
        const badgeData = await assignBadges(data, score);
        setBadges(badgeData?.badges || []);
        console.log('Badges assigned:', badgeData?.badges);
      } catch (error) {
        console.error('Badge assignment failed:', error);
        setBadges([]);
      }

      // Cache the response
      await cacheResponse(data, score);

      setCurrentStep(4);
      
      toast({
        title: "Assessment Complete!",
        description: "Your startup readiness score has been calculated with peer benchmarking.",
      });

    } catch (error) {
      console.error('Assessment submission failed:', error);
      toast({
        title: "Error",
        description: "Failed to process your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = () => {
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Dialog open={showDownloadDialog} onOpenChange={() => setShowDownloadDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Options</DialogTitle>
          </DialogHeader>
          <p>Choose your preferred download format:</p>
          {/* Add download options here */}
          <Button onClick={() => setShowDownloadDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={() => setShowShareDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Results</DialogTitle>
          </DialogHeader>
          <ShareButtons />
          <Button onClick={() => setShowShareDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      <AssessmentHistory isOpen={showHistory} onClose={closeHistory} />

      <h1 className="text-3xl font-bold text-center mb-8">
        Startup Investment Readiness Assessment
      </h1>

      {currentStep === 1 && (
        <AssessmentForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          updateAssessmentData={updateAssessmentData}
        />
      )}

      {currentStep === 4 && scoreResult && (
          <div className="space-y-8">
            <ScoreDisplay 
              scoreResult={scoreResult} 
              badges={badges}
              onDownload={() => setShowDownloadDialog(true)}
              onShare={() => setShowShareDialog(true)}
            />
            
            {benchmarkData && (
              <BenchmarkDisplay percentiles={benchmarkData} />
            )}
            
            {recommendations && (
              <RecommendationsDisplay recommendations={recommendations} />
            )}
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setAssessmentData({});
                  setScoreResult(null);
                  setRecommendations(null);
                  setBadges([]);
                  setBenchmarkData(null);
                }}
                variant="outline"
              >
                Start New Assessment
              </Button>
              <Button onClick={() => setShowHistory(true)}>
                View History
              </Button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Index;
