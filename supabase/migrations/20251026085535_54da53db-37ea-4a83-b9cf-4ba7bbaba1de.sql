-- =====================================================
-- INVESTOR AND STARTUP DIRECTORIES
-- Tables for storing investor and startup information
-- Designed for Zoho CRM integration
-- =====================================================

-- =====================================================
-- Investor Directory Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.investor_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name text NOT NULL,
  organization text,
  title text,
  email text,
  phone text,
  website text,
  linkedin_url text,
  
  -- Investment Preferences
  sectors text[] DEFAULT '{}',
  stages text[] DEFAULT '{}',
  regions text[] DEFAULT '{}',
  ticket_min bigint,
  ticket_max bigint,
  
  -- Additional Details
  bio text,
  portfolio_companies text[],
  notable_investments text,
  investment_thesis text,
  
  -- Status and Visibility
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'premium')),
  
  -- Zoho CRM Integration
  zoho_contact_id text UNIQUE,
  zoho_account_id text,
  zoho_last_sync timestamp with time zone,
  zoho_sync_status text DEFAULT 'pending' CHECK (zoho_sync_status IN ('pending', 'synced', 'failed')),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(organization, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(bio, '')), 'B')
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_directory_sectors ON public.investor_directory USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_investor_directory_stages ON public.investor_directory USING GIN(stages);
CREATE INDEX IF NOT EXISTS idx_investor_directory_regions ON public.investor_directory USING GIN(regions);
CREATE INDEX IF NOT EXISTS idx_investor_directory_search ON public.investor_directory USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_investor_directory_zoho ON public.investor_directory(zoho_contact_id);
CREATE INDEX IF NOT EXISTS idx_investor_directory_visibility ON public.investor_directory(visibility, is_active);

-- RLS Policies
ALTER TABLE public.investor_directory ENABLE ROW LEVEL SECURITY;

-- Public investors are visible to all authenticated users
CREATE POLICY "Public investors visible to authenticated users"
ON public.investor_directory
FOR SELECT
TO authenticated
USING (visibility = 'public' AND is_active = true);

-- Admins can view all investors
CREATE POLICY "Admins can view all investors"
ON public.investor_directory
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can manage investors
CREATE POLICY "Admins can manage investors"
ON public.investor_directory
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Service role for Zoho sync
CREATE POLICY "Service role can manage for Zoho sync"
ON public.investor_directory
FOR ALL
TO authenticated
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- =====================================================
-- Startup Directory Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.startup_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  company_name text NOT NULL,
  tagline text,
  description text,
  website text,
  email text,
  phone text,
  founded_year integer,
  
  -- Founder Information
  founder_name text,
  founder_email text,
  founder_linkedin text,
  team_size text,
  
  -- Business Details
  sector text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth')),
  location text,
  region text,
  
  -- Funding Information
  funding_raised bigint,
  funding_goal bigint,
  current_mrr bigint,
  has_revenue boolean DEFAULT false,
  
  -- Investment Readiness
  readiness_score integer CHECK (readiness_score >= 0 AND readiness_score <= 100),
  assessment_id uuid REFERENCES public.assessments(id),
  
  -- Additional Details
  pitch_deck_url text,
  one_pager_url text,
  video_url text,
  key_metrics jsonb DEFAULT '{}',
  
  -- Status and Visibility
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'premium')),
  seeking_funding boolean DEFAULT true,
  
  -- Zoho CRM Integration
  zoho_deal_id text UNIQUE,
  zoho_account_id text,
  zoho_last_sync timestamp with time zone,
  zoho_sync_status text DEFAULT 'pending' CHECK (zoho_sync_status IN ('pending', 'synced', 'failed')),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(company_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(sector, '')), 'B')
  ) STORED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_startup_directory_sector ON public.startup_directory(sector);
CREATE INDEX IF NOT EXISTS idx_startup_directory_stage ON public.startup_directory(stage);
CREATE INDEX IF NOT EXISTS idx_startup_directory_region ON public.startup_directory(region);
CREATE INDEX IF NOT EXISTS idx_startup_directory_score ON public.startup_directory(readiness_score DESC);
CREATE INDEX IF NOT EXISTS idx_startup_directory_search ON public.startup_directory USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_startup_directory_zoho ON public.startup_directory(zoho_deal_id);
CREATE INDEX IF NOT EXISTS idx_startup_directory_visibility ON public.startup_directory(visibility, is_active, seeking_funding);

-- RLS Policies
ALTER TABLE public.startup_directory ENABLE ROW LEVEL SECURITY;

-- Public startups visible to authenticated users
CREATE POLICY "Public startups visible to authenticated users"
ON public.startup_directory
FOR SELECT
TO authenticated
USING (visibility = 'public' AND is_active = true);

-- Users can view their own startups
CREATE POLICY "Users can view their own startups"
ON public.startup_directory
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can manage their own startups
CREATE POLICY "Users can manage their own startups"
ON public.startup_directory
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all startups
CREATE POLICY "Admins can view all startups"
ON public.startup_directory
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can manage all startups
CREATE POLICY "Admins can manage all startups"
ON public.startup_directory
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Service role for Zoho sync
CREATE POLICY "Service role can manage for Zoho sync"
ON public.startup_directory
FOR ALL
TO authenticated
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text))
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- =====================================================
-- Triggers for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_directory_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_investor_directory_timestamp
BEFORE UPDATE ON public.investor_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_directory_timestamp();

CREATE TRIGGER update_startup_directory_timestamp
BEFORE UPDATE ON public.startup_directory
FOR EACH ROW
EXECUTE FUNCTION public.update_directory_timestamp();

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE public.investor_directory IS 'Directory of investors with Zoho CRM integration for fundraising';
COMMENT ON TABLE public.startup_directory IS 'Directory of startups with investment readiness scores and Zoho CRM integration';
COMMENT ON COLUMN public.investor_directory.zoho_contact_id IS 'Zoho CRM Contact ID for sync';
COMMENT ON COLUMN public.startup_directory.zoho_deal_id IS 'Zoho CRM Deal ID for sync';