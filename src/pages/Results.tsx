import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ArrowLeft, Download, Share2, Target, TrendingUp, FileText } from 'lucide-react';
import { AssessmentData } from '@/pages/Index';
import { ScoreResult } from '@/utils/scoreCalculator';
import { getInvestmentReadinessLevel } from '@/utils/dynamicScoreCalculator';
import { exportToPDF, PDFExportData } from '@/utils/pdfExport';
import { shareResults } from '@/utils/shareUtils';
import { useToast } from '@/hooks/use-toast';
import { EnhancedShareDialog } from '@/components/EnhancedShareDialog';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    // Get data from navigation state
    if (location.state && location.state.assessmentData && location.state.scoreResult) {
      setAssessmentData(location.state.assessmentData);
      setScoreResult(location.state.scoreResult);
    } else {
      // Redirect back to home if no data
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleExportPDF = async () => {
    if (!assessmentData || !scoreResult) return;
    
    try {
      setExportingPDF(true);
      
      const pdfData: PDFExportData = {
        assessmentData,
        scoreResult,
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

  const handleShare = async () => {
    if (!scoreResult) return;
    
    try {
      const shared = await shareResults(scoreResult);
      if (shared) {
        toast({
          title: "Shared successfully!",
          description: "Your results have been shared.",
        });
      } else {
        toast({
          title: "Copied to clipboard!",
          description: "Share text has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Error sharing",
        description: "Unable to share your results. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!assessmentData || !scoreResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const readinessLevel = getInvestmentReadinessLevel(scoreResult.totalScore);

  const categories = [
    {
      name: 'Business Idea',
      score: scoreResult.businessIdea,
      explanation: scoreResult.businessIdeaExplanation,
      weight: '30%',
      color: 'bg-blue-500'
    },
    {
      name: 'Financials',
      score: scoreResult.financials,
      explanation: scoreResult.financialsExplanation,
      weight: '25%',
      color: 'bg-green-500'
    },
    {
      name: 'Team',
      score: scoreResult.team,
      explanation: scoreResult.teamExplanation,
      weight: '25%',
      color: 'bg-purple-500'
    },
    {
      name: 'Traction',
      score: scoreResult.traction,
      explanation: scoreResult.tractionExplanation,
      weight: '20%',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Assessment</span>
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={exportingPDF}
              >
                <FileText className="h-4 w-4 mr-2" />
                {exportingPDF ? 'Generating...' : 'Export PDF'}
              </Button>
              <EnhancedShareDialog scoreResult={scoreResult} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investment Readiness Score</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your responses, here's how your startup performs across key investment criteria
          </p>
        </div>

        {/* Main Score Card */}
        <Card className={`p-8 mb-8 ${readinessLevel.bgColor}`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center">
              <ScoreGauge score={scoreResult.totalScore} maxScore={999} title="Overall Score" />
            </div>
            <div>
              <Badge className={`${readinessLevel.color} bg-opacity-10 text-lg px-4 py-2 mb-4`}>
                {readinessLevel.level}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Readiness Assessment</h2>
              <p className="text-gray-600 mb-6">{readinessLevel.description}</p>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Recommended Next Steps:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {readinessLevel.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
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
              <FileText className="h-4 w-4" />
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
                    <Badge variant="outline" className="text-xs mb-2">{category.weight}</Badge>
                    <p className="text-gray-600 text-sm">{category.explanation}</p>
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Priority Improvements</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {categories
                      .filter(cat => cat.score < 70)
                      .map((cat, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>Improve {cat.name.toLowerCase()} - Currently at {cat.score}/100</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Strengths to Leverage</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {categories
                      .filter(cat => cat.score >= 70)
                      .map((cat, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{cat.name} is strong at {cat.score}/100</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Summary</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Responses</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Prototype:</span>
                        <span className={assessmentData.prototype ? 'text-green-600' : 'text-red-600'}>
                          {assessmentData.prototype ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className={assessmentData.revenue ? 'text-green-600' : 'text-red-600'}>
                          {assessmentData.revenue ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Full-time Team:</span>
                        <span className={assessmentData.fullTimeTeam ? 'text-green-600' : 'text-red-600'}>
                          {assessmentData.fullTimeTeam ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Term Sheets:</span>
                        <span className={assessmentData.termSheets ? 'text-green-600' : 'text-red-600'}>
                          {assessmentData.termSheets ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Score Distribution</h4>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <div key={cat.name} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded ${cat.color}`}></div>
                          <span className="text-sm flex-1">{cat.name}</span>
                          <span className="text-sm font-medium">{cat.score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
