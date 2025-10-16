import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface StartupRatingSystemProps {
  startupUserId: string;
  startupName: string;
  onRatingSubmitted?: () => void;
}

export function StartupRatingSystem({ 
  startupUserId, 
  startupName, 
  onRatingSubmitted 
}: StartupRatingSystemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a rating',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      // Mock rating submission - in production this would save to database
      console.log('Rating submitted:', {
        investor: user.id,
        startup: startupUserId,
        rating,
        feedback,
      });

      toast({
        title: 'Rating Submitted',
        description: 'Thank you for your feedback!',
      });

      // Reset form
      setRating(0);
      setFeedback('');
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your rating',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Rate {startupName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Your Rating</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Feedback (Optional)</Label>
          <Textarea
            placeholder="Share your thoughts about this startup..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSubmitRating}
          disabled={submitting || rating === 0}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
          <MessageSquare className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
