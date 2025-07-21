-- Drop the old constraint and add the correct one with proper funding goal values
ALTER TABLE public.assessments 
DROP CONSTRAINT IF EXISTS assessments_funding_goal_check;

-- Add the correct constraint that matches the assessment wizard form values
ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_funding_goal_check 
CHECK (funding_goal = ANY (ARRAY['50k'::text, '100k'::text, '500k'::text, '1m'::text, '5m'::text, '10m+'::text]));

-- Also check the other constraints to make sure they match
-- Check MRR constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%mrr%' AND conrelid = 'public.assessments'::regclass;

-- Check employees constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%employees%' AND conrelid = 'public.assessments'::regclass;

-- Check investors constraint  
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%investors%' AND conrelid = 'public.assessments'::regclass;

-- Check milestones constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%milestones%' AND conrelid = 'public.assessments'::regclass;