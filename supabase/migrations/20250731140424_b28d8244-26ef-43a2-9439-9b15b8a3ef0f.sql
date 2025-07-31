-- Create donations table for one-time payments
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  donor_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create pitch_decks table for file uploads
CREATE TABLE public.pitch_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  upload_status TEXT DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_access table for tracking paid access
CREATE TABLE public.user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL, -- 'investor_directory', 'learning_resources', 'pitch_upload'
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ, -- NULL for lifetime access
  granted_by TEXT, -- 'donation', 'subscription', 'admin'
  reference_id UUID, -- donation_id or subscription_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create crm_contacts table for CRM integration
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  lead_status TEXT DEFAULT 'new', -- new, contacted, qualified, converted
  lead_source TEXT DEFAULT 'website',
  total_donations INTEGER DEFAULT 0,
  last_donation_date TIMESTAMPTZ,
  crm_contact_id TEXT, -- External CRM ID
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations
CREATE POLICY "Users can view their own donations" ON public.donations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations" ON public.donations
  FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "System can insert donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update donations" ON public.donations
  FOR UPDATE USING (true);

-- RLS Policies for pitch_decks
CREATE POLICY "Users can manage their own pitch decks" ON public.pitch_decks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_access
CREATE POLICY "Users can view their own access" ON public.user_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage access" ON public.user_access
  FOR ALL USING (true);

-- RLS Policies for crm_contacts
CREATE POLICY "Users can view their own CRM data" ON public.crm_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage CRM contacts" ON public.crm_contacts
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "System can manage CRM contacts" ON public.crm_contacts
  FOR ALL USING (true);

-- Create storage bucket for pitch decks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-decks',
  'pitch-decks',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
);

-- Storage policies for pitch decks
CREATE POLICY "Users can upload their own pitch decks" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pitch-decks' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own pitch decks" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'pitch-decks' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own pitch decks" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pitch-decks' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to check user access
CREATE OR REPLACE FUNCTION public.has_paid_access(user_uuid uuid, access_type_param text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_access 
    WHERE user_id = user_uuid 
    AND access_type = access_type_param
    AND (expires_at IS NULL OR expires_at > now())
  ) OR EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND sp.name IN ('Premium', 'Advanced')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  );
$function$;

-- Create function to grant access after donation
CREATE OR REPLACE FUNCTION public.grant_access_after_donation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Only grant access when donation status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Grant access to investor directory and learning resources
    INSERT INTO public.user_access (user_id, access_type, granted_by, reference_id)
    VALUES 
      (NEW.user_id, 'investor_directory', 'donation', NEW.id),
      (NEW.user_id, 'learning_resources', 'donation', NEW.id),
      (NEW.user_id, 'pitch_upload', 'donation', NEW.id)
    ON CONFLICT DO NOTHING;
    
    -- Update CRM contact
    INSERT INTO public.crm_contacts (user_id, email, total_donations, last_donation_date)
    VALUES (NEW.user_id, NEW.email, NEW.amount, NEW.updated_at)
    ON CONFLICT (email) DO UPDATE SET
      total_donations = crm_contacts.total_donations + NEW.amount,
      last_donation_date = NEW.updated_at,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for donation access
CREATE TRIGGER grant_access_after_donation_trigger
  AFTER INSERT OR UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_access_after_donation();

-- Add timestamp triggers
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_pitch_decks_updated_at
  BEFORE UPDATE ON public.pitch_decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_access_updated_at
  BEFORE UPDATE ON public.user_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();