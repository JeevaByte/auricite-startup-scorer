
-- Create scoring_config table to store JSON-based scoring weights
CREATE TABLE public.scoring_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_name text NOT NULL UNIQUE,
  config_data jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on scoring_config
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read scoring config
CREATE POLICY "Authenticated users can read scoring config" 
  ON public.scoring_config 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy for admin users to manage scoring config (we'll update this later with proper admin role)
CREATE POLICY "Admins can manage scoring config" 
  ON public.scoring_config 
  FOR ALL 
  TO authenticated
  USING (true);

-- Insert default scoring configuration
INSERT INTO public.scoring_config (config_name, config_data, is_active) VALUES 
(
  'default_weights',
  '{
    "businessIdea": 0.30,
    "financials": 0.25,
    "team": 0.25,
    "traction": 0.20,
    "sectors": {
      "B2B SaaS": {
        "businessIdea": 0.25,
        "financials": 0.30,
        "team": 0.25,
        "traction": 0.20
      },
      "B2C Consumer": {
        "businessIdea": 0.35,
        "financials": 0.20,
        "team": 0.20,
        "traction": 0.25
      },
      "FinTech": {
        "businessIdea": 0.20,
        "financials": 0.35,
        "team": 0.30,
        "traction": 0.15
      },
      "HealthTech": {
        "businessIdea": 0.30,
        "financials": 0.25,
        "team": 0.35,
        "traction": 0.10
      },
      "E-commerce": {
        "businessIdea": 0.25,
        "financials": 0.25,
        "team": 0.20,
        "traction": 0.30
      }
    }
  }'::jsonb,
  true
);

-- Create admin_users table for role management
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read admin_users table
CREATE POLICY "Admin users can read admin table" 
  ON public.admin_users 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);
