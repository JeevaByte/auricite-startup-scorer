-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables for advanced scoring system

-- Feature extraction results storage
CREATE TABLE IF NOT EXISTS public.extracted_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Raw extracted features
  revenue NUMERIC,
  users INTEGER,
  growth_rate NUMERIC,
  funding_amount NUMERIC,
  funding_round TEXT,
  market_size NUMERIC,
  team_size INTEGER,
  years_experience NUMERIC,
  
  -- Derived features
  revenue_per_user NUMERIC,
  funding_per_employee NUMERIC,
  growth_momentum NUMERIC,
  
  -- Entity extraction
  organizations JSONB DEFAULT '[]'::jsonb,
  persons JSONB DEFAULT '[]'::jsonb,
  locations JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  extraction_version TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(assessment_id, extraction_version)
);

-- Advanced scoring results with explainability
CREATE TABLE IF NOT EXISTS public.advanced_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  extracted_features_id UUID REFERENCES public.extracted_features(id),
  
  -- Scores by method
  llm_score NUMERIC CHECK (llm_score >= 0 AND llm_score <= 100),
  embedding_score NUMERIC CHECK (embedding_score >= 0 AND embedding_score <= 100),
  ml_model_score NUMERIC CHECK (ml_model_score >= 0 AND ml_model_score <= 100),
  
  -- Final ensemble score
  final_score NUMERIC NOT NULL CHECK (final_score >= 0 AND final_score <= 100),
  
  -- Category breakdowns
  innovation_score NUMERIC CHECK (innovation_score >= 0 AND innovation_score <= 100),
  traction_score NUMERIC CHECK (traction_score >= 0 AND traction_score <= 100),
  team_score NUMERIC CHECK (team_score >= 0 AND team_score <= 100),
  market_score NUMERIC CHECK (market_score >= 0 AND market_score <= 100),
  
  -- Confidence and calibration
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  calibrated_score NUMERIC CHECK (calibrated_score >= 0 AND calibrated_score <= 100),
  
  -- Explainability
  explanations JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_strengths JSONB DEFAULT '[]'::jsonb,
  key_weaknesses JSONB DEFAULT '[]'::jsonb,
  contributing_phrases JSONB DEFAULT '{}'::jsonb,
  
  -- Versioning and metadata
  scoring_version TEXT NOT NULL,
  model_version TEXT,
  llm_model TEXT,
  llm_temperature NUMERIC,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(assessment_id, scoring_version)
);

-- Embedding cache for reusability
CREATE TABLE IF NOT EXISTS public.embedding_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  embedding VECTOR(1536),
  model_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Benchmark dataset for stability testing
CREATE TABLE IF NOT EXISTS public.benchmark_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  assessment_data JSONB NOT NULL,
  expected_score_range JSONB NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Score variance tracking for repeatability testing
CREATE TABLE IF NOT EXISTS public.score_variance_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_startup_id UUID REFERENCES public.benchmark_startups(id),
  test_run_id UUID NOT NULL,
  scores JSONB NOT NULL,
  variance NUMERIC,
  mean_score NUMERIC,
  std_deviation NUMERIC,
  passed BOOLEAN,
  scoring_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drift detection monitoring
CREATE TABLE IF NOT EXISTS public.drift_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  baseline_value NUMERIC,
  current_value NUMERIC,
  drift_magnitude NUMERIC,
  threshold_exceeded BOOLEAN DEFAULT false,
  detection_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Scoring audit log for comprehensive tracking
CREATE TABLE IF NOT EXISTS public.scoring_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_status TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_extracted_features_assessment ON public.extracted_features(assessment_id);
CREATE INDEX IF NOT EXISTS idx_extracted_features_user ON public.extracted_features(user_id);
CREATE INDEX IF NOT EXISTS idx_advanced_scores_assessment ON public.advanced_scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_advanced_scores_user ON public.advanced_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON public.embedding_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_scoring_audit_log_assessment ON public.scoring_audit_log(assessment_id);
CREATE INDEX IF NOT EXISTS idx_scoring_audit_log_created ON public.scoring_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drift_monitoring_date ON public.drift_monitoring(detection_date DESC);

-- Enable RLS
ALTER TABLE public.extracted_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advanced_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embedding_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmark_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_variance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drift_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own extracted features"
  ON public.extracted_features FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own advanced scores"
  ON public.advanced_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert extracted features"
  ON public.extracted_features FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert advanced scores"
  ON public.advanced_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all benchmark data"
  ON public.benchmark_startups FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage benchmark data"
  ON public.benchmark_startups FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view drift monitoring"
  ON public.drift_monitoring FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "System can insert drift monitoring"
  ON public.drift_monitoring FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view scoring audit log"
  ON public.scoring_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "System can insert audit logs"
  ON public.scoring_audit_log FOR INSERT
  WITH CHECK (true);

-- Trigger for updating benchmark_startups timestamp
CREATE OR REPLACE FUNCTION update_benchmark_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_benchmark_startups_timestamp
  BEFORE UPDATE ON public.benchmark_startups
  FOR EACH ROW
  EXECUTE FUNCTION update_benchmark_timestamp();