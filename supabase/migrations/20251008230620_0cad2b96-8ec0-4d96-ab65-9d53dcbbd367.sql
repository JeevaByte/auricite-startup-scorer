-- AI Investment Assistant Tables
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data Room Access Tables
CREATE TABLE IF NOT EXISTS public.document_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.document_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'access_granted', 'access_denied')),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investor Collaboration Tables
CREATE TABLE IF NOT EXISTS public.investor_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS public.investor_syndicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lead_investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_sectors TEXT[] DEFAULT '{}',
  ticket_min INTEGER,
  ticket_max INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.syndicate_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syndicate_id UUID NOT NULL REFERENCES public.investor_syndicates(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'co-lead', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(syndicate_id, investor_id)
);

CREATE TABLE IF NOT EXISTS public.investor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.investor_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_syndicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syndicate_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Chat
CREATE POLICY "Users can manage their own chat sessions"
  ON public.ai_chat_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their sessions"
  ON public.ai_chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE id = session_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their sessions"
  ON public.ai_chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- RLS Policies for Smart Alerts
CREATE POLICY "Users can view their own alerts"
  ON public.smart_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.smart_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Document Access
CREATE POLICY "Investors can create access requests"
  ON public.document_access_requests FOR INSERT
  WITH CHECK (auth.uid() = investor_user_id);

CREATE POLICY "Investors can view their requests"
  ON public.document_access_requests FOR SELECT
  USING (auth.uid() = investor_user_id);

CREATE POLICY "Startups can view requests to them"
  ON public.document_access_requests FOR SELECT
  USING (auth.uid() = startup_user_id);

CREATE POLICY "Startups can update requests to them"
  ON public.document_access_requests FOR UPDATE
  USING (auth.uid() = startup_user_id);

CREATE POLICY "Users can view audit logs for their documents"
  ON public.document_access_audit FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.pitch_decks
    WHERE pitch_decks.id = document_id AND pitch_decks.user_id = auth.uid()
  ));

-- RLS Policies for Investor Follows
CREATE POLICY "Users can manage their follows"
  ON public.investor_follows FOR ALL
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can see who follows them"
  ON public.investor_follows FOR SELECT
  USING (auth.uid() = following_id OR auth.uid() = follower_id);

-- RLS Policies for Syndicates
CREATE POLICY "Public syndicates are visible to all"
  ON public.investor_syndicates FOR SELECT
  USING (is_public = true OR auth.uid() = lead_investor_id OR EXISTS (
    SELECT 1 FROM public.syndicate_members
    WHERE syndicate_id = id AND investor_id = auth.uid()
  ));

CREATE POLICY "Lead investors can manage their syndicates"
  ON public.investor_syndicates FOR ALL
  USING (auth.uid() = lead_investor_id);

CREATE POLICY "Syndicate members can view members"
  ON public.syndicate_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.investor_syndicates
    WHERE id = syndicate_id AND (is_public = true OR auth.uid() = lead_investor_id OR EXISTS (
      SELECT 1 FROM public.syndicate_members sm
      WHERE sm.syndicate_id = syndicate_id AND sm.investor_id = auth.uid()
    ))
  ));

CREATE POLICY "Users can join syndicates"
  ON public.syndicate_members FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- RLS Policies for Investor Messages
CREATE POLICY "Users can view their messages"
  ON public.investor_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.investor_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
  ON public.investor_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Create indexes for performance
CREATE INDEX idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);
CREATE INDEX idx_smart_alerts_user_id ON public.smart_alerts(user_id, created_at DESC);
CREATE INDEX idx_document_access_requests_investor ON public.document_access_requests(investor_user_id);
CREATE INDEX idx_document_access_requests_startup ON public.document_access_requests(startup_user_id);
CREATE INDEX idx_document_access_audit_document ON public.document_access_audit(document_id, created_at DESC);
CREATE INDEX idx_investor_follows_follower ON public.investor_follows(follower_id);
CREATE INDEX idx_investor_follows_following ON public.investor_follows(following_id);
CREATE INDEX idx_syndicate_members_syndicate ON public.syndicate_members(syndicate_id);
CREATE INDEX idx_investor_messages_recipient ON public.investor_messages(recipient_id, created_at DESC);
CREATE INDEX idx_investor_messages_sender ON public.investor_messages(sender_id, created_at DESC);