-- Security fixes migration

-- 1. Fix database function security - update log_crm_access function to use secure search_path
CREATE OR REPLACE FUNCTION public.log_crm_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Log access to sensitive CRM data
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    user_id
  ) VALUES (
    'crm_contacts',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) 
         WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) 
         ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)
         WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW)
         ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. Tighten RLS policies - Fix overly permissive donations update policy
DROP POLICY IF EXISTS "System can update donations" ON public.donations;
CREATE POLICY "System can update donations" ON public.donations
FOR UPDATE
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 3. Fix user_access RLS policy to be more restrictive
DROP POLICY IF EXISTS "System can manage access" ON public.user_access;
CREATE POLICY "System can manage access" ON public.user_access
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text OR EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
))
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text OR EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

-- 4. Improve INSERT policies to include proper user_id checks where missing
DROP POLICY IF EXISTS "Users can create feedback" ON public.user_feedback;
CREATE POLICY "Users can create feedback" ON public.user_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "System can insert honeypot submissions" ON public.honeypot_submissions;
CREATE POLICY "System can insert honeypot submissions" ON public.honeypot_submissions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Add security event for failed login attempts tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  attempt_time timestamp with time zone DEFAULT now(),
  reason text
);

-- Enable RLS on failed_login_attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policy for failed_login_attempts (admin access only)
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()
));

CREATE POLICY "System can log failed attempts" ON public.failed_login_attempts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Create function to clean up old security events (data retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Delete security events older than 1 year
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '1 year';
  
  -- Delete failed login attempts older than 6 months
  DELETE FROM public.failed_login_attempts 
  WHERE attempt_time < now() - interval '6 months';
  
  -- Delete audit logs older than 2 years (keep longer for compliance)
  DELETE FROM public.audit_log 
  WHERE created_at < now() - interval '2 years';
END;
$function$;