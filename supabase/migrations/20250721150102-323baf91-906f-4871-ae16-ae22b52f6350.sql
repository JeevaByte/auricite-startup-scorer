-- Fix Function Search Path Mutable warnings by adding SET search_path = ''
-- This prevents search path manipulation attacks

-- Fix get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(role, 'free'::user_role)
  FROM public.user_roles
  WHERE user_id = user_uuid;
$function$;

-- Fix has_premium_access function  
DROP FUNCTION IF EXISTS public.has_premium_access(uuid);
CREATE OR REPLACE FUNCTION public.has_premium_access(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND sp.name IN ('Premium', 'Enterprise')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  );
$function$;

-- Fix track_scoring_config_changes function
DROP FUNCTION IF EXISTS public.track_scoring_config_changes();
CREATE OR REPLACE FUNCTION public.track_scoring_config_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Insert into history table
  INSERT INTO public.scoring_config_history (
    config_id,
    version,
    config_data,
    created_by,
    change_reason,
    previous_version
  ) VALUES (
    NEW.id,
    NEW.version,
    NEW.config_data,
    NEW.created_by,
    NEW.change_reason,
    COALESCE(OLD.version, 0)
  );
  
  -- Insert into audit log
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    user_id
  ) VALUES (
    'scoring_config',
    NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'INSERT' ELSE 'UPDATE' END,
    CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    row_to_json(NEW),
    NEW.created_by
  );
  
  RETURN NEW;
END;
$function$;

-- Fix validate_scoring_config function
DROP FUNCTION IF EXISTS public.validate_scoring_config(jsonb);
CREATE OR REPLACE FUNCTION public.validate_scoring_config(config_data jsonb)
RETURNS TABLE(is_valid boolean, errors text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  validation_errors TEXT[] := '{}';
  total_weight NUMERIC := 0;
  sector_key TEXT;
  sector_config JSONB;
BEGIN
  -- Check if all required fields exist
  IF NOT (config_data ? 'businessIdea' AND config_data ? 'financials' AND config_data ? 'team' AND config_data ? 'traction') THEN
    validation_errors := array_append(validation_errors, 'Missing required weight fields');
  END IF;
  
  -- Check if weights sum to 1.0
  total_weight := (config_data->>'businessIdea')::NUMERIC + 
                  (config_data->>'financials')::NUMERIC + 
                  (config_data->>'team')::NUMERIC + 
                  (config_data->>'traction')::NUMERIC;
  
  IF ABS(total_weight - 1.0) > 0.01 THEN
    validation_errors := array_append(validation_errors, 'Total weights must sum to 1.0, current sum: ' || total_weight);
  END IF;
  
  -- Validate sector-specific weights
  IF config_data ? 'sectors' THEN
    FOR sector_key IN SELECT jsonb_object_keys(config_data->'sectors')
    LOOP
      sector_config := config_data->'sectors'->sector_key;
      total_weight := (sector_config->>'businessIdea')::NUMERIC + 
                      (sector_config->>'financials')::NUMERIC + 
                      (sector_config->>'team')::NUMERIC + 
                      (sector_config->>'traction')::NUMERIC;
      
      IF ABS(total_weight - 1.0) > 0.01 THEN
        validation_errors := array_append(validation_errors, 'Sector ' || sector_key || ' weights must sum to 1.0, current sum: ' || total_weight);
      END IF;
    END LOOP;
  END IF;
  
  RETURN QUERY SELECT array_length(validation_errors, 1) = 0, validation_errors;
END;
$function$;