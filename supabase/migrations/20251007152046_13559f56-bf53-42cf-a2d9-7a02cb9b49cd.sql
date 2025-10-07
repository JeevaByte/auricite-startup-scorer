-- Table for investors to save/bookmark startups
CREATE TABLE public.investor_saved_startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(investor_user_id, startup_user_id)
);

-- Table for investor portfolio (tracked investments)
CREATE TABLE public.investor_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  investment_amount NUMERIC,
  investment_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  UNIQUE(investor_user_id, startup_user_id)
);

-- Table for tracking score changes over time
CREATE TABLE public.score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL,
  business_idea INTEGER NOT NULL,
  team INTEGER NOT NULL,
  traction INTEGER NOT NULL,
  financials INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_saved_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_saved_startups
CREATE POLICY "Investors can manage their saved startups"
ON public.investor_saved_startups
FOR ALL
USING (auth.uid() = investor_user_id);

CREATE POLICY "Startup owners can see who saved them"
ON public.investor_saved_startups
FOR SELECT
USING (auth.uid() = startup_user_id);

-- RLS Policies for investor_portfolio
CREATE POLICY "Investors can manage their portfolio"
ON public.investor_portfolio
FOR ALL
USING (auth.uid() = investor_user_id);

CREATE POLICY "Startup owners can see their investors"
ON public.investor_portfolio
FOR SELECT
USING (auth.uid() = startup_user_id);

-- RLS Policies for score_history
CREATE POLICY "Users can view their own score history"
ON public.score_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert score history"
ON public.score_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_investor_saved_startups_investor ON public.investor_saved_startups(investor_user_id);
CREATE INDEX idx_investor_saved_startups_startup ON public.investor_saved_startups(startup_user_id);
CREATE INDEX idx_investor_portfolio_investor ON public.investor_portfolio(investor_user_id);
CREATE INDEX idx_investor_portfolio_startup ON public.investor_portfolio(startup_user_id);
CREATE INDEX idx_score_history_assessment ON public.score_history(assessment_id);
CREATE INDEX idx_score_history_user ON public.score_history(user_id);

-- Update investor_profiles to add verification fields
ALTER TABLE public.investor_profiles 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT;