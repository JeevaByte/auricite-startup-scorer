
-- Create table for storing benchmarking data
CREATE TABLE public.benchmark_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  business_idea_avg NUMERIC NOT NULL DEFAULT 0,
  financials_avg NUMERIC NOT NULL DEFAULT 0,
  team_avg NUMERIC NOT NULL DEFAULT 0,
  traction_avg NUMERIC NOT NULL DEFAULT 0,
  total_score_avg NUMERIC NOT NULL DEFAULT 0,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing individual startup clustering data
CREATE TABLE public.startup_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  cluster_id INTEGER NOT NULL,
  percentile_business_idea NUMERIC,
  percentile_financials NUMERIC,
  percentile_team NUMERIC,
  percentile_traction NUMERIC,
  percentile_total NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for benchmark_data (read-only for authenticated users)
ALTER TABLE public.benchmark_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view benchmark data"
  ON public.benchmark_data FOR SELECT
  TO authenticated
  USING (true);

-- Add RLS policies for startup_clusters
ALTER TABLE public.startup_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cluster data"
  ON public.startup_clusters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cluster data"
  ON public.startup_clusters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_benchmark_data_sector_stage ON public.benchmark_data(sector, stage);
CREATE INDEX idx_startup_clusters_user_id ON public.startup_clusters(user_id);
CREATE INDEX idx_startup_clusters_sector_stage ON public.startup_clusters(sector, stage);

-- Insert initial benchmark data for different sectors and stages
INSERT INTO public.benchmark_data (sector, stage, business_idea_avg, financials_avg, team_avg, traction_avg, total_score_avg, sample_size) VALUES
('B2B SaaS', 'pre-seed', 65, 45, 60, 35, 450, 100),
('B2B SaaS', 'seed', 75, 65, 70, 55, 600, 150),
('B2C Consumer', 'pre-seed', 70, 40, 55, 45, 480, 80),
('B2C Consumer', 'seed', 80, 60, 65, 65, 650, 120),
('FinTech', 'pre-seed', 68, 50, 65, 40, 500, 60),
('FinTech', 'seed', 78, 70, 75, 60, 680, 90),
('HealthTech', 'pre-seed', 72, 48, 68, 38, 520, 70),
('HealthTech', 'seed', 82, 68, 78, 58, 700, 100),
('E-commerce', 'pre-seed', 66, 42, 58, 48, 460, 90),
('E-commerce', 'seed', 76, 62, 68, 68, 620, 110);
