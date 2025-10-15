import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Check, X, Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: any; // Changed from string[] to any to handle JSON type
  max_assessments: number | null;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchUserSubscription();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      });
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
      
      toast({
        title: "Redirecting to payment...",
        description: "Please complete your payment in the new tab.",
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!userSubscription) return null;
    return plans.find(plan => plan.id === userSubscription.plan_id);
  };

  const currentPlan = getCurrentPlan();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading subscription information...</p>
        </div>
      </div>
    );
  }

  // Overview Button with Current Plan
  const overviewButton = currentPlan ? (
    <div className="mb-4 flex justify-end">
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <Crown className="h-4 w-4 text-yellow-500" />
        {`Current Plan: ${currentPlan.name}`}
      </Button>
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      {overviewButton}
      {/* Current Subscription Status */}
      {currentPlan && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-primary" />
              <span>Current Plan: {currentPlan.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="default" className="mt-1">
                  {userSubscription?.status || 'Active'}
                </Badge>
              </div>
              {userSubscription?.current_period_end && (
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="font-medium">
                    {new Date(userSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {plans.filter(p => p.name.toLowerCase() === 'free' || p.name.toLowerCase() === 'premium').map((plan, idx) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isFree = plan.name.toLowerCase() === 'free';
            const isPremium = plan.name.toLowerCase() === 'premium';
            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                  </CardTitle>
                  <div className="text-3xl font-bold">
                    {isFree ? 'Free' : `$${plan.price_monthly}`}
                    {!isFree && <span className="text-sm font-normal text-gray-600">/month</span>}
                  </div>
                  {!isFree && plan.price_yearly && (
                    <p className="text-sm text-gray-600">
                      ${plan.price_yearly}/year (save 20%)
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Features:</p>
                    <ul className="space-y-2">
                      {isFree && [
                        'Basic Assessment',
                        'Comprehensive Assessment',
                        'Detailed PDF Reports',
                        'Assessment History',
                        'AI-Powered Recommendations',
                        'Advanced AI Content Analysis',
                        'Downloadable PDF Reports',
                        'Score Overview'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                      {isPremium && [
                        'Everything in Free',
                        'Unlimited Assessments',
                        'Investor Directory Access',
                        'Investor Matching',
                        'Deal Flow Management',
                        'Custom Scoring',
                        'Priority Support',
                        'Direct Founder Connections',
                        'Custom Reporting',
                        'Benchmark Comparisons',
                        'API Access',
                        '24/7 Support'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Assessments:</strong> {isFree ? '1' : 'Unlimited'}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan || upgrading === plan.id}
                    onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                  >
                    {upgrading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison - Always Expanded */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Feature Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Feature</th>
                  {plans.filter(p => p.name.toLowerCase() === 'free' || p.name.toLowerCase() === 'premium').map(plan => (
                    <th key={plan.id} className="text-center p-3 font-semibold">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Quick Assessment', free: true, premium: true },
                  { name: 'Comprehensive Assessment', free: true, premium: true },
                  { name: 'Detailed PDF Reports', free: true, premium: true },
                  { name: 'Assessment History', free: true, premium: true },
                  { name: 'AI-Powered Recommendations', free: true, premium: true },
                  { name: 'Advanced AI Content Analysis', free: true, premium: true },
                  { name: 'Downloadable PDF Reports', free: true, premium: true },
                  { name: 'Unlimited Assessments', free: false, premium: true },
                  { name: 'Investor Directory', free: false, premium: true },
                  { name: 'Investor Matching', free: false, premium: true },
                  { name: 'Priority Support', free: false, premium: true },
                  { name: 'Direct Founder Connections', free: false, premium: true },
                  { name: 'Deal Flow Management', free: false, premium: true },
                  { name: 'Custom Reporting', free: false, premium: true },
                  { name: 'Benchmark Comparisons', free: false, premium: true },
                  { name: 'API Access', free: false, premium: true },
                  { name: '24/7 Support', free: false, premium: true }
                ].map((feature, idx) => (
                  <tr key={feature.name} className={idx % 2 === 0 ? "border-b bg-gray-50" : "border-b"}>
                    <td className="p-3 font-medium">{feature.name}</td>
                    <td className="text-center p-3">
                      {feature.free ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-3">
                      {feature.premium ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need a subscription?</strong> 
              <a href="/pricing" className="ml-1 text-blue-600 hover:text-blue-800 underline">
                View detailed pricing and upgrade options →
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};