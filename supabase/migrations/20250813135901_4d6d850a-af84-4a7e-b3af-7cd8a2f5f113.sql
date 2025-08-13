-- Update pending donations to completed status for users who have made donations
-- This will trigger the grant_access_after_donation function

UPDATE public.donations 
SET status = 'completed', updated_at = now()
WHERE status = 'pending' AND amount > 0;

-- Also manually grant access to users who have made donations but don't have access yet
-- Check which users made donations but don't have access
INSERT INTO public.user_access (user_id, access_type, granted_by, granted_at)
SELECT DISTINCT 
  d.user_id,
  'investor_directory',
  'donation_system',
  now()
FROM public.donations d
LEFT JOIN public.user_access ua ON d.user_id = ua.user_id AND ua.access_type = 'investor_directory'
WHERE d.status = 'completed' 
  AND d.amount > 0 
  AND ua.user_id IS NULL
ON CONFLICT (user_id, access_type) DO NOTHING;

INSERT INTO public.user_access (user_id, access_type, granted_by, granted_at)
SELECT DISTINCT 
  d.user_id,
  'learning_resources',
  'donation_system',
  now()
FROM public.donations d
LEFT JOIN public.user_access ua ON d.user_id = ua.user_id AND ua.access_type = 'learning_resources'
WHERE d.status = 'completed' 
  AND d.amount > 0 
  AND ua.user_id IS NULL
ON CONFLICT (user_id, access_type) DO NOTHING;

INSERT INTO public.user_access (user_id, access_type, granted_by, granted_at)
SELECT DISTINCT 
  d.user_id,
  'pitch_upload',
  'donation_system',
  now()
FROM public.donations d
LEFT JOIN public.user_access ua ON d.user_id = ua.user_id AND ua.access_type = 'pitch_upload'
WHERE d.status = 'completed' 
  AND d.amount > 0 
  AND ua.user_id IS NULL
ON CONFLICT (user_id, access_type) DO NOTHING;