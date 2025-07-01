import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScoreResult, AssessmentData } from '@/pages/Index';
import { RecommendationsDisplay } from './RecommendationsDisplay';
import { DownloadDialog } from './DownloadDialog';
import { ShareDialog } from './ShareDialog';
import BadgeDisplay from './BadgeDisplay';
import { ScoreGauge } from './ScoreGauge';
import { generateRecommendations, RecommendationsData } from '@/utils/recommendationsService';
import { getInvestorReadinessLevel } from '@/utils/enhancedScoreCalculator';
import { exportToPDF, PDFExportData } from '@/utils/pdfExport';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Target, TrendingUp, Download, Share2, ExternalLink, FileText } from 'lucide-react';

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
      
      const pdfData: PDFExportData = {
        assessmentData,
        scoreResult: result,
        userProfile: user ? {
          email: user.email || undefined,
          name: user.user_metadata?.full_name || undefined
        } : undefined,
        generatedAt: new Date().toISOString()
      };
      
      await exportToPDF(pdfData);
      
      toast({
        title: 'PDF Export Successful',
        description: 'Your assessment report has been prepared for download.',
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
      color: 'bg-blue-500'
    },
    {
      name: 'Financials',
      score: result.financials,
      explanation: result.financialsExplanation,
      weight: '25%',
      color: 'bg-green-500'
    },
    {
      name: 'Team',
      score: result.team,
      explanation: result.teamExplanation,
      weight: '25%',
      color: 'bg-purple-500'
    },
    {
      name: 'Traction',
      score: result.traction,
      explanation: result.tractionExplanation,
      weight: '20%',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investment Readiness Score</h1>
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
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Investor Insights</span>
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

        <TabsContent value="insights">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Angels Look For</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Strong Signals ✅</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {result.businessIdea >= 70 && <li>• Clear market opportunity</li>}
                    {result.financials >= 70 && <li>• Solid financial foundation</li>}
                    {result.team >= 70 && <li>• Committed team</li>}
                    {result.traction >= 70 && <li>• Market validation</li>}
                    {result.totalScore >= 600 && <li>• Investment-ready fundamentals</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Improvement Areas 🎯</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {result.businessIdea < 70 && <li>• Strengthen business model</li>}
                    {result.financials < 70 && <li>• Improve financial metrics</li>}
                    {result.team < 70 && <li>• Build stronger team</li>}
                    {result.traction < 70 && <li>• Increase market traction</li>}
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-medium mb-1">Improve Score</h4>
                  <p className="text-sm text-gray-600">Focus on your lowest scoring areas first</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🤝</div>
                  <h4 className="font-medium mb-1">Network</h4>
                  <p className="text-sm text-gray-600">Connect with angels in your industry</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <h4 className="font-medium mb-1">Track Progress</h4>
                  <p className="text-sm text-gray-600">Retake assessment monthly</p>
                </div>
              </div>
            </Card>
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
          <span>{exportingPDF ? 'Generating...' : 'Download PDF'}</span>
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
