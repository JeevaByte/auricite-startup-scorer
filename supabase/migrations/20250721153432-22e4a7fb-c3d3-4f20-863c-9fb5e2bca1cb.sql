-- Drop ALL check constraints on assessments table to start fresh
ALTER TABLE public.assessments 
DROP CONSTRAINT IF EXISTS assessments_funding_goal_check,
DROP CONSTRAINT IF EXISTS assessments_mrr_check,
DROP CONSTRAINT IF EXISTS assessments_employees_check,
DROP CONSTRAINT IF EXISTS assessments_investors_check,
DROP CONSTRAINT IF EXISTS assessments_milestones_check;

-- Add all the correct constraints that match the AssessmentWizard form values
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