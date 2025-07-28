import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';

interface ScoreFeedbackProps {
  assessmentId: string;
  totalScore: number;
  onFeedbackSubmitted?: () => void;
}

export const ScoreFeedback = ({ assessmentId, totalScore, onFeedbackSubmitted }: ScoreFeedbackProps) => {
  const [accuracy, setAccuracy] = useState<string>('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accuracy) {
      toast({
        title: 'Please select an option',
        description: 'Let us know if the score felt accurate.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('score_feedback')
        .insert({
          assessment_id: assessmentId,
          accuracy_rating: accuracy,
          comments: comments.trim() || null,
          score_received: totalScore,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Thank you for your feedback!',
        description: 'Your input helps us improve our scoring algorithm.',
      });

      onFeedbackSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Feedback submission failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Thanks for helping us improve! Your feedback has been recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>How accurate was your score?</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us improve our assessment algorithm for all users.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Did this score feel accurate for your startup?</Label>
            <RadioGroup value={accuracy} onValueChange={setAccuracy}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_accurate" id="very_accurate" />
                <Label htmlFor="very_accurate" className="flex items-center space-x-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>Very accurate - reflects our readiness well</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="somewhat_accurate" id="somewhat_accurate" />
                <Label htmlFor="somewhat_accurate">Somewhat accurate - mostly on track</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_accurate" id="not_accurate" />
                <Label htmlFor="not_accurate" className="flex items-center space-x-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>Not accurate - doesn't reflect our readiness</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional comments (optional)</Label>
            <Textarea
              id="comments"
              placeholder="Tell us more about your thoughts on the scoring..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};