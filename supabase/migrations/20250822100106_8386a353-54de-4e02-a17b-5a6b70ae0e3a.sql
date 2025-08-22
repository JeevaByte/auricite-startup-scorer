-- Fix critical security vulnerability: CRM contacts table publicly accessible
-- Remove overly permissive policy that allows public access to sensitive customer data

-- Drop the dangerous "System can manage CRM contacts" policy that allows public access
DROP POLICY IF EXISTS "System can manage CRM contacts" ON public.crm_contacts;

-- Create more secure policies for system operations
-- Edge functions should use service role key, not rely on RLS for system operations
CREATE POLICY "Service role can manage CRM contacts" 
ON public.crm_contacts 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Ensure users can only view their own CRM data (keep existing policy)
-- Policy "Users can view their own CRM data" already exists and is secure

-- Ensure admins can manage all CRM contacts (keep existing policy) 
-- Policy "Admins can manage CRM contacts" already exists and is secure

-- Add audit logging for CRM data access
CREATE OR REPLACE FUNCTION log_crm_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive CRM data
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    user_id
  ) VALUES (
    'crm_contacts',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) 
         WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) 
         ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW)
         WHEN TG_OP = 'UPDATE' THEN row_to_json(NEW)
         ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS log_crm_access_trigger ON public.crm_contacts;
CREATE TRIGGER log_crm_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.crm_contacts
  FOR EACH ROW EXECUTE FUNCTION log_crm_access();