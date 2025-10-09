import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScoreResult, AssessmentData } from '@/utils/scoreCalculator';
import { RecommendationsDisplay } from './RecommendationsDisplay';
import { DownloadDialog } from './DownloadDialog';
import { ShareDialog } from './ShareDialog';
import BadgeDisplay from './BadgeDisplay';
import { ScoreGauge } from './ScoreGauge';
import { RadarVisualization } from './RadarVisualization';
import { VersionComparison } from './VersionComparison';
import { EnhancedBenchmarkComparison } from './EnhancedBenchmarkComparison';
import { OpenVCIntegration } from './OpenVCIntegration';
import { generateRecommendations, RecommendationsData } from '@/utils/recommendationsService';
import { getInvestorReadinessLevel } from '@/utils/enhancedScoreCalculator';
import { generatePDFReport, PDFReportData } from '@/utils/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Target, TrendingUp, Download, Share2, ExternalLink, FileText, AlertCircle, CheckCircle, XCircle, BarChart3, Users } from 'lucide-react';

interface ScoreDisplayProps {
  result: ScoreResult;
  assessmentData: AssessmentData;
  onRestart: () => void;
  badges: { name: string; explanation: string }[];
  engagementMessage: string;
}

export const EnhancedScoreDisplay = ({ result, assessmentData, onRestart, badges, engagementMessage }: ScoreDisplayProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const recs = await generateRecommendations(assessmentData, result);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [assessmentData, result]);

  const readiness = getInvestorReadinessLevel(result.totalScore);

  const handlePDFExport = async () => {
    try {
      setExportingPDF(true);
      
      const pdfData: PDFReportData = {
        assessmentData,
        scoreResult: result,
        recommendations,
        userProfile: user ? {
          email: user.email || undefined,
          name: user.user_metadata?.full_name || undefined,
          company: user.user_metadata?.company_name || undefined
        } : undefined,
        generatedAt: new Date().toISOString(),
        includeDetailedAnalysis: true,
        includeScoreBreakdown: true,
        includeRecommendations: true
      };
      
      await generatePDFReport(pdfData);
      
      toast({
        title: 'Comprehensive PDF Report Generated!',
        description: 'Your complete investment readiness report with recommendations and detailed analysis has been downloaded.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/lovable-uploads/943f5c79-8478-43b5-95c9-18f53c2aed77.png" alt="Investment Logo" className="h-12 w-12" loading="lazy" />
          <h1 className="text-3xl font-bold text-gray-900">Investment Readiness Score Card</h1>
        </div>
        <p className="text-lg text-gray-600">Here's how your startup scored across key investment criteria</p>
      </div>

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
            
            {result.totalScore >= 700 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Ready for Angel Investors</span>
                </div>
                <p className="text-green-700 text-sm">Your startup demonstrates strong fundamentals that angel investors look for. Consider reaching out to our network.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visualization</span>
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Benchmarks</span>
          </TabsTrigger>
          <TabsTrigger value="improvement" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Improvement</span>
          </TabsTrigger>
          <TabsTrigger value="investors" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Investors</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Badge Display */}
            <BadgeDisplay badges={badges} engagementMessage={engagementMessage} />

            {/* Category Score Gauges */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'Business Idea', score: result.businessIdea, explanation: result.businessIdeaExplanation },
                { name: 'Financials', score: result.financials, explanation: result.financialsExplanation },
                { name: 'Team', score: result.team, explanation: result.teamExplanation },
                { name: 'Traction', score: result.traction, explanation: result.tractionExplanation }
              ].map((category) => (
                <Card key={category.name} className="p-6 text-center">
                  <ScoreGauge score={category.score} maxScore={100} title={category.name} size="small" />
                  <div className="mt-4">
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{category.explanation}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visualization" className="mt-6">
          <div className="space-y-6">
            <RadarVisualization 
              scoreResult={result}
              showBenchmark={true}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recommendations ? (
                  <RecommendationsDisplay 
                    recommendations={recommendations} 
                    scores={{
                      businessIdea: result.businessIdea,
                      financials: result.financials,
                      team: result.team,
                      traction: result.traction,
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">Unable to generate recommendations at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-6">
          <EnhancedBenchmarkComparison 
            assessmentData={assessmentData}
            scoreResult={result}
          />
        </TabsContent>

        <TabsContent value="improvement" className="mt-6">
          <VersionComparison />
        </TabsContent>

        <TabsContent value="investors" className="mt-6">
          <OpenVCIntegration 
            assessmentData={assessmentData}
            scoreResult={result}
          />
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <div className="space-y-6">
            <BadgeDisplay badges={badges} engagementMessage={engagementMessage} />
            <ShareDialog 
              scoreResult={result} 
            />
            <DownloadDialog 
              scoreResult={result}
              assessmentData={assessmentData}
              recommendations={recommendations || undefined}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          onClick={onRestart}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Take Again</span>
        </Button>
        
        <Button
          onClick={handlePDFExport}
          disabled={exportingPDF}
          className="flex items-center space-x-2"
        >
          <FileText className="h-4 w-4" />
          <span>{exportingPDF ? 'Generating...' : 'Download Comprehensive PDF'}</span>
        </Button>
      </div>
    </div>
  );
};