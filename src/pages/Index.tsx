
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart3, Target, Users, Crown, CheckCircle, TrendingUp, Shield, Zap, Brain, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { Hero } from '@/components/Hero';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPremiumAccess, loading } = useSubscription();
  const [searchParams] = useSearchParams();
  const showAssessment = searchParams.get('assessment') === 'true';

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

  // If user is authenticated and assessment parameter is true, show the assessment
  if (user && showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <AssessmentWizard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />

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
                <CardTitle>Investment Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive evaluation of your startup's readiness for investment across key metrics.
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
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={handleGetStarted}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Start Assessment</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => navigate('/ai-feedback')}
            >
              <Brain className="h-6 w-6" />
              <span>AI Analysis</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => navigate('/pricing')}
            >
              <Crown className="h-6 w-6" />
              <span>View Pricing</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
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
            >
              Start Your Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/ai-feedback')}
              className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-primary"
            >
              <Brain className="mr-2 h-5 w-5" />
              Try AI Tools
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">InvestReady</span>
              </div>
              <p className="text-muted-foreground">
                Helping startups prepare for investment and connect with the right investors.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={handleGetStarted} className="hover:text-foreground">Assessment</button></li>
                <li><button onClick={() => navigate('/ai-feedback')} className="hover:text-foreground">AI Tools</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-foreground">Pricing</button></li>
                <li><button onClick={handleInvestorDashboard} className="hover:text-foreground">Investor Dashboard</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><button onClick={() => navigate('/ai-feedback')} className="hover:text-foreground">Feedback</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 InvestReady. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
