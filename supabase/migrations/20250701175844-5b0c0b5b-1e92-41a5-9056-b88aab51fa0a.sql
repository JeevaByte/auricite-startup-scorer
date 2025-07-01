
-- Create assessment_drafts table for saving user progress
CREATE TABLE public.assessment_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  draft_data JSONB NOT NULL,
  step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assessment_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessment_drafts
CREATE POLICY "Users can view their own drafts" 
  ON public.assessment_drafts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drafts" 
  ON public.assessment_drafts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drafts" 
  ON public.assessment_drafts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drafts" 
  ON public.assessment_drafts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_assessment_drafts_user_id ON public.assessment_drafts(user_id);
CREATE INDEX idx_assessment_drafts_updated_at ON public.assessment_drafts(updated_at DESC);
