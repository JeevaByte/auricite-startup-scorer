-- Create admin user for testing
INSERT INTO public.admin_users (user_id) 
SELECT id FROM auth.users 
WHERE email = 'admin@test.com' 
LIMIT 1;

-- If no users exist, we'll need to create one after signup
-- This is just a placeholder for when an admin user exists