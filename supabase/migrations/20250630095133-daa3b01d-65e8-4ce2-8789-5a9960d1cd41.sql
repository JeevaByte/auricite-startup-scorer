
-- Create investor_profiles table to store investor assessment data
CREATE TABLE public.investor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  personal_capital BOOLEAN NOT NULL,
  structured_fund BOOLEAN NOT NULL,
  registered_entity BOOLEAN NOT NULL,
  due_diligence BOOLEAN NOT NULL,
  esg_metrics BOOLEAN NOT NULL,
  check_size TEXT NOT NULL CHECK (check_size IN ('low', 'medium', 'high', 'veryHigh')),
  stage TEXT NOT NULL CHECK (stage IN ('preSeed', 'seed', 'seriesB', 'preIPO')),
  deal_source TEXT NOT NULL CHECK (deal_source IN ('personal', 'platforms', 'funds', 'public')),
  frequency TEXT NOT NULL CHECK (frequency IN ('occasional', 'frequent', 'quarterly', 'portfolio')),
  objective TEXT NOT NULL CHECK (objective IN ('support', 'returns', 'strategic', 'impact')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor_classifications table to store AI classification results
CREATE TABLE public.investor_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.investor_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Angel', 'VC', 'Family Office', 'Institutional', 'Crowdfunding')),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor_matches table for startup-investor matching
CREATE TABLE public.investor_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_user_id UUID REFERENCES auth.users NOT NULL,
  investor_user_id UUID REFERENCES auth.users NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) NOT NULL,
  classification_id UUID REFERENCES public.investor_classifications(id) NOT NULL,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'meeting', 'rejected', 'invested')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(startup_user_id, investor_user_id, assessment_id)
);

-- Enable Row Level Security
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_profiles
CREATE POLICY "Users can view their own investor profiles" 
  ON public.investor_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investor profiles" 
  ON public.investor_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investor profiles" 
  ON public.investor_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for investor_classifications
CREATE POLICY "Users can view their own investor classifications" 
  ON public.investor_classifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investor classifications" 
  ON public.investor_classifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for investor_matches
CREATE POLICY "Startups can view their matches" 
  ON public.investor_matches FOR SELECT 
  USING (auth.uid() = startup_user_id);

CREATE POLICY "Investors can view matches for them" 
  ON public.investor_matches FOR SELECT 
  USING (auth.uid() = investor_user_id);

CREATE POLICY "System can create matches" 
  ON public.investor_matches FOR INSERT 
  TO authenticated;

CREATE POLICY "Users can update match status" 
  ON public.investor_matches FOR UPDATE 
  USING (auth.uid() = startup_user_id OR auth.uid() = investor_user_id);

-- Create indexes for better performance
CREATE INDEX idx_investor_profiles_user_id ON public.investor_profiles(user_id);
CREATE INDEX idx_investor_classifications_profile_id ON public.investor_classifications(profile_id);
CREATE INDEX idx_investor_matches_startup_user ON public.investor_matches(startup_user_id);
CREATE INDEX idx_investor_matches_investor_user ON public.investor_matches(investor_user_id);
CREATE INDEX idx_investor_matches_status ON public.investor_matches(status);
