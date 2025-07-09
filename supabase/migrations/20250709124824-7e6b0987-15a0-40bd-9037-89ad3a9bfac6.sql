
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]',
  max_assessments INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user roles enum and table
CREATE TYPE public.user_role AS ENUM ('free', 'premium', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, features, max_assessments) VALUES
('Free', 0, 0, '["Basic Assessment", "Limited Results"]', 1),
('Premium', 29.99, 299.99, '["Unlimited Assessments", "Investor Dashboard", "Advanced Analytics", "Priority Support"]', -1),
('Enterprise', 99.99, 999.99, '["Everything in Premium", "White Label", "API Access", "Custom Integrations"]', -1);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user roles" ON public.user_roles
  FOR UPDATE USING (true);

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(role, 'free'::user_role)
  FROM public.user_roles
  WHERE user_id = user_uuid;
$$;

-- Create function to check if user has premium access
CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND sp.name IN ('Premium', 'Enterprise')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  );
$$;

-- Create trigger to auto-assign free role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Update existing investor dashboard policies to require premium access
DROP POLICY IF EXISTS "Users can view their own investor profiles" ON public.investor_profiles;
CREATE POLICY "Premium users can view their own investor profiles" ON public.investor_profiles
  FOR SELECT USING (auth.uid() = user_id AND public.has_premium_access(auth.uid()));

DROP POLICY IF EXISTS "Users can create their own investor profiles" ON public.investor_profiles;
CREATE POLICY "Premium users can create their own investor profiles" ON public.investor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND public.has_premium_access(auth.uid()));

DROP POLICY IF EXISTS "Users can update their own investor profiles" ON public.investor_profiles;
CREATE POLICY "Premium users can update their own investor profiles" ON public.investor_profiles
  FOR UPDATE USING (auth.uid() = user_id AND public.has_premium_access(auth.uid()));
