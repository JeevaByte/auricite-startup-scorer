
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThumbsUp, ThumbsDown, MessageSquare, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackCollectionProps {
  section: 'scoring' | 'recommendations' | 'overall';
  assessmentId?: string;
  onClose: () => void;
}

export const FeedbackCollection = ({ section, assessmentId, onClose }: FeedbackCollectionProps) => {
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: 'Rating Required',
        description: 'Please select whether this was helpful or not.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          section,
          rating,
          feedback: feedback.trim() || null,
          assessment_id: assessmentId || null,
        });

      if (error) throw error;

      toast({
        title: 'Thank you!',
        description: 'Your feedback helps us improve the platform.',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">How was this helpful?</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Was this {section === 'scoring' ? 'scoring' : section === 'recommendations' ? 'recommendation' : 'experience'} helpful?
          </Label>
          <RadioGroup value={rating} onValueChange={(value) => setRating(value as 'helpful' | 'not_helpful')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="helpful" id="helpful" />
              <Label htmlFor="helpful" className="flex items-center space-x-2 cursor-pointer">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span>Yes, helpful</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_helpful" id="not_helpful" />
              <Label htmlFor="not_helpful" className="flex items-center space-x-2 cursor-pointer">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span>Not helpful</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="feedback" className="text-sm font-medium mb-2 block">
            Additional feedback (optional)
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How can we improve this for you?"
            className="resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? 'Submitting...' : 'Submit'}
            <MessageSquare className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
