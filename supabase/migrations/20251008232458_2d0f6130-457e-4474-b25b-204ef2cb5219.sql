-- Create score_submetrics table to store detailed KPIs
CREATE TABLE IF NOT EXISTS public.score_submetrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('business_idea', 'team', 'traction', 'financials')),
  
  -- Traction submetrics
  revenue_growth_pct NUMERIC,
  retention_rate NUMERIC,
  cac_ltv_ratio NUMERIC,
  user_acquisition_rate NUMERIC,
  
  -- Team submetrics
  team_completeness NUMERIC,
  domain_expertise NUMERIC,
  advisor_quality NUMERIC,
  hiring_velocity NUMERIC,
  
  -- Business Idea submetrics
  market_size_score NUMERIC,
  product_differentiation NUMERIC,
  scalability_score NUMERIC,
  innovation_index NUMERIC,
  
  -- Financials submetrics
  burn_rate_efficiency NUMERIC,
  runway_adequacy NUMERIC,
  revenue_quality NUMERIC,
  unit_economics NUMERIC,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create score_verifications table for confidence weighting
CREATE TABLE IF NOT EXISTS public.score_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score_id UUID NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  component TEXT NOT NULL CHECK (component IN ('business_idea', 'team', 'traction', 'financials', 'revenue', 'cap_table', 'team_credentials')),
  
  verification_type TEXT NOT NULL CHECK (verification_type IN ('self_reported', 'document_verified', 'third_party_verified', 'audited')),
  confidence_boost NUMERIC NOT NULL DEFAULT 1.0,
  
  verified_by UUID,
  verification_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verification_notes TEXT,
  document_url TEXT,
  expiry_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create benchmark_metrics table for industry comparisons
CREATE TABLE IF NOT EXISTS public.benchmark_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b', 'growth')),
  
  -- Component benchmarks (percentiles)
  business_idea_p25 NUMERIC NOT NULL,
  business_idea_p50 NUMERIC NOT NULL,
  business_idea_p75 NUMERIC NOT NULL,
  
  team_p25 NUMERIC NOT NULL,
  team_p50 NUMERIC NOT NULL,
  team_p75 NUMERIC NOT NULL,
  
  traction_p25 NUMERIC NOT NULL,
  traction_p50 NUMERIC NOT NULL,
  traction_p75 NUMERIC NOT NULL,
  
  financials_p25 NUMERIC NOT NULL,
  financials_p50 NUMERIC NOT NULL,
  financials_p75 NUMERIC NOT NULL,
  
  -- Submetric benchmarks
  revenue_growth_benchmark NUMERIC,
  retention_benchmark NUMERIC,
  cac_ltv_benchmark NUMERIC,
  
  sample_size INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.score_submetrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for score_submetrics
DROP POLICY IF EXISTS "Users can view their own submetrics" ON public.score_submetrics;
CREATE POLICY "Users can view their own submetrics"
  ON public.score_submetrics FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert submetrics" ON public.score_submetrics;
CREATE POLICY "System can insert submetrics"
  ON public.score_submetrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own submetrics" ON public.score_submetrics;
CREATE POLICY "Users can update their own submetrics"
  ON public.score_submetrics FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for score_verifications
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.score_verifications;
CREATE POLICY "Users can view their own verifications"
  ON public.score_verifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create verifications" ON public.score_verifications;
CREATE POLICY "Users can create verifications"
  ON public.score_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can verify components" ON public.score_verifications;
CREATE POLICY "Admins can verify components"
  ON public.score_verifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- RLS Policies for benchmark_metrics
DROP POLICY IF EXISTS "Anyone can view benchmarks" ON public.benchmark_metrics;
CREATE POLICY "Anyone can view benchmarks"
  ON public.benchmark_metrics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage benchmarks" ON public.benchmark_metrics;
CREATE POLICY "Admins can manage benchmarks"
  ON public.benchmark_metrics FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_score_submetrics_score_id ON public.score_submetrics(score_id);
CREATE INDEX IF NOT EXISTS idx_score_submetrics_user_id ON public.score_submetrics(user_id);
CREATE INDEX IF NOT EXISTS idx_score_verifications_user_id ON public.score_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_score_verifications_score_id ON public.score_verifications(score_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_metrics_sector_stage ON public.benchmark_metrics(sector, stage);

-- Insert sample benchmark data (using ON CONFLICT to avoid duplicates)
INSERT INTO public.benchmark_metrics (sector, stage, business_idea_p25, business_idea_p50, business_idea_p75, team_p25, team_p50, team_p75, traction_p25, traction_p50, traction_p75, financials_p25, financials_p50, financials_p75, revenue_growth_benchmark, retention_benchmark, cac_ltv_benchmark, sample_size)
VALUES
  ('B2B SaaS', 'pre-seed', 45, 60, 75, 50, 65, 80, 30, 45, 60, 40, 55, 70, 15, 60, 1.5, 250),
  ('B2B SaaS', 'seed', 55, 70, 85, 60, 75, 85, 50, 65, 80, 55, 70, 85, 25, 70, 2.0, 180),
  ('FinTech', 'pre-seed', 50, 65, 80, 55, 70, 85, 35, 50, 65, 45, 60, 75, 20, 65, 1.8, 150),
  ('FinTech', 'seed', 60, 75, 88, 65, 78, 90, 55, 70, 85, 60, 75, 88, 30, 75, 2.5, 120),
  ('B2C Consumer', 'pre-seed', 40, 55, 70, 45, 60, 75, 25, 40, 55, 35, 50, 65, 10, 50, 1.2, 200),
  ('E-commerce', 'seed', 50, 65, 80, 55, 70, 82, 45, 60, 75, 50, 65, 80, 20, 55, 1.5, 100)
ON CONFLICT DO NOTHING;