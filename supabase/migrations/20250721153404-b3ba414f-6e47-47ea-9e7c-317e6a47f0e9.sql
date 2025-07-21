-- First, update the existing data to match the new constraint values
-- Map the old values to new values
UPDATE public.assessments 
SET funding_goal = CASE 
  WHEN funding_goal = 'mvp' THEN '100k'
  WHEN funding_goal = 'productMarketFit' THEN '500k' 
  WHEN funding_goal = 'scale' THEN '1m'
  WHEN funding_goal = 'exit' THEN '5m'
  ELSE funding_goal
END;

-- Now drop the old constraint and add the correct one
ALTER TABLE public.assessments 
DROP CONSTRAINT IF EXISTS assessments_funding_goal_check;

-- Add the correct constraint that matches the assessment wizard form values
ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_funding_goal_check 
CHECK (funding_goal = ANY (ARRAY['50k'::text, '100k'::text, '500k'::text, '1m'::text, '5m'::text, '10m+'::text]));