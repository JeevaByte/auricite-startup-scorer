-- Fix assessment_drafts table by adding unique constraint on user_id
-- This is needed for the ON CONFLICT=user_id to work
ALTER TABLE public.assessment_drafts 
ADD CONSTRAINT assessment_drafts_user_id_unique UNIQUE (user_id);

-- Fix funding_goal check constraint by updating valid values
-- First, let's see what the current constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname LIKE '%funding_goal%';