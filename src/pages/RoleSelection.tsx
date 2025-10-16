import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, ArrowRight, Building2 } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleFundSeekerClick = () => {
    navigate('/auth?role=fund_seeker');
  };

  const handleInvestorClick = () => {
    navigate('/auth?role=investor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 p-4 rounded-full mb-6">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to Auricite InvestX</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your journey to get started with our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Fund Seeker Card */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary" onClick={handleFundSeekerClick}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-6 rounded-full">
                  <TrendingUp className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">I'm a Fund Seeker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Looking to raise capital and connect with investors
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Get investment readiness score</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>AI-powered pitch deck analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Connect with matching investors</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Track your progress</span>
                </li>
              </ul>
              <Button className="w-full mt-6" size="lg">
                Continue as Fund Seeker
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Investor Card */}
          <Card className="hover:shadow-2xl transition-all cursor-pointer border-2 hover:border-primary" onClick={handleInvestorClick}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-6 rounded-full">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">I'm an Investor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Seeking quality deal flow and investment opportunities
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Browse vetted startup opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>AI-recommended matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Portfolio tracking & analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Detailed startup scorecards</span>
                </li>
              </ul>
              <Button className="w-full mt-6" size="lg">
                Continue as Investor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
