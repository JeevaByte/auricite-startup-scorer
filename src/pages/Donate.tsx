import React from 'react';
import { DonationButton } from '@/components/DonationButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Target, Users, Rocket, CheckCircle } from 'lucide-react';

export default function Donate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Heart className="h-10 w-10 text-primary" />
            Support Our Mission
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us democratize access to investment readiness tools and empower the next generation of entrepreneurs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Our Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free assessment tools for all entrepreneurs</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Educational resources and tutorials</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI-powered feedback and recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Community building and networking</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Why Donate?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your donation helps us maintain and improve our platform, ensuring that entrepreneurs worldwide have access to the tools they need to succeed.
              </p>
              <p className="text-muted-foreground">
                Every contribution, no matter the size, makes a difference in supporting innovation and entrepreneurship.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Make a Donation
            </CardTitle>
            <p className="text-muted-foreground">
              Choose an amount that feels right for you. Every donation helps us continue our mission.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <DonationButton 
                variant="default" 
                size="lg"
                className="w-full max-w-sm mx-auto"
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What Your Donation Supports:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Server costs and infrastructure</li>
                <li>• AI model training and improvements</li>
                <li>• Platform development and new features</li>
                <li>• Educational content creation</li>
                <li>• Community support and moderation</li>
              </ul>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                🔒 Secure payments powered by Stripe • Tax receipts available • Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Thank you for supporting entrepreneurship and innovation! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}