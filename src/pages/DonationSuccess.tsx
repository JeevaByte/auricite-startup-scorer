import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, ArrowRight, Mail, Users, BookOpen, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donationDetails, setDonationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real implementation, you might want to verify the session with Stripe
      // For now, we'll show a success message
      setLoading(false);
      
      toast({
        title: "Thank you for your donation! 🙏",
        description: "Your generous contribution helps us build better tools for startups.",
      });
    } else {
      // Redirect if no session ID
      navigate('/');
    }
  }, [sessionId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Donation Successful! 🎉
              </CardTitle>
              <CardDescription className="text-green-600">
                Thank you for supporting our mission to help startups succeed
              </CardDescription>
            </CardHeader>
          </Card>

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                What happens next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Email Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email with your donation receipt and access details.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Instant Access</p>
                  <p className="text-sm text-muted-foreground">
                    Your premium features are now active and ready to use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features Unlocked */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Premium Features Unlocked 🚀</CardTitle>
              <CardDescription>
                You now have access to all these premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Investor Directory</p>
                    <p className="text-sm text-muted-foreground">
                      Connect with 500+ verified investors looking for startups like yours
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/investor-directory')}
                    className="ml-auto"
                  >
                    Explore
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Learning Resources</p>
                    <p className="text-sm text-muted-foreground">
                      Access exclusive educational content and startup guides
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/learn')}
                    className="ml-auto"
                  >
                    Learn
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Upload className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Pitch Deck Upload</p>
                    <p className="text-sm text-muted-foreground">
                      Upload and manage your pitch decks securely
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="ml-auto"
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/investor-directory')}
              className="flex-1"
              size="lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Start Exploring Investors
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
              size="lg"
            >
              Return Home
            </Button>
          </div>

          {/* Thank You Note */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-medium mb-2">
                Thank you for believing in our mission! 💙
              </p>
              <p className="text-muted-foreground">
                Your support helps us continue building tools that empower startups to succeed.
                If you have any questions or need assistance, please don't hesitate to reach out.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}