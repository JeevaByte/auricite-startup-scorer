-- =====================================================
-- CRITICAL SECURITY FIXES - ERROR LEVEL ISSUES
-- =====================================================

-- =====================================================
-- FIX 0: Create app_role enum if it doesn't exist
-- =====================================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'free', 'investor', 'fundraiser');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- FIX 1: Add SET search_path to all SECURITY DEFINER functions
-- This prevents privilege escalation attacks
-- =====================================================

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = 'admin'
  );
$$;

-- Fix has_premium_access function
CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix has_paid_access function
CREATE OR REPLACE FUNCTION public.has_paid_access(user_uuid uuid, access_type_param text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
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

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(role::text, 'free')
  FROM public.user_roles
  WHERE user_id = user_uuid;
$$;

-- Fix is_organization_admin function
CREATE OR REPLACE FUNCTION public.is_organization_admin(user_uuid uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = user_uuid 
    AND organization_id = org_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Fix get_user_organization_role function
CREATE OR REPLACE FUNCTION public.get_user_organization_role(user_uuid uuid, org_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = user_uuid AND organization_id = org_id
  LIMIT 1;
$$;

-- Fix is_syndicate_member function
CREATE OR REPLACE FUNCTION public.is_syndicate_member(_user_id uuid, _syndicate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.syndicate_members
    WHERE syndicate_id = _syndicate_id
      AND investor_id = _user_id
  );
$$;

-- Fix get_user_organizations function
CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id uuid)
RETURNS TABLE(organization_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = _user_id;
$$;

-- Fix is_feature_enabled function
CREATE OR REPLACE FUNCTION public.is_feature_enabled(_flag_key text, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  flag_record RECORD;
  user_role TEXT;
BEGIN
  SELECT * INTO flag_record
  FROM public.feature_flags
  WHERE flag_key = _flag_key;
  
  IF NOT FOUND OR NOT flag_record.enabled THEN
    RETURN false;
  END IF;
  
  IF _user_id = ANY(flag_record.target_users) THEN
    RETURN true;
  END IF;
  
  SELECT role::TEXT INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  IF user_role = ANY(flag_record.target_roles) THEN
    RETURN true;
  END IF;
  
  IF flag_record.rollout_percentage > 0 THEN
    RETURN (hashtext(_user_id::TEXT || _flag_key) % 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN false;
END;
$$;

-- =====================================================
-- FIX 2 & 3: Restrict profiles table to owner-only access
-- Prevents email harvesting and unauthorized access
-- =====================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;

-- Create strict owner-only SELECT policy
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Keep update and insert policies restricted to owner
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add admin-only access for support purposes
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- =====================================================
-- FIX 4: Secure crm_contacts table with proper RLS
-- Prevents unauthorized access to sensitive customer data
-- =====================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Admins can manage CRM contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Service role can manage CRM contacts" ON public.crm_contacts;

-- Create admin-only policies using the security definer function
CREATE POLICY "Only admins can view CRM contacts"
ON public.crm_contacts
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert CRM contacts"
ON public.crm_contacts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update CRM contacts"
ON public.crm_contacts
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete CRM contacts"
ON public.crm_contacts
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow service role full access for system operations
CREATE POLICY "Service role can manage CRM contacts"
ON public.crm_contacts
FOR ALL
TO authenticated
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- =====================================================
-- FIX 5: Secure assessments table - admin access control
-- Ensures admins can view assessments through RLS, not client
-- =====================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;

-- Owner can view their own assessments
CREATE POLICY "Users can view their own assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Keep insert/update restricted to owner (delete policy doesn't exist, that's fine)
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
CREATE POLICY "Users can update their own assessments"
ON public.assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FIX 6: Secure scores table - admin access control
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own scores" ON public.scores;

-- Recreate with owner and admin access
CREATE POLICY "Users can view their own scores"
ON public.scores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scores"
ON public.scores
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- =====================================================
-- FIX 7: Secure audit_log - admin-only access
-- =====================================================

-- Drop existing overly restrictive policy
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;

-- Create proper policies
CREATE POLICY "Only admins can view audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- SECURITY AUDIT: Document changes
-- =====================================================
COMMENT ON FUNCTION public.is_admin IS 'SECURITY: Returns true if user is admin. Uses SET search_path for security.';
COMMENT ON TABLE public.profiles IS 'SECURITY: Owner-only access enforced via RLS. Admins have override access.';
COMMENT ON TABLE public.crm_contacts IS 'SECURITY: Admin-only access enforced via RLS using is_admin() function.';
COMMENT ON TABLE public.assessments IS 'SECURITY: Owner and admin access enforced via RLS.';
COMMENT ON TABLE public.audit_log IS 'SECURITY: Admin-only SELECT, all authenticated users can INSERT for logging.';