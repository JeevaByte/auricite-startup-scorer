
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Zap, Send, Loader2, CheckCircle } from 'lucide-react';

interface TallyFormData {
  companyName: string;
  email: string;
  fundingStage: string;
  feedback: string;
  interestLevel: string;
}

export const TallyFormIntegration = () => {
  const [formData, setFormData] = useState<TallyFormData>({
    companyName: '',
    email: '',
    fundingStage: 'pre-seed',
    feedback: '',
    interestLevel: 'high'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // AI-enhanced form processing
      const aiEnhancedData = {
        ...formData,
        timestamp: new Date().toISOString(),
        aiTags: generateAITags(formData),
        sentimentScore: analyzeSentiment(formData.feedback),
        priorityLevel: calculatePriority(formData)
      };

      // Simulate Tally.so API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('AI-Enhanced Form Data:', aiEnhancedData);
      
      setIsSubmitted(true);
      toast({
        title: "Feedback Submitted Successfully!",
        description: "Our AI has analyzed your feedback and we'll follow up within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAITags = (data: TallyFormData) => {
    const tags = [];
    if (data.feedback.toLowerCase().includes('ux') || data.feedback.toLowerCase().includes('user experience')) {
      tags.push('UX-feedback');
    }
    if (data.feedback.toLowerCase().includes('feature') || data.feedback.toLowerCase().includes('functionality')) {
      tags.push('feature-request');
    }
    if (data.feedback.toLowerCase().includes('bug') || data.feedback.toLowerCase().includes('error')) {
      tags.push('bug-report');
    }
    if (data.feedback.toLowerCase().includes('investor') || data.feedback.toLowerCase().includes('funding')) {
      tags.push('investor-related');
    }
    return tags;
  };

  const analyzeSentiment = (text: string) => {
    const positiveWords = ['great', 'excellent', 'love', 'amazing', 'helpful', 'useful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'useless', 'frustrating'];
    
    const positive = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negative = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  };

  const calculatePriority = (data: TallyFormData) => {
    if (data.interestLevel === 'high' && data.fundingStage === 'series-a') return 'high';
    if (data.interestLevel === 'medium' || data.fundingStage === 'seed') return 'medium';
    return 'low';
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h3>
        <p className="text-gray-600 mb-6">
          Your feedback has been processed by our AI system and categorized for our team.
        </p>
        <Badge className="bg-green-100 text-green-800">
          AI Analysis Complete
        </Badge>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <Zap className="h-6 w-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">AI-Enhanced Feedback Form</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <Input
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Your startup name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Funding Stage
          </label>
          <select
            value={formData.fundingStage}
            onChange={(e) => setFormData({...formData, fundingStage: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pre-seed">Pre-Seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="series-b">Series B</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Feedback
          </label>
          <Textarea
            value={formData.feedback}
            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
            placeholder="Share your thoughts, suggestions, or issues..."
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Level
          </label>
          <select
            value={formData.interestLevel}
            onChange={(e) => setFormData({...formData, interestLevel: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High - Ready to engage</option>
            <option value="medium">Medium - Exploring options</option>
            <option value="low">Low - Just browsing</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing with AI...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <Zap className="h-4 w-4 inline mr-1" />
          AI Enhancement: Your feedback will be automatically categorized, sentiment analyzed, 
          and prioritized for our team to provide the most relevant response.
        </p>
      </div>
    </Card>
  );
};
