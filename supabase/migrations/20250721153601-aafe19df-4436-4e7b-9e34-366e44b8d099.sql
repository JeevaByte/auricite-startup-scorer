-- Start completely fresh - drop ALL data and constraints
TRUNCATE public.assessments CASCADE;
TRUNCATE public.scores CASCADE;
TRUNCATE public.badges CASCADE;

-- Remove all existing constraints
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = 'public.assessments'::regclass AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.assessments DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Now add the correct constraints
ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_funding_goal_check 
CHECK (funding_goal = ANY (ARRAY['50k'::text, '100k'::text, '500k'::text, '1m'::text, '5m'::text, '10m+'::text]));

ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_mrr_check 
CHECK (mrr = ANY (ARRAY['none'::text, 'low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_employees_check 
CHECK (employees = ANY (ARRAY['1-2'::text, '3-10'::text, '11-50'::text, '50+'::text]));

ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_investors_check 
CHECK (investors = ANY (ARRAY['none'::text, 'angels'::text, 'vc'::text, 'lateStage'::text]));

ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_milestones_check 
CHECK (milestones = ANY (ARRAY['concept'::text, 'launch'::text, 'scale'::text, 'exit'::text]));