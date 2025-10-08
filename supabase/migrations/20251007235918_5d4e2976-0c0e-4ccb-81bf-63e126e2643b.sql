-- Organizations & Teams Management
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, manager, analyst, member
  permissions JSONB DEFAULT '{}',
  invited_by UUID,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- White-Labeling & Tenant Branding
CREATE TABLE public.tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  custom_domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  favicon_url TEXT,
  custom_css TEXT,
  show_powered_by BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scheduled Reports
CREATE TABLE public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL, -- investment_summary, portfolio_analytics, risk_report
  frequency TEXT NOT NULL, -- daily, weekly, monthly
  format TEXT NOT NULL DEFAULT 'pdf', -- pdf, csv, json
  recipients TEXT[] DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Health Metrics
CREATE TABLE public.system_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL, -- healthy, degraded, down
  response_time_ms NUMERIC,
  error_rate NUMERIC,
  uptime_percentage NUMERIC,
  last_check_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- API Access Logs (for versioning & documentation)
CREATE TABLE public.api_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  version TEXT NOT NULL, -- v1, v2
  status_code INTEGER NOT NULL,
  response_time_ms NUMERIC,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Background Jobs Queue
CREATE TABLE public.background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- rescore, report_generation, data_sync
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for Organization Members
CREATE POLICY "Members can view their organization members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage organization members"
  ON public.organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Tenant Branding
CREATE POLICY "Organization members can view their branding"
  ON public.tenant_branding FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners/admins can manage branding"
  ON public.tenant_branding FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- RLS Policies for Scheduled Reports
CREATE POLICY "Users can manage their own scheduled reports"
  ON public.scheduled_reports FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for System Health
CREATE POLICY "Admins can view system health"
  ON public.system_health_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for API Logs
CREATE POLICY "Admins can view API logs"
  ON public.api_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for Background Jobs
CREATE POLICY "Admins can manage background jobs"
  ON public.background_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION public.get_user_organization_role(user_uuid UUID, org_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = user_uuid AND organization_id = org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_organization_admin(user_uuid UUID, org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = user_uuid 
    AND organization_id = org_id 
    AND role IN ('owner', 'admin')
  );
$$;

-- Indexes for performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_scheduled_reports_next ON public.scheduled_reports(next_scheduled_at) WHERE is_active = true;
CREATE INDEX idx_background_jobs_status ON public.background_jobs(status, scheduled_at);
CREATE INDEX idx_api_logs_created ON public.api_access_logs(created_at DESC);
CREATE INDEX idx_system_health_service ON public.system_health_metrics(service_name, last_check_at DESC);