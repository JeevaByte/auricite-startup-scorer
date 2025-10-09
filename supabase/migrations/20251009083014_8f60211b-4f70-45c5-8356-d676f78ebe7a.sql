-- Migration: Fix Critical Security Vulnerabilities (Final)

-- Part 1: Create Security Definer Helper Functions

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id uuid)
RETURNS TABLE(organization_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = _user_id;
$$;

-- Part 2: Fix User Roles RLS Policies

DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage user roles" ON public.user_roles;

CREATE POLICY "Service role can manage user roles"
ON public.user_roles
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Part 3: Restore Payment Access Control

CREATE OR REPLACE FUNCTION public.has_paid_access(user_uuid uuid, access_type_param text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Part 4: Fix Organization Policies

DROP POLICY IF EXISTS "Members can view their organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners and admins can manage members" ON public.organization_members;

CREATE POLICY "Users can view members of their organizations"
ON public.organization_members
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.get_user_organizations(auth.uid())
  )
);

CREATE POLICY "Organization owners and admins can manage members"
ON public.organization_members
FOR ALL
USING (
  public.is_organization_admin(auth.uid(), organization_id)
)
WITH CHECK (
  public.is_organization_admin(auth.uid(), organization_id)
);

-- Part 5: Update Admin Policies

DROP POLICY IF EXISTS "Admins can manage abuse reports" ON public.abuse_reports;
CREATE POLICY "Admins can manage abuse reports"
ON public.abuse_reports
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;
CREATE POLICY "Admins can read audit logs"
ON public.audit_log
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view API logs" ON public.api_access_logs;
CREATE POLICY "Admins can view API logs"
ON public.api_access_logs
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.feature_flags;
CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage benchmarks" ON public.benchmark_metrics;
CREATE POLICY "Admins can manage benchmarks"
ON public.benchmark_metrics
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage benchmark data" ON public.benchmark_startups;
CREATE POLICY "Admins can manage benchmark data"
ON public.benchmark_startups
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view and manage errors" ON public.error_logs;
CREATE POLICY "Admins can view and manage errors"
ON public.error_logs
FOR ALL
USING (public.is_admin(auth.uid()));

-- Part 6: Add search_path to functions

CREATE OR REPLACE FUNCTION public.grant_access_after_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.user_access (user_id, access_type, granted_by, reference_id)
    VALUES 
      (NEW.user_id, 'investor_directory', 'donation', NEW.id),
      (NEW.user_id, 'learning_resources', 'donation', NEW.id),
      (NEW.user_id, 'pitch_upload', 'donation', NEW.id)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.crm_contacts (user_id, email, total_donations, last_donation_date)
    VALUES (NEW.user_id, NEW.email, NEW.amount, NEW.updated_at)
    ON CONFLICT (email) DO UPDATE SET
      total_donations = crm_contacts.total_donations + NEW.amount,
      last_donation_date = NEW.updated_at,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;