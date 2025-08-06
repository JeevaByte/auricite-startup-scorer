import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { OnboardingTour, defaultOnboardingSteps } from '@/components/onboarding/OnboardingTour';
import { InAppFeedback } from '@/components/feedback/InAppFeedback';
import { HelpCenter } from '@/components/help/HelpCenter';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DonationButton } from '@/components/DonationButton';
import { ArrowRight, BarChart3, Target, Users, Crown, CheckCircle, TrendingUp, Shield, Zap, Brain, FileText, BookOpen } from 'lucide-react';
import { UnifiedAssessment } from '@/components/UnifiedAssessment';
import { Hero } from '@/components/Hero';
import { WaitlistCapture } from '@/components/WaitlistCapture';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPremiumAccess } = useSubscription();
  const [searchParams] = useSearchParams();
  const showAssessment = searchParams.get('assessment') === 'true';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  useEffect(() => {
    if (user && !localStorage.getItem('onboarding-completed')) {
      const timer = setTimeout(() => setShowOnboarding(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/?assessment=true');
    }
  };

  const handleInvestorDashboard = () => {
    if (!user) {
      navigate('/auth?returnTo=/investor-dashboard');
    } else if (!hasPremiumAccess) {
      window.location.href = '/pricing';
    } else {
      navigate('/investor-dashboard');
    }
  };

  // If user is authenticated and assessment parameter is true, show the unified assessment
  if (user && showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <UnifiedAssessment mode="quick" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="py-20">
        <Hero onStartAssessment={handleGetStarted} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and insights to help you prepare for investment and connect with the right investors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/?assessment=true')}>
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quick Investment Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get your investment readiness score in minutes with our streamlined assessment tool.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/ai-feedback')}>
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI Content Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get AI-powered feedback on your pitch deck, business plan, and marketing materials.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/ai-feedback')}>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Pitch Deck Validator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Validate your pitch deck against investor expectations and best practices.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleInvestorDashboard}>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Investor Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with investors who are actively looking for startups in your stage and sector.
                </p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                  Premium Feature
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
            <p className="text-lg text-muted-foreground">
              Jump into the tools that matter most to your startup journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={handleGetStarted}
              aria-label="Start investment readiness assessment"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Start Assessment</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => navigate('/ai-feedback')}
              aria-label="Get AI analysis of your pitch materials"
            >
              <Brain className="h-6 w-6" />
              <span>AI Analysis</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => navigate('/learn')}
              aria-label="Access video tutorials and guides"
            >
              <BookOpen className="h-6 w-6" />
              <span>Learn & Tutorials</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => navigate('/pricing')}
              aria-label="View pricing plans"
            >
              <Crown className="h-6 w-6" />
              <span>View Pricing</span>
            </Button>
            
            <DonationButton 
              variant="outline"
              className="h-24 flex-col space-y-2"
            />
          </div>
        </div>
      </section>

      {/* Learning Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Learn & Improve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master fundraising with our comprehensive video tutorials and expert insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Platform Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Step-by-step guides to master every feature of our platform.
                </p>
                <Button variant="outline" onClick={() => navigate('/learn')}>
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Fundraising Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Expert insights on successful fundraising and investor relations.
                </p>
                <Button variant="outline" onClick={() => navigate('/learn')}>
                  Learn Strategies
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Pitch Deck Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create compelling presentations that capture investor attention.
                </p>
                <Button variant="outline" onClick={() => navigate('/learn')}>
                  Master Pitching
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose InvestReady?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Expert-Validated Framework</h3>
                <p className="text-muted-foreground">
                  Our assessment criteria are based on what investors actually look for, 
                  developed with input from VCs and angel investors.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & Confidential</h3>
                <p className="text-muted-foreground">
                  Your data is protected with enterprise-grade security. 
                  We never share your information without explicit consent.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-muted-foreground">
                  Get your investment readiness score and detailed feedback 
                  immediately after completing the assessment.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Benchmarking</h3>
                <p className="text-muted-foreground">
                  See how you compare to other startups in your sector and stage, 
                  with percentile rankings and industry insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Investment Ready?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who have successfully raised funding with our platform
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6"
              aria-label="Start your investment readiness assessment now"
            >
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/learn')}
              className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary"
              aria-label="Access our learning resources"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start Learning
            </Button>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Want Early Access to New Features?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Be the first to try our latest AI-powered features and get exclusive insights.
            </p>
          </div>
          <WaitlistCapture 
            title="Join Our Beta Program"
            description="Get early access to advanced analytics, AI coaching, and premium investor insights."
            feature="beta_program"
          />
        </div>
      </section>

      {/* Help Button */}
      <Button
        onClick={() => setShowHelpCenter(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full w-12 h-12"
        size="icon"
        variant="outline"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>

      {/* Onboarding Tour */}
      <OnboardingTour
        steps={defaultOnboardingSteps}
        isVisible={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding-completed', 'true');
        }}
        onSkip={() => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding-skipped', 'true');
        }}
      />

      {/* Help Center */}
      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
      />

      {/* In-App Feedback */}
      <InAppFeedback />
    </div>
  );
}
