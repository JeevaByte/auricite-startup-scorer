import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target, TrendingUp, BarChart3, Users, CheckCircle, Shield, Zap, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function InvestorLanding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth?returnTo=/investor/deal-flow');
    } else {
      navigate('/investor/deal-flow');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6" variant="outline">
            Trusted by 100+ Active Investors
          </Badge>
          <h1 className="text-5xl font-bold mb-6">
            Discover Your Next
            <br />
            <span className="text-primary">Investment Opportunity</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Access pre-vetted startups, AI-powered insights, and comprehensive analytics to make smarter investment decisions.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
            Start Exploring Deals
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need to Find Great Deals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to discover, analyze, and manage your startup investments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Curated Deal Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Browse investment-ready startups with detailed scorecards and verified metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-10 w-10 text-primary mb-4" />
                <CardTitle>AI-Powered Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized startup recommendations based on your investment preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Portfolio Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track your investments with comprehensive analytics and performance metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Browse Opportunities</h3>
                <p className="text-muted-foreground">
                  Explore our curated deal flow of pre-vetted startups seeking £25K-£2M funding.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analyze & Compare</h3>
                <p className="text-muted-foreground">
                  Review detailed scorecards, compare startups side-by-side, and access AI-powered insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect & Invest</h3>
                <p className="text-muted-foreground">
                  Express interest, connect with founders, and manage your portfolio all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Investors Choose Us</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pre-Vetted Startups</h3>
                <p className="text-muted-foreground">
                  All startups complete comprehensive assessments before appearing in your deal flow.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with GDPR compliance and encrypted data storage.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Real-Time Updates</h3>
                <p className="text-muted-foreground">
                  Get instant notifications when new opportunities match your investment criteria.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Portfolio Tracking</h3>
                <p className="text-muted-foreground">
                  Monitor your investments with comprehensive analytics and performance metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Find Your Next Investment?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of active investors discovering high-potential startups
          </p>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGetStarted}
            className="text-lg px-8 py-6"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
