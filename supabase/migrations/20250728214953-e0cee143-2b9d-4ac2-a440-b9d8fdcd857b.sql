-- Create waitlist_subscribers table
CREATE TABLE public.waitlist_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  feature_interest TEXT,
  status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (public access for waitlist signup)
CREATE POLICY "anyone_can_join_waitlist" ON public.waitlist_subscribers
FOR INSERT
WITH CHECK (true);

-- Create score_feedback table for feedback loop
CREATE TABLE public.score_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  accuracy_rating TEXT NOT NULL CHECK (accuracy_rating IN ('very_accurate', 'somewhat_accurate', 'not_accurate')),
  comments TEXT,
  score_received INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.score_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for users to submit their own feedback
CREATE POLICY "users_can_submit_feedback" ON public.score_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to view their own feedback
CREATE POLICY "users_can_view_own_feedback" ON public.score_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_score_feedback_assessment_id ON public.score_feedback(assessment_id);
CREATE INDEX idx_score_feedback_user_id ON public.score_feedback(user_id);
CREATE INDEX idx_waitlist_email ON public.waitlist_subscribers(email);

-- Create updated_at trigger for waitlist
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON public.waitlist_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();