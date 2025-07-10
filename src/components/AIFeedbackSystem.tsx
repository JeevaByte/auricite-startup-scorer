
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Lightbulb, TrendingUp, Target, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DetailedAnalysis {
  sentiment: string;
  clarity: number;
  engagement: number;
  readability: number;
  persuasiveness: number;
  detailedMetrics: {
    wordCount: number;
    sentenceComplexity: string;
    readingLevel: string;
    keywordDensity: number;
    emotionalTone: string;
    callToActionStrength: number;
  };
  suggestions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
    implementation: string;
  }[];
  strengths: {
    area: string;
    description: string;
    score: number;
  }[];
  contentStructure: {
    introduction: number;
    bodyDevelopment: number;
    conclusion: number;
    flow: number;
  };
  competitiveAnalysis: {
    industryStandard: number;
    yourScore: number;
    percentile: number;
  };
}

export const AIFeedbackSystem = () => {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'pitch-deck' | 'business-plan' | 'marketing-copy' | 'general'>('general');
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter some content to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate advanced AI analysis with detailed feedback
    setTimeout(() => {
      const detailedAnalysis: DetailedAnalysis = {
        sentiment: 'Positive',
        clarity: 85,
        engagement: 78,
        readability: 82,
        persuasiveness: 75,
        detailedMetrics: {
          wordCount: content.split(' ').length,
          sentenceComplexity: 'Moderate',
          readingLevel: 'College Level',
          keywordDensity: 3.2,
          emotionalTone: 'Professional & Confident',
          callToActionStrength: 67
        },
        suggestions: [
          {
            category: 'Structure & Flow',
            priority: 'high',
            suggestion: 'Add a stronger opening hook to capture attention within the first 15 seconds',
            impact: 'Could increase engagement by 25-30%',
            implementation: 'Start with a compelling statistic, question, or bold statement about your market opportunity'
          },
          {
            category: 'Value Proposition',
            priority: 'high',
            suggestion: 'Quantify the benefits more specifically with concrete metrics and ROI calculations',
            impact: 'Increases credibility and investor confidence by 40%',
            implementation: 'Replace vague terms like "significant improvement" with "reduces costs by 35% or $2.5M annually"'
          },
          {
            category: 'Market Validation',
            priority: 'medium',
            suggestion: 'Include more specific customer testimonials and case studies',
            impact: 'Builds trust and demonstrates product-market fit',
            implementation: 'Add 2-3 detailed customer success stories with names, companies, and specific results'
          },
          {
            category: 'Technical Details',
            priority: 'medium',
            suggestion: 'Balance technical depth with accessibility for non-technical stakeholders',
            impact: 'Ensures all audience members can follow your presentation',
            implementation: 'Use analogies and visual aids to explain complex technical concepts'
          },
          {
            category: 'Competitive Advantage',
            priority: 'high',
            suggestion: 'Strengthen differentiation by highlighting unique moats and barriers to entry',
            impact: 'Addresses investor concerns about competitive threats',
            implementation: 'Create a detailed competitive matrix showing your unique advantages'
          },
          {
            category: 'Financial Projections',
            priority: 'low',
            suggestion: 'Provide more conservative and realistic growth assumptions',
            impact: 'Increases credibility with experienced investors',
            implementation: 'Show multiple scenarios (conservative, base case, optimistic) with clear assumptions'
          }
        ],
        strengths: [
          {
            area: 'Problem Definition',
            description: 'Clear articulation of market pain points with supporting data',
            score: 90
          },
          {
            area: 'Team Expertise',
            description: 'Strong domain knowledge and complementary skill sets presented effectively',
            score: 88
          },
          {
            area: 'Market Opportunity',
            description: 'Large addressable market with clear growth potential identified',
            score: 82
          },
          {
            area: 'Business Model',
            description: 'Coherent revenue strategy with multiple income streams',
            score: 79
          }
        ],
        contentStructure: {
          introduction: 78,
          bodyDevelopment: 85,
          conclusion: 72,
          flow: 80
        },
        competitiveAnalysis: {
          industryStandard: 65,
          yourScore: 81,
          percentile: 76
        }
      };
      
      setAnalysis(detailedAnalysis);
      setIsAnalyzing(false);
      toast({
        title: 'Advanced Analysis Complete',
        description: 'Your content has been analyzed with detailed insights and recommendations.',
      });
    }, 2500);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      case 'low':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Advanced AI Content Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Content Type (helps provide more targeted feedback)
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'pitch-deck', label: 'Pitch Deck' },
                { id: 'business-plan', label: 'Business Plan' },
                { id: 'marketing-copy', label: 'Marketing Copy' },
                { id: 'general', label: 'General Content' }
              ].map((type) => (
                <Button
                  key={type.id}
                  variant={selectedContentType === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedContentType(type.id as any)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste your content for comprehensive AI analysis
            </label>
            <Textarea
              placeholder="Enter your content here for detailed AI analysis including sentiment, clarity, engagement, and specific improvement recommendations..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="text-xs text-gray-500 mt-1">
              {content.length} characters • Recommended: 500+ characters for detailed analysis
            </div>
          </div>
          
          <Button 
            onClick={analyzeContent} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? 'Performing Advanced Analysis...' : 'Analyze Content with AI'}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Overall Metrics Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Content Performance Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysis.clarity}%</div>
                  <div className="text-sm text-gray-600">Clarity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysis.engagement}%</div>
                  <div className="text-sm text-gray-600">Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysis.readability}%</div>
                  <div className="text-sm text-gray-600">Readability</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analysis.persuasiveness}%</div>
                  <div className="text-sm text-gray-600">Persuasiveness</div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg py-1">{analysis.sentiment}</Badge>
                  <div className="text-sm text-gray-600">Sentiment</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Content Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Word Count:</span>
                      <span className="font-medium">{analysis.detailedMetrics.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reading Level:</span>
                      <span className="font-medium">{analysis.detailedMetrics.readingLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sentence Complexity:</span>
                      <span className="font-medium">{analysis.detailedMetrics.sentenceComplexity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emotional Tone:</span>
                      <span className="font-medium">{analysis.detailedMetrics.emotionalTone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Competitive Comparison</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Industry Average:</span>
                      <span className="font-medium">{analysis.competitiveAnalysis.industryStandard}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Score:</span>
                      <span className="font-medium text-green-600">{analysis.competitiveAnalysis.yourScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Percentile Rank:</span>
                      <span className="font-medium text-blue-600">{analysis.competitiveAnalysis.percentile}th</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Content Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{strength.area}</h4>
                      <Badge variant="outline">{strength.score}%</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Actionable Improvement Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(suggestion.priority)}
                        <h4 className="font-medium">{suggestion.category}</h4>
                      </div>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority} priority
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Recommendation:</h5>
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Expected Impact:</h5>
                        <p className="text-sm text-green-700">{suggestion.impact}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">How to Implement:</h5>
                        <p className="text-sm text-blue-700">{suggestion.implementation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Structure Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Content Structure Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.introduction}%</div>
                  <div className="text-sm text-gray-600">Introduction</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.bodyDevelopment}%</div>
                  <div className="text-sm text-gray-600">Body Development</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.conclusion}%</div>
                  <div className="text-sm text-gray-600">Conclusion</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{analysis.contentStructure.flow}%</div>
                  <div className="text-sm text-gray-600">Overall Flow</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
