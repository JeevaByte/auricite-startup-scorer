-- Fix 1: Restrict benchmark_metrics to authenticated users only
DROP POLICY IF EXISTS "Anyone can view benchmarks" ON public.benchmark_metrics;

CREATE POLICY "Authenticated users can view benchmarks"
ON public.benchmark_metrics
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 2: Fix storage policies to prevent anonymous access
DROP POLICY IF EXISTS "Users can view their own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert their own pitch decks" ON storage.objects;

CREATE POLICY "Authenticated users can view their own pitch decks"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-decks' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their own pitch decks"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pitch-decks' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can insert their own pitch decks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitch-decks' 
  AND auth.uid() IS NOT NULL 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 3: Ensure critical functions have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(role::text, 'free')
  FROM public.user_roles
  WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_paid_access(user_uuid uuid, access_type_param text)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_access 
    WHERE user_id = user_uuid 
    AND access_type = access_type_param
    AND (expires_at IS NULL OR expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND sp.name IN ('Premium', 'Advanced')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  );
$$;