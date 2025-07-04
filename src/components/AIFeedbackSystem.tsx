
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Brain, Zap, Target, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AIFeedbackProps {
  content: string;
  type: 'pitch' | 'business-plan' | 'presentation' | 'general';
}

interface FeedbackResult {
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
  strengths: string[];
  concerns: string[];
  readinessLevel: string;
}

export const AIFeedbackSystem = () => {
  const [content, setContent] = useState('');
  const [feedbackType, setFeedbackType] = useState<'pitch' | 'business-plan' | 'presentation' | 'general'>('pitch');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const { toast } = useToast();

  const analyzePitchContent = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis with LiteLLM/OpenRouter
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: FeedbackResult = {
        score: 78,
        sentiment: content.toLowerCase().includes('innovative') ? 'positive' : 'neutral',
        suggestions: [
          'Strengthen your value proposition in the opening',
          'Add more specific market size data',
          'Include customer testimonials or case studies',
          'Clarify your competitive advantage'
        ],
        strengths: [
          'Clear problem identification',
          'Strong team credentials mentioned',
          'Realistic financial projections'
        ],
        concerns: [
          'Market penetration strategy needs detail',
          'Revenue model could be clearer',
          'Risk mitigation not addressed'
        ],
        readinessLevel: 'Investor-Ready with improvements'
      };
      
      setFeedback(mockAnalysis);
      
      toast({
        title: "AI Analysis Complete!",
        description: `Your ${feedbackType} scored ${mockAnalysis.score}/100`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">AI Content Analyzer</h3>
          <Badge className="bg-purple-100 text-purple-800">
            Powered by LiteLLM
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pitch">Pitch Deck</option>
              <option value="business-plan">Business Plan</option>
              <option value="presentation">Presentation</option>
              <option value="general">General Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Analyze
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Paste your ${feedbackType} content here for AI analysis...`}
              rows={8}
              className="w-full"
            />
          </div>

          <Button
            onClick={analyzePitchContent}
            disabled={!content.trim() || isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {feedback && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Overview */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Overall Score
            </h4>
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(feedback.score)}`}>
                {feedback.score}/100
              </div>
              <Progress value={feedback.score} className="mb-4" />
              <Badge className={getSentimentColor(feedback.sentiment)}>
                {feedback.sentiment.toUpperCase()} Sentiment
              </Badge>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Readiness Level: {feedback.readinessLevel}
              </p>
            </div>
          </Card>

          {/* Strengths */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Suggestions */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Improvement Suggestions
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Concerns */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Areas of Concern
            </h4>
            <ul className="space-y-2">
              {feedback.concerns.map((concern, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{concern}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* AI Features Info */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <h4 className="font-semibold mb-4">AI-Powered Features</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span>Multi-LLM Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Context-Aware Feedback</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span>Real-time Processing</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
