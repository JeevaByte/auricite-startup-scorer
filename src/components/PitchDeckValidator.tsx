
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, BarChart3, MessageSquare, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface PitchDeckAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
    status: 'excellent' | 'good' | 'needs-improvement' | 'missing';
  }[];
  suggestions: string[];
  investorQuestions: string[];
  competitorComparison: {
    strengths: string[];
    weaknesses: string[];
  };
}

export const PitchDeckValidator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PitchDeckAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!validTypes.includes(uploadedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or PowerPoint file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (uploadedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(uploadedFile);
      toast({
        title: "File Uploaded",
        description: `${uploadedFile.name} is ready for analysis.`,
      });
    }
  };

  const analyzePitchDeck = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis (in real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis results
      const mockAnalysis: PitchDeckAnalysis = {
        overallScore: 78,
        sections: [
          { name: 'Problem Statement', score: 85, feedback: 'Clear and compelling problem definition with good market sizing.', status: 'excellent' },
          { name: 'Solution', score: 80, feedback: 'Strong solution with clear differentiation, but could benefit from more visual demonstrations.', status: 'good' },
          { name: 'Market Opportunity', score: 70, feedback: 'Good market analysis, but TAM calculations need more detail.', status: 'good' },
          { name: 'Business Model', score: 65, feedback: 'Revenue model is clear but pricing strategy needs strengthening.', status: 'needs-improvement' },
          { name: 'Traction', score: 90, feedback: 'Excellent traction metrics with clear growth trajectory.', status: 'excellent' },
          { name: 'Team', score: 75, feedback: 'Strong founding team, but advisor section could be enhanced.', status: 'good' },
          { name: 'Financials', score: 60, feedback: 'Financial projections are present but assumptions need clarification.', status: 'needs-improvement' },
          { name: 'Funding Ask', score: 85, feedback: 'Clear funding ask with good use of funds breakdown.', status: 'excellent' },
          { name: 'Competition', score: 0, feedback: 'Competitive analysis section is missing entirely.', status: 'missing' }
        ],
        suggestions: [
          'Add a competitive landscape slide with positioning map',
          'Include more detailed financial assumptions and unit economics',
          'Strengthen the go-to-market strategy section',
          'Add customer testimonials or case studies',
          'Include a clear timeline and milestones roadmap'
        ],
        investorQuestions: [
          'What is your customer acquisition cost and lifetime value?',
          'How do you plan to scale beyond your current market?',
          'What are the key risks and how will you mitigate them?',
          'How is this different from [specific competitor]?',
          'What would you do if a tech giant entered your space?'
        ],
        competitorComparison: {
          strengths: ['Strong traction metrics', 'Clear problem-solution fit', 'Experienced team'],
          weaknesses: ['Missing competitive analysis', 'Weak financial projections', 'Unclear pricing strategy']
        }
      };

      setAnalysis(mockAnalysis);
      
      toast({
        title: "Analysis Complete",
        description: `Your pitch deck scored ${mockAnalysis.overallScore}/100`,
      });
      
    } catch (error) {
      console.error('Error analyzing pitch deck:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze your pitch deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>AI Pitch Deck Validator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Pitch Deck</h3>
              <p className="text-gray-600 mb-4">
                Supported formats: PDF, PowerPoint (.ppt, .pptx) - Max 10MB
              </p>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                id="pitch-deck-upload"
              />
              <label htmlFor="pitch-deck-upload">
                <Button className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={analyzePitchDeck}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <BarChart3 className="h-4 w-4 animate-pulse" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      <span>Analyze Deck</span>
                    </>
                  )}
                </Button>
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-gray-600 text-center">
                    AI is analyzing your pitch deck structure, content, and investor appeal...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analysis Results</CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{analysis.overallScore}/100</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sections" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sections">Sections</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="questions">Q&A Prep</TabsTrigger>
                <TabsTrigger value="competitive">Competitive</TabsTrigger>
              </TabsList>

              <TabsContent value="sections" className="space-y-4">
                {analysis.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(section.status)}
                        <h3 className="font-medium">{section.name}</h3>
                        <Badge className={getStatusColor(section.status)}>
                          {section.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-lg font-semibold">{section.score}/100</div>
                    </div>
                    <Progress value={section.score} className="mb-2" />
                    <p className="text-sm text-gray-600">{section.feedback}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-3">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700">{suggestion}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="questions" className="space-y-3">
                <h3 className="font-medium mb-3">Potential Investor Questions</h3>
                {analysis.investorQuestions.map((question, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-orange-400 bg-orange-50">
                    <MessageSquare className="h-4 w-4 text-orange-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="competitive" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-green-800">Strengths</h3>
                    {analysis.competitorComparison.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-medium text-red-800">Areas to Address</h3>
                    {analysis.competitorComparison.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
