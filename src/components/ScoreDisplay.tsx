import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
import { generateRecommendations, RecommendationsData } from '@/utils/recommendationsService';
import { getInvestorReadinessLevel } from '@/utils/enhancedScoreCalculator';
import { generatePDFReport, PDFReportData } from '@/utils/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Target, TrendingUp, Download, Share2, ExternalLink, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ScoreDisplayProps {
  result: ScoreResult;
  assessmentData: AssessmentData;
  onRestart: () => void;
  badges: { name: string; explanation: string }[];
  engagementMessage: string;
}

export const ScoreDisplay = ({ result, assessmentData, onRestart, badges, engagementMessage }: ScoreDisplayProps) => {
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

  const categories = [
    {
      name: 'Business Idea',
      score: result.businessIdea,
      explanation: result.businessIdeaExplanation,
      weight: '30%',
      color: 'bg-blue-500',
      detailBreakdown: getBusinessIdeaBreakdown(assessmentData)
    },
    {
      name: 'Financials',
      score: result.financials,
      explanation: result.financialsExplanation,
      weight: '25%',
      color: 'bg-green-500',
      detailBreakdown: getFinancialBreakdown(assessmentData)
    },
    {
      name: 'Team',
      score: result.team,
      explanation: result.teamExplanation,
      weight: '25%',
      color: 'bg-purple-500',
      detailBreakdown: getTeamBreakdown(assessmentData)
    },
    {
      name: 'Traction',
      score: result.traction,
      explanation: result.tractionExplanation,
      weight: '20%',
      color: 'bg-orange-500',
      detailBreakdown: getTractionBreakdown(assessmentData)
    }
  ];

  function getBusinessIdeaBreakdown(data: AssessmentData) {
    return [
      { 
        factor: 'Prototype Development', 
        status: data.prototype ? 'Complete' : 'Missing',
        impact: data.prototype ? 'High' : 'High',
        points: data.prototype ? 60 : 20
      },
      { 
        factor: 'Milestone Achievement', 
        status: data.milestones === 'concept' ? 'Early Stage' : 
                data.milestones === 'launch' ? 'MVP Launched' :
                data.milestones === 'scale' ? 'Scaling' : 'Exit Ready',
        impact: 'Medium',
        points: data.milestones === 'concept' ? 10 : 
                data.milestones === 'launch' ? 30 :
                data.milestones === 'scale' ? 40 : 35
      }
    ];
  }

  function getFinancialBreakdown(data: AssessmentData) {
    return [
      { 
        factor: 'Revenue Generation', 
        status: data.revenue ? 'Generating Revenue' : 'Pre-Revenue',
        impact: 'High',
        points: data.revenue ? 40 : 15
      },
      { 
        factor: 'Monthly Recurring Revenue', 
        status: data.mrr === 'none' ? 'No MRR' :
                data.mrr === 'low' ? 'Low MRR' :
                data.mrr === 'medium' ? 'Medium MRR' : 'High MRR',
        impact: 'High',
        points: data.mrr === 'none' ? 10 :
                data.mrr === 'low' ? 25 :
                data.mrr === 'medium' ? 35 : 45
      },
      { 
        factor: 'Cap Table', 
        status: data.capTable ? 'Documented' : 'Missing',
        impact: 'Medium',
        points: data.capTable ? 20 : 0
      },
      { 
        factor: 'External Capital', 
        status: data.externalCapital ? 'Raised' : 'Not Raised',
        impact: 'Medium',
        points: data.externalCapital ? 15 : 0
      }
    ];
  }

  function getTeamBreakdown(data: AssessmentData) {
    return [
      { 
        factor: 'Team Commitment', 
        status: data.fullTimeTeam ? 'Full-Time' : 'Part-Time',
        impact: 'High',
        points: data.fullTimeTeam ? 60 : 25
      },
      { 
        factor: 'Team Size', 
        status: data.employees === '1-2' ? 'Founding Team' :
                data.employees === '3-10' ? 'Small Team' :
                data.employees === '11-50' ? 'Medium Team' : 'Large Team',
        impact: 'Medium',
        points: data.employees === '1-2' ? 15 :
                data.employees === '3-10' ? 35 :
                data.employees === '11-50' ? 40 : 30
      }
    ];
  }

  function getTractionBreakdown(data: AssessmentData) {
    return [
      { 
        factor: 'Term Sheets', 
        status: data.termSheets ? 'Received' : 'None',
        impact: 'High',
        points: data.termSheets ? 50 : 20
      },
      { 
        factor: 'Investor Interest', 
        status: data.investors === 'none' ? 'No Interest' :
                data.investors === 'angels' ? 'Angel Interest' :
                data.investors === 'vc' ? 'VC Interest' : 'Late Stage Interest',
        impact: 'High',
        points: data.investors === 'none' ? 10 :
                data.investors === 'angels' ? 30 :
                data.investors === 'vc' ? 40 : 35
      }
    ];
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/lovable-uploads/943f5c79-8478-43b5-95c9-18f53c2aed77.png" alt="Investment Logo" className="h-12 w-12" />
          <h1 className="text-3xl font-bold text-gray-900">Investment Readiness Score Card</h1>
        </div>
        <p className="text-lg text-gray-600">Here's how your startup scored across key investment criteria</p>
      </div>

      {/* Badge Display */}
      <BadgeDisplay badges={badges} engagementMessage={engagementMessage} />

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
            {categories.map((category) => (
              <Card key={category.name} className="p-6 text-center">
                <ScoreGauge score={category.score} maxScore={100} title={category.name} size="small" />
                <div className="mt-4">
                  <Badge variant="outline" className="text-xs">{category.weight}</Badge>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{category.explanation}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Category Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="p-6">
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
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          {loadingRecommendations ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Generating personalized recommendations...</span>
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
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to generate recommendations at this time.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {categories.map((category) => (
            <Card key={category.name} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name} - Detailed Breakdown</h3>
              <div className="space-y-4">
                {category.detailBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                  </div>
                ))}
              </div>
            </Card>
          ))}
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
        
        <DownloadDialog 
          scoreResult={result}
          assessmentData={assessmentData}
          recommendations={recommendations || undefined}
        />
        
        <ShareDialog scoreResult={result} />
      </div>
    </div>
  );
};
