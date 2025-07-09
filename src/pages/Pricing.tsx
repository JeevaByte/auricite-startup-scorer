
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Rocket } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Essential features to get started',
      icon: <Zap className="h-6 w-6" />,
      features: [
        'Basic assessment',
        'Score calculation',
        'Basic recommendations',
        'Email support',
        'Access to community'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Medium',
      price: '$10',
      description: 'Advanced features for growing startups',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Basic',
        'Advanced analytics',
        'Pitch deck validator',
        'Investor matching',
        'Priority support',
        'Export reports',
        'Benchmark comparisons'
      ],
      buttonText: 'Upgrade to Medium',
      popular: true
    },
    {
      name: 'Premium',
      price: '$20',
      description: 'Full access to all features and functions',
      icon: <Rocket className="h-6 w-6" />,
      features: [
        'Everything in Medium',
        'AI-powered insights',
        'Custom recommendations',
        'Direct investor connections',
        'White-label reports',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features'
      ],
      buttonText: 'Get Full Access',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Unlock advanced features and get the most out of your investment journey
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Check className="h-4 w-4 mr-2" />
            All plans include a 30-day money-back guarantee
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  {plan.price !== 'Free' && <span className="text-sm text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Need help choosing?</h3>
          <p className="text-muted-foreground mb-6">
            Basic features are free • $10 for medium features • $20 for getting all the full features and functions of the application
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
