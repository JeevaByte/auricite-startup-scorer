
-- Create a table for storing gamification badges
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) NOT NULL,
  badge_name TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own badges
CREATE POLICY "Users can view their own badges" 
  ON public.badges 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own badges
CREATE POLICY "Users can create their own badges" 
  ON public.badges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own badges
CREATE POLICY "Users can update their own badges" 
  ON public.badges 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own badges
CREATE POLICY "Users can delete their own badges" 
  ON public.badges 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for better performance when querying badges by user
CREATE INDEX idx_badges_user_id ON public.badges(user_id);
CREATE INDEX idx_badges_assessment_id ON public.badges(assessment_id);
