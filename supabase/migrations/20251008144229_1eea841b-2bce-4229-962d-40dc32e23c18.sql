-- Create contact_requests table for investor-fundraiser communication
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(investor_user_id, startup_user_id)
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_requests
CREATE POLICY "Investors can create contact requests"
  ON public.contact_requests
  FOR INSERT
  WITH CHECK (auth.uid() = investor_user_id);

CREATE POLICY "Investors can view their own requests"
  ON public.contact_requests
  FOR SELECT
  USING (auth.uid() = investor_user_id);

CREATE POLICY "Fundraisers can view requests to them"
  ON public.contact_requests
  FOR SELECT
  USING (auth.uid() = startup_user_id);

CREATE POLICY "Fundraisers can update requests to them"
  ON public.contact_requests
  FOR UPDATE
  USING (auth.uid() = startup_user_id);

-- Add indexes for performance
CREATE INDEX idx_contact_requests_investor ON public.contact_requests(investor_user_id);
CREATE INDEX idx_contact_requests_startup ON public.contact_requests(startup_user_id);
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);

-- Trigger to update updated_at
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();