-- Temporarily disable access restrictions for beta testing
-- All authenticated users should have access to all features during beta
-- TODO: Re-enable proper access control after beta testing is complete

CREATE OR REPLACE FUNCTION public.has_paid_access(user_uuid uuid, access_type_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  -- BETA MODE: Allow all authenticated users to access all features
  -- Original access control logic is commented out below
  
  SELECT user_uuid IS NOT NULL;
  
  /*
  -- Original access control logic (to be restored after beta)
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
  */
$function$;