import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Users, ArrowRight } from 'lucide-react';

interface WaitlistCaptureProps {
  title?: string;
  description?: string;
  feature?: string;
}

export const WaitlistCapture = ({ 
  title = "Join Our Waitlist", 
  description = "Be the first to access new features and exclusive content.",
  feature = "general"
}: WaitlistCaptureProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await (supabase as any)
        .from('waitlist_subscribers')
        .insert({
          email: email.trim().toLowerCase(),
          feature_interest: feature,
          status: 'pending',
          source: 'website'
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          setError('This email is already on our waitlist!');
        } else {
          throw insertError;
        }
        return;
      }

      setIsSubmitted(true);
      toast({
        title: 'Welcome to the waitlist!',
        description: 'We\'ll notify you as soon as new features are available.',
      });
    } catch (error: any) {
      console.error('Waitlist signup error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>You're on the list!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            We've added <strong>{email}</strong> to our waitlist. 
            You'll be among the first to know when we launch new features!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Users className="h-10 w-10 mx-auto mb-4 text-primary" />
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="waitlist-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="waitlist-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Adding you...'
            ) : (
              <>
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          We respect your privacy and won't spam you. Unsubscribe anytime.
        </p>
      </CardContent>
    </Card>
  );
};