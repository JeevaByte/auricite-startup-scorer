
-- Add webhook management table
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on webhook_configs
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage webhooks
CREATE POLICY "Admins can manage webhook configs" 
  ON public.webhook_configs 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Add assessment edit tracking
CREATE TABLE public.assessment_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  edit_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assessment_edits
ALTER TABLE public.assessment_edits ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view edit history
CREATE POLICY "Admins can view assessment edits" 
  ON public.assessment_edits 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Create policy for admins to create edit records
CREATE POLICY "Admins can create assessment edits" 
  ON public.assessment_edits 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Add abuse detection table
CREATE TABLE public.abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  assessment_id UUID REFERENCES assessments(id),
  report_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on abuse_reports
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage abuse reports
CREATE POLICY "Admins can manage abuse reports" 
  ON public.abuse_reports 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));

-- Add honeypot submissions table for bot detection
CREATE TABLE public.honeypot_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET,
  user_agent TEXT,
  submission_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on honeypot_submissions
ALTER TABLE public.honeypot_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for system to insert honeypot data
CREATE POLICY "System can insert honeypot submissions" 
  ON public.honeypot_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for admins to view honeypot data
CREATE POLICY "Admins can view honeypot submissions" 
  ON public.honeypot_submissions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = auth.uid()
  ));
