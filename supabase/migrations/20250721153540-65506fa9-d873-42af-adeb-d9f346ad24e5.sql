-- Instead of deleting, update all existing invalid funding_goal values to valid ones
UPDATE public.assessments 
SET funding_goal = CASE 
  WHEN funding_goal = 'mvp' THEN '100k'
  WHEN funding_goal = 'scale' THEN '1m'
  WHEN funding_goal NOT IN ('50k', '100k', '500k', '1m', '5m', '10m+') THEN '100k'
  ELSE funding_goal
END
WHERE funding_goal NOT IN ('50k', '100k', '500k', '1m', '5m', '10m+');

-- Now add the constraints safely
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