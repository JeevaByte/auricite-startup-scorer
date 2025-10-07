-- 1. Add 'investor' role to user_role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('free', 'premium', 'admin', 'investor');
  ELSE
    BEGIN
      ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'investor';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Extend investor_profiles table with new fields
ALTER TABLE public.investor_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS org_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS sectors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ticket_min INTEGER,
ADD COLUMN IF NOT EXISTS ticket_max INTEGER,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_fields JSONB DEFAULT '{"display_name": true, "org_name": true, "bio": true, "sectors": true, "ticket_min": true, "ticket_max": true, "region": true}'::jsonb;

-- 3. Add privacy controls to profiles table for fundraisers
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_fields JSONB DEFAULT '{"full_name": true, "company_name": true}'::jsonb;

-- 4. Add privacy controls to assessments table
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_fields JSONB DEFAULT '{"score": false, "team": false, "traction": false, "documents": false}'::jsonb;

-- 5. Create score_weights table for stage-aware scoring
CREATE TABLE IF NOT EXISTS public.score_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL UNIQUE CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b', 'series-c')),
  weights JSONB NOT NULL DEFAULT '{
    "team": 0.30,
    "product": 0.20,
    "market": 0.15,
    "financials": 0.15,
    "traction": 0.15,
    "legal": 0.05
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default weights for each stage
INSERT INTO public.score_weights (stage, weights) VALUES
  ('pre-seed', '{"team": 0.35, "product": 0.25, "market": 0.20, "financials": 0.05, "traction": 0.10, "legal": 0.05}'::jsonb),
  ('seed', '{"team": 0.30, "product": 0.20, "market": 0.20, "financials": 0.10, "traction": 0.15, "legal": 0.05}'::jsonb),
  ('series-a', '{"team": 0.25, "product": 0.15, "market": 0.20, "financials": 0.15, "traction": 0.20, "legal": 0.05}'::jsonb),
  ('series-b', '{"team": 0.20, "product": 0.15, "market": 0.15, "financials": 0.20, "traction": 0.25, "legal": 0.05}'::jsonb),
  ('series-c', '{"team": 0.15, "product": 0.10, "market": 0.15, "financials": 0.25, "traction": 0.30, "legal": 0.05}'::jsonb)
ON CONFLICT (stage) DO NOTHING;

-- 6. Enable RLS on score_weights
ALTER TABLE public.score_weights ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for score_weights (public read)
CREATE POLICY "Anyone can view score weights"
ON public.score_weights
FOR SELECT
TO authenticated
USING (true);

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_profiles_public ON public.investor_profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_investor_profiles_verification ON public.investor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_sectors ON public.investor_profiles USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON public.profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_assessments_public ON public.assessments(is_public) WHERE is_public = true;

-- 9. Add trigger to update timestamp on score_weights
CREATE OR REPLACE FUNCTION update_score_weights_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_score_weights_updated_at
BEFORE UPDATE ON public.score_weights
FOR EACH ROW
EXECUTE FUNCTION update_score_weights_timestamp();