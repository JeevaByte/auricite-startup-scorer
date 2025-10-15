-- =====================================================
-- Phase 1: CRITICAL SECURITY FIXES
-- =====================================================

-- =====================================================
-- Fix 1.1: Fix Privilege Escalation in user_roles
-- =====================================================

-- Drop the DANGEROUS policies that allow anyone to modify roles
DROP POLICY IF EXISTS "System can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "System can update user roles" ON public.user_roles;

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Create secure policies: Only admins can manage roles
CREATE POLICY "Only admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Keep service role access for system operations
-- (The existing "Service role can manage user roles" policy is fine)

-- =====================================================
-- Fix 1.2: Fix Infinite Recursion in syndicate_members
-- =====================================================

-- Create a SECURITY DEFINER function to check syndicate membership
CREATE OR REPLACE FUNCTION public.is_syndicate_member(_user_id uuid, _syndicate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.syndicate_members
    WHERE syndicate_id = _syndicate_id
      AND investor_id = _user_id
  );
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Syndicate members can view members" ON public.syndicate_members;

-- Create a new policy using the SECURITY DEFINER function
CREATE POLICY "Syndicate members can view members"
ON public.syndicate_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.investor_syndicates
    WHERE investor_syndicates.id = syndicate_members.syndicate_id
      AND (
        investor_syndicates.is_public = true
        OR auth.uid() = investor_syndicates.lead_investor_id
        OR public.is_syndicate_member(auth.uid(), syndicate_members.syndicate_id)
      )
  )
);

-- =====================================================
-- Fix 1.3: Add Server-Side Rate Limiting
-- =====================================================

-- Create login_attempts table to track failed attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  user_agent text,
  attempt_time timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_time DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
ON public.login_attempts(ip_address, attempt_time DESC);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- System can insert login attempts (for edge functions)
CREATE POLICY "System can insert login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to check if login should be blocked
CREATE OR REPLACE FUNCTION public.should_block_login(
  _email text,
  _ip_address inet DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_attempts integer;
  last_attempt_time timestamp with time zone;
  block_until timestamp with time zone;
  result jsonb;
BEGIN
  -- Check failed attempts in last 15 minutes for this email
  SELECT COUNT(*), MAX(attempt_time), MAX(blocked_until)
  INTO failed_attempts, last_attempt_time, block_until
  FROM public.login_attempts
  WHERE email = _email
    AND success = false
    AND attempt_time > now() - interval '15 minutes';
  
  -- If already blocked, check if block period has expired
  IF block_until IS NOT NULL AND block_until > now() THEN
    RETURN jsonb_build_object(
      'blocked', true,
      'reason', 'Too many failed attempts',
      'blocked_until', block_until,
      'retry_after_seconds', EXTRACT(EPOCH FROM (block_until - now()))::integer
    );
  END IF;
  
  -- Block after 5 failed attempts
  IF failed_attempts >= 5 THEN
    block_until := now() + interval '15 minutes';
    
    -- Update the block time
    UPDATE public.login_attempts
    SET blocked_until = block_until
    WHERE email = _email
      AND attempt_time = last_attempt_time;
    
    RETURN jsonb_build_object(
      'blocked', true,
      'reason', 'Too many failed attempts',
      'blocked_until', block_until,
      'retry_after_seconds', 900
    );
  END IF;
  
  -- Check IP-based rate limiting (more aggressive)
  IF _ip_address IS NOT NULL THEN
    SELECT COUNT(*)
    INTO failed_attempts
    FROM public.login_attempts
    WHERE ip_address = _ip_address
      AND success = false
      AND attempt_time > now() - interval '5 minutes';
    
    IF failed_attempts >= 10 THEN
      RETURN jsonb_build_object(
        'blocked', true,
        'reason', 'Too many failed attempts from this IP',
        'blocked_until', now() + interval '30 minutes',
        'retry_after_seconds', 1800
      );
    END IF;
  END IF;
  
  -- Not blocked
  RETURN jsonb_build_object(
    'blocked', false,
    'failed_attempts', failed_attempts
  );
END;
$$;

-- Create function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  _email text,
  _success boolean,
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (
    email,
    ip_address,
    user_agent,
    success,
    attempt_time
  ) VALUES (
    _email,
    _ip_address,
    _user_agent,
    _success,
    now()
  );
  
  -- Clean up old records (keep only last 7 days)
  DELETE FROM public.login_attempts
  WHERE attempt_time < now() - interval '7 days';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.should_block_login(text, inet) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, inet, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_syndicate_member(uuid, uuid) TO authenticated;