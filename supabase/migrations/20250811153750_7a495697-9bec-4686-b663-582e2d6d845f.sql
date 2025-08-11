-- Create table for per-user customizable scoring profiles
CREATE TABLE IF NOT EXISTS public.user_scoring_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('investor','accelerator','startup')),
  weights JSONB NOT NULL,
  kpis JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reference profiles table (do not reference auth.users directly)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='profiles'
  ) THEN
    ALTER TABLE public.user_scoring_profiles
    ADD CONSTRAINT user_scoring_profiles_user_fk
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure only one default profile per user
CREATE UNIQUE INDEX IF NOT EXISTS user_scoring_profiles_unique_default
ON public.user_scoring_profiles(user_id) WHERE is_default;

-- Enable RLS
ALTER TABLE public.user_scoring_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can read public profiles" ON public.user_scoring_profiles;
CREATE POLICY "Public can read public profiles"
ON public.user_scoring_profiles
FOR SELECT
USING (visibility = 'public');

DROP POLICY IF EXISTS "Users can read their own profiles" ON public.user_scoring_profiles;
CREATE POLICY "Users can read their own profiles"
ON public.user_scoring_profiles
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.user_scoring_profiles;
CREATE POLICY "Users can insert their own profiles"
ON public.user_scoring_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profiles" ON public.user_scoring_profiles;
CREATE POLICY "Users can update their own profiles"
ON public.user_scoring_profiles
FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profiles" ON public.user_scoring_profiles;
CREATE POLICY "Users can delete their own profiles"
ON public.user_scoring_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Validation trigger to ensure weights are valid (sum to 1.0 etc.)
CREATE OR REPLACE FUNCTION public.validate_user_scoring_profile()
RETURNS trigger AS $$
DECLARE
  is_valid boolean;
  errors text[];
BEGIN
  -- Reuse existing validation function
  SELECT is_valid, errors INTO is_valid, errors 
  FROM public.validate_scoring_config(NEW.weights);

  IF NOT is_valid THEN
    RAISE EXCEPTION 'Invalid scoring weights: %', array_to_string(errors, '; ');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

-- Update timestamp trigger is already available as public.update_timestamp()
DROP TRIGGER IF EXISTS trg_user_scoring_profiles_validate ON public.user_scoring_profiles;
CREATE TRIGGER trg_user_scoring_profiles_validate
BEFORE INSERT OR UPDATE ON public.user_scoring_profiles
FOR EACH ROW EXECUTE FUNCTION public.validate_user_scoring_profile();

DROP TRIGGER IF EXISTS trg_user_scoring_profiles_updated_at ON public.user_scoring_profiles;
CREATE TRIGGER trg_user_scoring_profiles_updated_at
BEFORE UPDATE ON public.user_scoring_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();