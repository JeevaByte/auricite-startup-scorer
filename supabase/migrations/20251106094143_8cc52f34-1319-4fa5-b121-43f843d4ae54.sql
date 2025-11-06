-- Create saved_investors table
CREATE TABLE IF NOT EXISTS public.saved_investors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES public.investor_directory(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, investor_id)
);

-- Create saved_startups table
CREATE TABLE IF NOT EXISTS public.saved_startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startup_directory(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, startup_id)
);

-- Enable RLS
ALTER TABLE public.saved_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_startups ENABLE ROW LEVEL SECURITY;

-- Policies for saved_investors
CREATE POLICY "Users can manage their saved investors"
  ON public.saved_investors
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for saved_startups
CREATE POLICY "Users can manage their saved startups"
  ON public.saved_startups
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_saved_investors_user_id ON public.saved_investors(user_id);
CREATE INDEX idx_saved_startups_user_id ON public.saved_startups(user_id);