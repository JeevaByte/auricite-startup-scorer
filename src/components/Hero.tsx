
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Target, Shield, CheckCircle, Star, Zap, BarChart3, Handshake } from 'lucide-react';

interface HeroProps {
  onStartAssessment: () => void;
}

export const Hero = ({ onStartAssessment }: HeroProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Enhanced Hero Section */}
      <div className="text-center py-16 md:py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl mb-16">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            Powered by OpenVC Data & AI Analysis
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Accelerate Your
          <span className="text-blue-600 block">Funding Journey</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          AI-powered investment readiness assessments and personalized recommendations 
          for startups at every stage - from pre-seed to growth.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure & GDPR Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Trusted by 500+ Startups</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>£2.5M+ Capital Raised</span>
          </div>
        </div>

        <Button 
          onClick={onStartAssessment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          Get Started – It's Free
          <Zap className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Enhanced Feature Highlights */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Everything You Need to Get Funded</h2>
        <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
          Our comprehensive platform guides you through every step of your funding journey
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Assessment</h3>
            <p className="text-gray-600 leading-relaxed">Complete a guided readiness assessment with AI-powered insights and personalized recommendations tailored to your startup stage.</p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="bg-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Actionable Insights</h3>
            <p className="text-gray-600 leading-relaxed">Get detailed scoring across business idea, financials, team, and traction with specific improvement recommendations.</p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-green-100">
            <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Handshake className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">🤝 Investor Matching</h3>
            <p className="text-gray-600 leading-relaxed">Discover and connect with angel investors and VCs who match your startup profile and funding requirements.</p>
          </Card>
        </div>
      </div>

      {/* 3-Step Process */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Complete Assessment</h3>
            <p className="text-gray-600">Answer 11 strategic questions about your startup in just 5 minutes</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Your Score</h3>
            <p className="text-gray-600">Receive detailed scores across 4 key investment criteria with AI insights</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Improve</h3>
            <p className="text-gray-600">Get matched with angel investors and receive actionable recommendations</p>
          </div>
        </div>
      </div>

      {/* Enhanced Scoring Categories */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Business Idea</h3>
          <p className="text-sm text-gray-600 mb-2">Market size, problem-solution fit</p>
          <Badge variant="outline" className="text-xs">30% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Financials</h3>
          <p className="text-sm text-gray-600 mb-2">Revenue, MRR, cap table</p>
          <Badge variant="outline" className="text-xs">25% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Team</h3>
          <p className="text-sm text-gray-600 mb-2">Experience, commitment, skills</p>
          <Badge variant="outline" className="text-xs">25% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Traction</h3>
          <p className="text-sm text-gray-600 mb-2">Users, validation, momentum</p>
          <Badge variant="outline" className="text-xs">20% weight</Badge>
        </Card>
      </div>

      {/* Enhanced Social Proof Section */}
      <Card className="p-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Trusted by UK Startups</h2>
          <p className="text-xl mb-8 opacity-90">Join hundreds of founders who've accelerated their funding journey</p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="opacity-90">Startups Assessed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">£2.5M+</div>
              <div className="opacity-90">Capital Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="opacity-90">Investor Connections</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Technology Partners */}
      <div className="text-center mb-16">
        <h3 className="text-lg font-semibold text-gray-700 mb-6">Built with trusted technology</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <Badge variant="outline" className="px-4 py-2">Supabase</Badge>
          <Badge variant="outline" className="px-4 py-2">OpenVC Data</Badge>
          <Badge variant="outline" className="px-4 py-2">AI-Powered</Badge>
          <Badge variant="outline" className="px-4 py-2">GDPR Compliant</Badge>
        </div>
      </div>
    </div>
  );
};
