
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart3, Target, Users, Crown, CheckCircle } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPremiumAccess, loading } = useSubscription();

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
      navigate('/pricing');
    } else {
      navigate('/investor-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">InvestReady</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                {hasPremiumAccess && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Assess Your Investment Readiness
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get a comprehensive evaluation of your startup's investment potential. 
            Receive personalized insights and connect with the right investors for your stage.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6"
            >
              Take Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/pricing')}
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Assessments Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Startups Funded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$2B+</div>
              <div className="text-muted-foreground">Total Funding Raised</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Investment Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive evaluation of your startup's readiness for investment across 
                  key metrics including team, traction, financials, and business model.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Investor Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with investors who are actively looking for startups in your 
                  stage and sector. Get introduced to the right people at the right time.
                </p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                  Premium Feature
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  In-depth analysis of your strengths and areas for improvement, 
                  with actionable recommendations to increase your funding chances.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Investment Ready?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of entrepreneurs who have successfully raised funding
          </p>
          
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6"
            >
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={handleInvestorDashboard}
              className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary"
            >
              <Crown className="mr-2 h-5 w-5" />
              Investor Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 InvestReady. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
