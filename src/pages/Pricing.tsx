
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading-state';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Star, Zap, ArrowLeft } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, subscription, loading, createCheckoutSession } = useSubscription();
  const { toast } = useToast();

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      navigate('/auth?returnTo=/pricing');
      return;
    }

    try {
      const { url } = await createCheckoutSession(planId);
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading pricing plans..." />;
  }

  const currentPlanName = subscription?.plan?.name || 'Free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unlock advanced features and get the most out of your investment journey
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlanName;
            const isPremium = plan.name === 'Premium';
            const isEnterprise = plan.name === 'Enterprise';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${isPremium ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {plan.name === 'Free' && <Zap className="h-8 w-8 text-blue-500" />}
                    {plan.name === 'Premium' && <Crown className="h-8 w-8 text-yellow-500" />}
                    {plan.name === 'Enterprise' && <Star className="h-8 w-8 text-purple-500" />}
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${plan.price_monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  {plan.price_yearly && plan.price_yearly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      or ${plan.price_yearly}/year (save 17%)
                    </p>
                  )}
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={isPremium ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Current Plan' : 
                     plan.name === 'Free' ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                  
                  {isCurrentPlan && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      You're currently on this plan
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 30-day money-back guarantee. 
            <br />
            Need help choosing? <Button variant="link" className="p-0 h-auto">Contact us</Button>
          </p>
        </div>
      </div>
    </div>
  );
}
