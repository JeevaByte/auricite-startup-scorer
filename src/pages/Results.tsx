import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecommendationsDisplay } from '@/components/RecommendationsDisplay';
import { ScoreGauge } from '@/components/ScoreGauge';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { generateRecommendations, RecommendationsData } from '@/utils/recommendationsService';
import { getInvestorReadinessLevel } from '@/utils/enhancedScoreCalculator';
import { shareResults } from '@/utils/shareUtils';
import { generateReportData, downloadAsJSON } from '@/utils/reportGenerator';
import { EnhancedShareButtons } from '@/components/EnhancedShareButtons';
import { DownloadDialog } from '@/components/DownloadDialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ScoreFeedback } from '@/components/ScoreFeedback';
import { EnhancedClustering } from '@/components/EnhancedClustering';
import { RotateCcw, Target, TrendingUp, Download, Share2, ExternalLink, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import scoringRules from '../../supabase/functions/score-assessment/scoring_rules.v0.1.0.json';
import type { ScoreBreakdown } from '../../shared/types';
interface ResultsProps {
  // Define any props you expect to receive here
}
const Results: React.FC<ResultsProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [result, setScoreResult] = useState<ScoreResult | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [assessmentType, setAssessmentType] = useState<'simple' | 'comprehensive' | null>(null);
  useEffect(() => {
    // Extract data passed via React Router's location.state
    console.log('Results page - location.state:', location.state);
    if (location.state) {
      // Handle both new format (result) and legacy format (scoreResult)
      const scoreResult = location.state.result || location.state.scoreResult;
      const assessmentData = location.state.assessmentData;
      const assessmentType = location.state.assessmentType;
      console.log('Results page - scoreResult:', scoreResult);
      console.log('Results page - assessmentData:', assessmentData);
      console.log('Results page - assessmentType:', assessmentType);
      if (scoreResult && assessmentData) {
        // Validate that we have proper assessment data (not AI content analysis)
        if (scoreResult.totalScore !== undefined && scoreResult.businessIdea !== undefined) {
          setScoreResult(scoreResult);
          setAssessmentData(assessmentData);
          setAssessmentType(assessmentType || 'simple');
          // Clear sessionStorage since we have the data
          sessionStorage.removeItem('assessmentResult');
          return;
        } else {
          console.log('Results page - Invalid score data format, redirecting to assessment');
          navigate('/assessment');
          return;
        }
      }
    }

    // Fallback to sessionStorage if location.state is missing or incomplete
    console.log('Results page - Checking sessionStorage for data');
    const storedData = sessionStorage.getItem('assessmentResult');
    console.log('Results page - Raw sessionStorage data:', storedData);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('Results page - Parsed sessionStorage data:', parsedData);
        const {
          result,
          assessmentData,
          assessmentType
        } = parsedData;
        console.log('Results page - Extracted data:', {
          result,
          assessmentData,
          assessmentType
        });
        if (result && assessmentData && result.totalScore !== undefined && result.businessIdea !== undefined) {
          setScoreResult(result);
          setAssessmentData(assessmentData);
          setAssessmentType(assessmentType || 'simple');
          // Clear sessionStorage after successful retrieval
          sessionStorage.removeItem('assessmentResult');
          return;
        } else {
          console.log('Results page - Invalid stored data format');
        }
      } catch (error) {
        console.error('Error parsing stored assessment data:', error);
        sessionStorage.removeItem('assessmentResult');
      }
    }
    console.log('Results page - No valid data found, redirecting to assessment');
    navigate('/assessment');
  }, [location, navigate]);
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (assessmentData && result) {
        try {
          setLoadingRecommendations(true);
          const recs = await generateRecommendations(assessmentData, result);
          setRecommendations(recs);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
        } finally {
          setLoadingRecommendations(false);
        }
      }
    };
    fetchRecommendations();
  }, [assessmentData, result]);
  if (!result || !assessmentData) {
    return <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Assessment Data Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <p>It appears you've accessed this page directly without completing the assessment.</p>
            <Button asChild>
              <a href="/">Return to Assessment</a>
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  const readiness = getInvestorReadinessLevel(result.totalScore);
  const scoreBreakdown: ScoreBreakdown = {
    ruleset_version: (scoringRules as any).version,
    subscores: {
      team: result.team,
      market: 0,
      traction: result.traction,
      moat: 0,
      financials: result.financials,
      risk: 0
    },
    weighted_total: Math.min(100, Math.max(0, Math.round(result.totalScore / 9.99))),
    recommendations: []
  };
  const categories = [{
    name: 'Business Idea',
    score: result.businessIdea,
    explanation: result.businessIdeaExplanation,
    weight: '30%',
    color: 'bg-blue-500',
    detailBreakdown: getBusinessIdeaBreakdown(assessmentData)
  }, {
    name: 'Financials',
    score: result.financials,
    explanation: result.financialsExplanation,
    weight: '25%',
    color: 'bg-green-500',
    detailBreakdown: getFinancialBreakdown(assessmentData)
  }, {
    name: 'Team',
    score: result.team,
    explanation: result.teamExplanation,
    weight: '25%',
    color: 'bg-purple-500',
    detailBreakdown: getTeamBreakdown(assessmentData)
  }, {
    name: 'Traction',
    score: result.traction,
    explanation: result.tractionExplanation,
    weight: '20%',
    color: 'bg-orange-500',
    detailBreakdown: getTractionBreakdown(assessmentData)
  }];
  function getBusinessIdeaBreakdown(data: AssessmentData) {
    return [{
      factor: 'Prototype Development',
      status: data.prototype ? 'Complete' : 'Missing',
      impact: data.prototype ? 'High' : 'High',
      points: data.prototype ? 60 : 20
    }, {
      factor: 'Milestone Achievement',
      status: data.milestones === 'concept' ? 'Early Stage' : data.milestones === 'launch' ? 'MVP Launched' : data.milestones === 'scale' ? 'Scaling' : 'Exit Ready',
      impact: 'Medium',
      points: data.milestones === 'concept' ? 10 : data.milestones === 'launch' ? 30 : data.milestones === 'scale' ? 40 : 35
    }];
  }
  function getFinancialBreakdown(data: AssessmentData) {
    return [{
      factor: 'Revenue Generation',
      status: data.revenue ? 'Generating Revenue' : 'Pre-Revenue',
      impact: 'High',
      points: data.revenue ? 40 : 15
    }, {
      factor: 'Monthly Recurring Revenue',
      status: data.mrr === 'none' ? 'No MRR' : data.mrr === 'low' ? 'Low MRR' : data.mrr === 'medium' ? 'Medium MRR' : 'High MRR',
      impact: 'High',
      points: data.mrr === 'none' ? 10 : data.mrr === 'low' ? 25 : data.mrr === 'medium' ? 35 : 45
    }, {
      factor: 'Cap Table',
      status: data.capTable ? 'Documented' : 'Missing',
      impact: 'Medium',
      points: data.capTable ? 20 : 0
    }, {
      factor: 'External Capital',
      status: data.externalCapital ? 'Raised' : 'Not Raised',
      impact: 'Medium',
      points: data.externalCapital ? 15 : 0
    }];
  }
  function getTeamBreakdown(data: AssessmentData) {
    return [{
      factor: 'Team Commitment',
      status: data.fullTimeTeam ? 'Full-Time' : 'Part-Time',
      impact: 'High',
      points: data.fullTimeTeam ? 60 : 25
    }, {
      factor: 'Team Size',
      status: data.employees === '1-2' ? 'Founding Team' : data.employees === '3-10' ? 'Small Team' : data.employees === '11-50' ? 'Medium Team' : 'Large Team',
      impact: 'Medium',
      points: data.employees === '1-2' ? 15 : data.employees === '3-10' ? 35 : data.employees === '11-50' ? 40 : 30
    }];
  }
  function getTractionBreakdown(data: AssessmentData) {
    return [{
      factor: 'Term Sheets',
      status: data.termSheets ? 'Received' : 'None',
      impact: 'High',
      points: data.termSheets ? 50 : 20
    }, {
      factor: 'Investor Interest',
      status: data.investors === 'none' ? 'No Interest' : data.investors === 'angels' ? 'Angel Interest' : data.investors === 'vc' ? 'VC Interest' : 'Late Stage Interest',
      impact: 'High',
      points: data.investors === 'none' ? 10 : data.investors === 'angels' ? 30 : data.investors === 'vc' ? 40 : 35
    }];
  }
  const getStatusIcon = (status: string) => {
    if (status.includes('Complete') || status.includes('Full-Time') || status.includes('Generating') || status.includes('Received')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status.includes('Missing') || status.includes('None') || status.includes('No ')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };
  const handleTakeAgain = () => {
    navigate('/');
  };
  const handleDownloadReport = async () => {
    if (!result || !assessmentData) return;
    try {
      const { generatePDFReport } = await import('../utils/pdfGenerator');
      await generatePDFReport({
        assessmentData,
        scoreResult: result,
        recommendations,
        userProfile: {
          name: user?.user_metadata?.full_name,
          email: user?.email,
          company: user?.user_metadata?.company_name
        },
        generatedAt: new Date().toISOString(),
        includeDetailedAnalysis: true,
        includeScoreBreakdown: true,
        includeRecommendations: true
      });
      
      toast({
        title: "Report Downloaded",
        description: "Your comprehensive investment readiness report with detailed analysis has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleShare = async () => {
    if (!result) return;
    try {
      const wasNativeShare = await shareResults(result);
      if (!wasNativeShare) {
        toast({
          title: "Copied to Clipboard",
          description: "Your results have been copied to the clipboard."
        });
      }
    } catch (error) {
      console.error('Error sharing results:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share results. Please try again.",
        variant: "destructive"
      });
    }
  };
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investment Readiness Score</h1>
        <p className="text-lg text-gray-600">Here's how your startup scored across key investment criteria</p>
        <p className="text-sm text-gray-500 mt-1">Ruleset: {(scoringRules as any).version} • Weighted total: {scoreBreakdown.weighted_total}</p>
      </div>

      {/* Badge Display - To be implemented */}
      {/* <BadgeDisplay badges={badges} engagementMessage={engagementMessage} /> */}

      {/* Main Score Section */}
      <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center">
            <ScoreGauge score={result.totalScore} maxScore={999} title="Overall Score" />
          </div>
          <div>
            <div className="mb-6">
              <Badge className={`${readiness.color} bg-opacity-10 text-lg px-4 py-2`}>
                {readiness.level}
              </Badge>
              <Badge variant="outline" className="ml-2">
                {readiness.confidence} Confidence
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Readiness Assessment</h2>
            <p className="text-gray-600 mb-6">{readiness.description}</p>
            
            {result.totalScore >= 700 && <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Ready for Angel Investors</span>
                </div>
                <p className="text-green-700 text-sm">Your startup demonstrates strong fundamentals that angel investors look for. Consider reaching out to our network.</p>
              </div>}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="breakdown" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Score Breakdown</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Detailed Analysis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-6">
          {/* Category Score Gauges */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {categories.map(category => <Card key={category.name} className="p-6 text-center">
                <ScoreGauge score={category.score} maxScore={100} title={category.name} size="small" />
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs">{category.weight}</Badge>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{category.explanation}</p>
                </div>
              </Card>)}
          </div>

          {/* Detailed Category Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map(category => <Card key={category.name} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${category.color}`}></div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">({category.weight})</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {category.score}/100
                  </div>
                </div>
                <Progress value={category.score} className="mb-4" />
                <p className="text-gray-600 text-sm">{category.explanation}</p>
              </Card>)}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          {loadingRecommendations ? <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Generating personalized recommendations...</span>
            </div> : recommendations ? <RecommendationsDisplay recommendations={recommendations} scores={{
          businessIdea: result.businessIdea,
          financials: result.financials,
          team: result.team,
          traction: result.traction
        }} /> : <div className="text-center py-12">
              <p className="text-gray-600">Unable to generate recommendations at this time.</p>
            </div>}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {categories.map(category => <Card key={category.name} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name} - Detailed Breakdown</h3>
              <div className="space-y-4">
                {category.detailBreakdown.map((item, index) => <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium text-gray-900">{item.factor}</p>
                        <p className="text-sm text-gray-600">{item.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{item.points} pts</p>
                      <p className="text-xs text-gray-500">{item.impact} Impact</p>
                    </div>
                  </div>)}
              </div>
            </Card>)}
        </TabsContent>
      </Tabs>

      {/* Action Buttons - Different for Simple vs Comprehensive */}
      {assessmentType === 'simple' ? <>
          {/* Simple Assessment - Show Take Again and PDF Download */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="outline" onClick={handleTakeAgain}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Again
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF Report
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            PDF includes Score Breakdown, Recommendations, and Detailed Analysis
          </p>
        </> : <>
          {/* Comprehensive Assessment - Show only Share Section and PDF with enhanced features */}
          <div className="mt-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Results</h3>
              <p className="text-gray-600">Let others know about your startup's investment readiness</p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <EnhancedShareButtons scoreResult={result} assessmentData={assessmentData} recommendations={recommendations} userProfile={{
            name: user?.user_metadata?.full_name,
            email: user?.email
          }} />
              
              {/* Download PDF Report Button */}
              <div className="text-center">
                <Button onClick={handleDownloadReport} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Comprehensive PDF Report
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Includes Score Breakdown, Recommendations, and Detailed Analysis
                </p>
              </div>
            </div>
          </div>
        </>}

      {/* Enhanced Clustering Analysis */}
      <div className="mt-8">
        <EnhancedClustering userScore={result.totalScore} sector="Technology" fundingStage="Pre-Seed" />
      </div>

      {/* Score Feedback */}
      <div className="mt-8">
        <ScoreFeedback assessmentId={Date.now().toString()} totalScore={result.totalScore} />
      </div>
    </div>;
};
export default Results;