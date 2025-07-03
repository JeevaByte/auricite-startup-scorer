
-- Create user_feedback table for collecting user feedback
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  section TEXT NOT NULL CHECK (section IN ('scoring', 'recommendations', 'overall')),
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  feedback TEXT,
  assessment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for user_feedback
CREATE POLICY "Users can create feedback" 
  ON public.user_feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback" 
  ON public.user_feedback 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create assessment_history table for tracking user progress
CREATE TABLE public.assessment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  assessment_data JSONB NOT NULL,
  score_result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for assessment_history
ALTER TABLE public.assessment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own assessment history" 
  ON public.assessment_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessment history" 
  ON public.assessment_history 
  FOR SELECT 
  USING (auth.uid() = user_id);
