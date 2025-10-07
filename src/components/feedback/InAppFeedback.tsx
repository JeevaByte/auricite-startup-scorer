import React, { useState } from 'react';
import { MessageSquare, X, Send, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  message: string;
  page: string;
}

export const InAppFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    rating: 0,
    message: '',
    page: window.location.pathname
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', color: 'destructive' },
    { value: 'feature', label: 'Feature Request', color: 'default' },
    { value: 'improvement', label: 'Improvement', color: 'secondary' },
    { value: 'general', label: 'General Feedback', color: 'outline' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your feedback message",
        variant: "destructive"
      });
      return;
    }

    if (formData.rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating for your experience",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting feedback with data:', {
        user_id: user?.id || null,
        feedback: formData.message,
        section: formData.type,
        rating: formData.rating.toString(),
      });

      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id || null,
          feedback: formData.message,
          section: formData.type,
          rating: formData.rating.toString(),
          assessment_id: null
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Feedback submitted successfully:', data);

      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed."
      });

      // Reset form
      setFormData({
        type: 'general',
        rating: 0,
        message: '',
        page: window.location.pathname
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to submit feedback",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full w-12 h-12"
        size="icon"
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-96 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Send Feedback</CardTitle>
              <CardDescription>
                Help us improve your experience
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Feedback Type
              </label>
              <div className="flex flex-wrap gap-2">
                {feedbackTypes.map(type => (
                  <Badge
                    key={type.value}
                    variant={formData.type === type.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                How would you rate your experience?
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        rating <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Message *
              </label>
              <Textarea
                placeholder="Tell us about your experience, report a bug, or suggest a feature..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'general',
                  message: prev.message + (prev.message ? '\n\n' : '') + 'I love this feature!' 
                }))}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Love it
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'improvement',
                  message: prev.message + (prev.message ? '\n\n' : '') + '👎 This could be better...' 
                }))}
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Could be better
              </Button>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.message.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};