-- Create security_events table for centralized logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  user_id UUID NULL,
  details TEXT NOT NULL,
  user_agent TEXT NULL,
  ip_address INET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to insert; only admins can read
DROP POLICY IF EXISTS "Anyone can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can read security events" ON public.security_events;

CREATE POLICY "Authenticated can insert security events"
ON public.security_events
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read security events"
ON public.security_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au WHERE au.user_id = auth.uid()
  )
);

-- Tighten ai_responses select policy (remove null-user visibility)
DROP POLICY IF EXISTS "Users can view their own ai_responses" ON public.ai_responses;
CREATE POLICY "Users can view their own ai_responses"
ON public.ai_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Tighten user_feedback select policy (remove null-user visibility)
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.user_feedback;
CREATE POLICY "Users can view their own feedback"
ON public.user_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure scoring config/history readable only by authenticated
DROP POLICY IF EXISTS "Authenticated users can read scoring config" ON public.scoring_config;
CREATE POLICY "Authenticated users can read scoring config"
ON public.scoring_config
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read scoring history" ON public.scoring_config_history;
CREATE POLICY "Authenticated users can read scoring history"
ON public.scoring_config_history
FOR SELECT
TO authenticated
USING (true);

-- Benchmark data readable only by authenticated
DROP POLICY IF EXISTS "Authenticated users can view benchmark data" ON public.benchmark_data;
CREATE POLICY "Authenticated users can view benchmark data"
ON public.benchmark_data
FOR SELECT
TO authenticated
USING (true);
