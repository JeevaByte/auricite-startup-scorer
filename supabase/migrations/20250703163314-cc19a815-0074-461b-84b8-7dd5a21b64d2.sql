
-- Add user_id column to ai_responses table for proper user isolation
ALTER TABLE public.ai_responses ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Drop the existing overly permissive RLS policies
DROP POLICY IF EXISTS "Authenticated users can view ai_responses" ON public.ai_responses;
DROP POLICY IF EXISTS "Authenticated users can create ai_responses" ON public.ai_responses;

-- Create new user-specific RLS policies
CREATE POLICY "Users can view their own ai_responses" 
  ON public.ai_responses FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own ai_responses" 
  ON public.ai_responses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_ai_responses_user_id ON public.ai_responses(user_id);
