-- Update RLS policy to explicitly check authentication
DROP POLICY IF EXISTS "Public investors visible to authenticated users" ON public.investor_directory;

CREATE POLICY "Public investors visible to authenticated users"
ON public.investor_directory
FOR SELECT
USING ((visibility = 'public'::text) AND (is_active = true) AND (auth.uid() IS NOT NULL));