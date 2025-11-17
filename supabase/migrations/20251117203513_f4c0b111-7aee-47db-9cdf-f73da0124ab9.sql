-- Add RLS policy for startups to create contact requests
CREATE POLICY "Startups can create contact requests"
ON public.contact_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = startup_user_id);

-- Add RLS policy for viewing own contact requests
CREATE POLICY "Users can view their contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (auth.uid() = startup_user_id OR auth.uid() = investor_user_id);

-- Add user_id to investor_directory (optional, for linking to auth users)
ALTER TABLE public.investor_directory
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id to startup_directory (optional, for linking to auth users)
ALTER TABLE public.startup_directory
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investor_directory_user_id ON public.investor_directory(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_directory_user_id ON public.startup_directory(user_id);