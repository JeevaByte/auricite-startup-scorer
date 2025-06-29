
-- Create assessments table to store the 11-question form responses
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  prototype BOOLEAN NOT NULL,
  external_capital BOOLEAN NOT NULL,
  revenue BOOLEAN NOT NULL,
  full_time_team BOOLEAN NOT NULL,
  term_sheets BOOLEAN NOT NULL,
  cap_table BOOLEAN NOT NULL,
  mrr TEXT NOT NULL CHECK (mrr IN ('none', 'low', 'medium', 'high')),
  employees TEXT NOT NULL CHECK (employees IN ('1-2', '3-10', '11-50', '50+')),
  funding_goal TEXT NOT NULL CHECK (funding_goal IN ('mvp', 'productMarketFit', 'scale', 'exit')),
  investors TEXT NOT NULL CHECK (investors IN ('none', 'angels', 'vc', 'lateStage')),
  milestones TEXT NOT NULL CHECK (milestones IN ('concept', 'launch', 'scale', 'exit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scores table to store calculated results
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_idea INTEGER NOT NULL CHECK (business_idea >= 0 AND business_idea <= 100),
  business_idea_explanation TEXT NOT NULL,
  financials INTEGER NOT NULL CHECK (financials >= 0 AND financials <= 100),
  financials_explanation TEXT NOT NULL,
  team INTEGER NOT NULL CHECK (team >= 0 AND team <= 100),
  team_explanation TEXT NOT NULL,
  traction INTEGER NOT NULL CHECK (traction >= 0 AND traction <= 100),
  traction_explanation TEXT NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 999),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_responses table for caching AI API responses
CREATE TABLE public.ai_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_data JSONB NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Users can view their own assessments" 
  ON public.assessments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
  ON public.assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
  ON public.assessments FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for scores
CREATE POLICY "Users can view their own scores" 
  ON public.scores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scores" 
  ON public.scores FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for ai_responses (allow all authenticated users to read cached responses)
CREATE POLICY "Authenticated users can view ai_responses" 
  ON public.ai_responses FOR SELECT 
  TO authenticated;

CREATE POLICY "Authenticated users can create ai_responses" 
  ON public.ai_responses FOR INSERT 
  TO authenticated;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_scores_assessment_id ON public.scores(assessment_id);
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_ai_responses_created_at ON public.ai_responses(created_at DESC);
