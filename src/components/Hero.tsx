
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Target, Shield, CheckCircle, Star } from 'lucide-react';

interface HeroProps {
  onStartAssessment: () => void;
}

export const Hero = ({ onStartAssessment }: HeroProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4">
            🚀 Powered by OpenVC Data & AI Analysis
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Assess Your Startup's
          <span className="text-blue-600 block">Investment Readiness</span>
          <span className="text-gray-600 text-2xl md:text-3xl block mt-2">in Minutes</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Get an actionable scorecard, personalized recommendations, and connect with the right angel investors. 
          Built for pre-seed startups seeking £25K-£250K funding rounds.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure Data Encryption</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>GDPR Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>500+ Startups Assessed</span>
          </div>
        </div>

        <Button 
          onClick={onStartAssessment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Start Free Assessment
          <TrendingUp className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* 3-Step Process */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete Assessment</h3>
            <p className="text-gray-600">Answer 11 strategic questions about your startup in 5 minutes</p>
          </div>
          <div className="text-center">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Your Score</h3>
            <p className="text-gray-600">Receive detailed scores across 4 key investment criteria with AI insights</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect & Improve</h3>
            <p className="text-gray-600">Get matched with angel investors and actionable improvement recommendations</p>
          </div>
        </div>
      </div>

      {/* Scoring Categories */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Business Idea</h3>
          <p className="text-sm text-gray-600 mb-2">Market size, problem-solution fit</p>
          <Badge variant="outline" className="text-xs">30% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Financials</h3>
          <p className="text-sm text-gray-600 mb-2">Revenue, MRR, cap table</p>
          <Badge variant="outline" className="text-xs">25% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Team</h3>
          <p className="text-sm text-gray-600 mb-2">Experience, commitment, skills</p>
          <Badge variant="outline" className="text-xs">25% weight</Badge>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Traction</h3>
          <p className="text-sm text-gray-600 mb-2">Users, validation, momentum</p>
          <Badge variant="outline" className="text-xs">20% weight</Badge>
        </Card>
      </div>

      {/* Social Proof Section */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted by UK Startups</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600">Startups Assessed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">£2.5M+</div>
              <div className="text-gray-600">Capital Raised</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">150+</div>
              <div className="text-gray-600">Angel Connections</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
