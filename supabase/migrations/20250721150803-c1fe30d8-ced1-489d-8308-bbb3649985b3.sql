-- Drop and recreate get_user_role function with proper search_path
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(role::text, 'free')
  FROM public.user_roles
  WHERE user_id = user_uuid;
$function$;