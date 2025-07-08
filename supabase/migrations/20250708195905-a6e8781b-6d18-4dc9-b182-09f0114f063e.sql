
-- Add versioning to scoring_config table
ALTER TABLE public.scoring_config ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.scoring_config ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.scoring_config ADD COLUMN change_reason TEXT;

-- Create scoring_config_history table for versioning
CREATE TABLE public.scoring_config_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.scoring_config(id),
  version INTEGER NOT NULL,
  config_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  previous_version INTEGER
);

-- Create audit_log table for tracking changes
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create assessment_stages table for multi-stage assessments
CREATE TABLE public.assessment_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  stage_data JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_segments table for segment-based scoring
CREATE TABLE public.user_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  segment_name TEXT NOT NULL,
  segment_criteria JSONB NOT NULL,
  scoring_weights JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'immediate', -- immediate, daily, weekly
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_queue table
CREATE TABLE public.notification_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scoring_validation_rules table
CREATE TABLE public.scoring_validation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  validation_logic JSONB NOT NULL,
  error_message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.scoring_config_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_validation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scoring_config_history
CREATE POLICY "Authenticated users can read scoring history" 
  ON public.scoring_config_history 
  FOR SELECT 
  TO authenticated
  USING (true);

-- RLS Policies for audit_log
CREATE POLICY "Admins can read audit logs" 
  ON public.audit_log 
  FOR SELECT 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- RLS Policies for assessment_stages
CREATE POLICY "Users can manage their own assessment stages" 
  ON public.assessment_stages 
  FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments WHERE id = assessment_id AND user_id = auth.uid()));

-- RLS Policies for user_segments
CREATE POLICY "Users can manage their own segments" 
  ON public.user_segments 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notification_queue
CREATE POLICY "Users can view their own notifications" 
  ON public.notification_queue 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for scoring_validation_rules
CREATE POLICY "Authenticated users can read validation rules" 
  ON public.scoring_validation_rules 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage validation rules" 
  ON public.scoring_validation_rules 
  FOR ALL 
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Create function to track scoring config changes
CREATE OR REPLACE FUNCTION public.track_scoring_config_changes()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for scoring config changes
CREATE TRIGGER scoring_config_audit_trigger
  AFTER INSERT OR UPDATE ON public.scoring_config
  FOR EACH ROW
  EXECUTE FUNCTION public.track_scoring_config_changes();

-- Create function to validate scoring configuration
CREATE OR REPLACE FUNCTION public.validate_scoring_config(config_data JSONB)
RETURNS TABLE (is_valid BOOLEAN, errors TEXT[]) AS $$
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
$$ LANGUAGE plpgsql;

-- Insert default validation rules
INSERT INTO public.scoring_validation_rules (rule_name, validation_logic, error_message) VALUES
('weights_sum_to_one', '{"type": "weight_sum", "target": 1.0, "tolerance": 0.01}', 'Scoring weights must sum to 1.0'),
('weights_positive', '{"type": "positive_values", "fields": ["businessIdea", "financials", "team", "traction"]}', 'All weights must be positive values'),
('required_fields', '{"type": "required_fields", "fields": ["businessIdea", "financials", "team", "traction", "sectors"]}', 'Required fields are missing from configuration');
