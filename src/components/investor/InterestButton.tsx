import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Heart, Send, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InterestButtonProps {
  startupUserId: string;
  assessmentId?: string;
  companyName: string;
}

export const InterestButton: React.FC<InterestButtonProps> = ({
  startupUserId,
  assessmentId,
  companyName,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingRequest();
  }, [startupUserId]);

  const checkExistingRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contact_requests')
        .select('id, status')
        .eq('investor_user_id', user.id)
        .eq('startup_user_id', startupUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setHasRequested(!!data);
    } catch (error: any) {
      console.error('Error checking request:', error);
    }
  };

  const handleShowInterest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to show interest');

      // Get investor profile for name
      const { data: investorProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Insert contact request
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          investor_user_id: user.id,
          startup_user_id: startupUserId,
          assessment_id: assessmentId,
          message: message.trim() || null,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already shown interest in this startup');
        }
        throw error;
      }

      // Send notification email to startup founder
      try {
        const investorName = investorProfile?.full_name || 'An investor';
        await supabase.functions.invoke('send-interest-notification', {
          body: {
            startupUserId,
            investorName,
            companyName,
            message: message.trim() || undefined,
          },
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: 'Interest sent!',
        description: `Your interest in ${companyName} has been sent to the founder. They will be notified via email.`,
      });

      setHasRequested(true);
      setOpen(false);
      setMessage('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasRequested) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="h-4 w-4" />
        Interest Sent
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Heart className="h-4 w-4" />
          Show Interest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Express Interest in {companyName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Send a message to introduce yourself and explain why you're interested in this startup.
          </p>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in learning more about your startup because..."
              rows={6}
              maxLength={1000}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleShowInterest}
              disabled={loading}
              className="flex-1 gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Interest'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};