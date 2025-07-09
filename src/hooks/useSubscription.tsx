
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
  max_assessments: number | null;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  plan: SubscriptionPlan;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Load subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (plansError) throw plansError;
      
      // Transform the data to match our interface
      const transformedPlans: SubscriptionPlan[] = (plansData || []).map(plan => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
        max_assessments: plan.max_assessments,
        is_active: plan.is_active,
      }));
      
      setPlans(transformedPlans);

      if (user) {
        // Load user subscription
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (*)
          `)
          .eq('user_id', user.id)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        if (subData) {
          // Transform the subscription data
          const transformedSubscription: UserSubscription = {
            id: subData.id,
            plan_id: subData.plan_id,
            status: subData.status,
            current_period_end: subData.current_period_end,
            plan: {
              id: subData.subscription_plans.id,
              name: subData.subscription_plans.name,
              price_monthly: subData.subscription_plans.price_monthly,
              price_yearly: subData.subscription_plans.price_yearly,
              features: Array.isArray(subData.subscription_plans.features) 
                ? subData.subscription_plans.features as string[] 
                : [],
              max_assessments: subData.subscription_plans.max_assessments,
              is_active: subData.subscription_plans.is_active,
            }
          };
          setSubscription(transformedSubscription);
        }

        // Check premium access
        const { data: premiumData, error: premiumError } = await supabase
          .rpc('has_premium_access', { user_uuid: user.id });

        if (premiumError) throw premiumError;
        setHasPremiumAccess(premiumData || false);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const createPortalSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  };

  return {
    subscription,
    plans,
    loading,
    hasPremiumAccess,
    createCheckoutSession,
    createPortalSession,
    refreshSubscription: loadSubscriptionData
  };
};
