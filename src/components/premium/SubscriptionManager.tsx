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

  return (
    <div className="space-y-6">
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
        <div className="grid md:grid-cols-3 gap-6">
          {plans.slice(0, 3).map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isFree = plan.price_monthly === 0;
            
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
                    {!isFree && <Crown className="h-5 w-5 text-yellow-500" />}
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
                      {(Array.isArray(plan.features) ? plan.features : []).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.max_assessments && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Assessments:</strong> {plan.max_assessments === -1 ? 'Unlimited' : plan.max_assessments}
                      </p>
                    </div>
                  )}
                  
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
                    ) : isFree ? (
                      'Downgrade'
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

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  {plans.slice(0, 3).map(plan => (
                    <th key={plan.id} className="text-center p-2">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">Basic Assessment</td>
                  {plans.slice(0, 3).map(plan => (
                    <td key={plan.id} className="text-center p-2">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2">Detailed Reports</td>
                  {plans.slice(0, 3).map(plan => (
                    <td key={plan.id} className="text-center p-2">
                      {plan.name !== 'Free' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2">Investor Matching</td>
                  {plans.slice(0, 3).map(plan => (
                    <td key={plan.id} className="text-center p-2">
                      {plan.name === 'Enterprise' ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};