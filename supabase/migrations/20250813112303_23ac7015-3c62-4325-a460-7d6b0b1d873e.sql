-- Harden RLS: restrict previously anonymous-readable tables to authenticated users only
BEGIN;

-- scoring_config: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read scoring config" ON public.scoring_config;
CREATE POLICY "Authenticated users can read scoring config"
ON public.scoring_config
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- scoring_config_history: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read scoring history" ON public.scoring_config_history;
CREATE POLICY "Authenticated users can read scoring history"
ON public.scoring_config_history
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- benchmark_data: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can view benchmark data" ON public.benchmark_data;
CREATE POLICY "Authenticated users can view benchmark data"
ON public.benchmark_data
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- scoring_validation_rules: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can read validation rules" ON public.scoring_validation_rules;
CREATE POLICY "Authenticated users can read validation rules"
ON public.scoring_validation_rules
FOR SELECT
USING (auth.uid() IS NOT NULL);

COMMIT;