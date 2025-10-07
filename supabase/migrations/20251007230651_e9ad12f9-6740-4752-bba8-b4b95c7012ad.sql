-- Two-Factor Authentication (2FA) tables
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT false,
  enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own 2FA settings"
ON public.user_2fa
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Feature Flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[],
  target_roles TEXT[],
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature flags"
ON public.feature_flags
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "All authenticated users can read feature flags"
ON public.feature_flags
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- User Impersonation Logs
CREATE TABLE IF NOT EXISTS public.impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  reason TEXT NOT NULL,
  actions_taken JSONB DEFAULT '[]',
  ip_address INET,
  user_agent TEXT
);

ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view impersonation logs"
ON public.impersonation_logs
FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- GDPR Data Export Requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  export_type TEXT NOT NULL DEFAULT 'full' CHECK (export_type IN ('full', 'partial')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  download_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data export requests"
ON public.data_export_requests
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all export requests"
ON public.data_export_requests
FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Error Tracking table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id),
  context JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  url TEXT
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert errors"
ON public.error_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view and manage errors"
ON public.error_logs
FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Performance Metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  user_id UUID REFERENCES auth.users(id),
  context JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can insert metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view metrics"
ON public.performance_metrics
FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON public.impersonation_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_target ON public.impersonation_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON public.data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON public.error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.performance_metrics(metric_type, recorded_at);

-- Function to check if feature is enabled for user
CREATE OR REPLACE FUNCTION public.is_feature_enabled(
  _flag_key TEXT,
  _user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flag_record RECORD;
  user_role TEXT;
BEGIN
  -- Get feature flag
  SELECT * INTO flag_record
  FROM public.feature_flags
  WHERE flag_key = _flag_key;
  
  -- If flag doesn't exist or is disabled globally, return false
  IF NOT FOUND OR NOT flag_record.enabled THEN
    RETURN false;
  END IF;
  
  -- If user is in target users list, return true
  IF _user_id = ANY(flag_record.target_users) THEN
    RETURN true;
  END IF;
  
  -- Check if user's role is in target roles
  SELECT role::TEXT INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  IF user_role = ANY(flag_record.target_roles) THEN
    RETURN true;
  END IF;
  
  -- Check rollout percentage (simple hash-based distribution)
  IF flag_record.rollout_percentage > 0 THEN
    RETURN (hashtext(_user_id::TEXT || _flag_key) % 100) < flag_record.rollout_percentage;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action TEXT,
  _target_table TEXT,
  _target_id UUID,
  _details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    new_values,
    user_id
  ) VALUES (
    _target_table,
    _target_id,
    _action,
    _details,
    auth.uid()
  );
END;
$$;