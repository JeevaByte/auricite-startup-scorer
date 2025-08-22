-- Security fixes: Update database functions with secure search_path and improve RLS policies

-- Fix database functions to use SECURITY DEFINER with secure search_path
CREATE OR REPLACE FUNCTION public.list_unindexed_foreign_keys(table_name text)
RETURNS TABLE(column_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY 
    WITH foreign_keys AS (
        SELECT 
            tc.table_schema, 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = list_unindexed_foreign_keys.table_name
    ), existing_indexes AS (
        SELECT 
            schemaname, 
            tablename, 
            indexname, 
            indexdef
        FROM 
            pg_catalog.pg_indexes
        WHERE 
            tablename = list_unindexed_foreign_keys.table_name
    )
    SELECT 
        fk.column_name
    FROM 
        foreign_keys fk
    LEFT JOIN 
        existing_indexes ei 
        ON ei.schemaname = 'public' 
        AND ei.tablename = fk.table_name 
        AND ei.indexdef LIKE '%' || fk.column_name || '%'
    WHERE 
        ei.indexname IS NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_missing_fk_indexes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    fk_rec RECORD;
    index_name TEXT;
    create_idx_sql TEXT;
BEGIN
    -- Find all foreign keys without an index
    FOR fk_rec IN 
        SELECT 
            tc.table_schema, 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name,
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            LEFT JOIN pg_indexes AS idx
                ON idx.schemaname = tc.table_schema
                AND idx.tablename = tc.table_name
                AND idx.indexdef LIKE '%' || kcu.column_name || '%'
        WHERE 
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND idx.indexname IS NULL
    LOOP
        -- Generate index name
        index_name := 'idx_' || fk_rec.table_name || '_' || fk_rec.column_name;
        
        -- Create index
        create_idx_sql := 'CREATE INDEX IF NOT EXISTS ' || index_name || 
                          ' ON ' || fk_rec.table_schema || '.' || fk_rec.table_name || 
                          '(' || fk_rec.column_name || ');';
        
        -- Execute the SQL statement
        EXECUTE create_idx_sql;
        
        RAISE NOTICE 'Created index % on %.%.%', 
            index_name, fk_rec.table_schema, fk_rec.table_name, fk_rec.column_name;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_auth_settings(config jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    result jsonb;
BEGIN
    -- Update auth settings
    UPDATE auth.config SET config = update_auth_settings.config;
    
    result := '{}'::jsonb;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.fix_auth_uid_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    policy_rec RECORD;
    qual_expr TEXT;
    with_check_expr TEXT;
    update_sql TEXT;
    drop_sql TEXT;
    recreate_sql TEXT;
BEGIN
    -- Loop through all policies that use auth.uid() directly
    FOR policy_rec IN 
        SELECT 
            p.polname AS policy_name,
            n.nspname AS schema_name,
            c.relname AS table_name,
            pg_get_expr(p.polqual, p.polrelid) AS qual,
            pg_get_expr(p.polwithcheck, p.polrelid) AS with_check,
            p.polcmd,
            array_agg(r.rolname) AS roles
        FROM 
            pg_policy p
        JOIN 
            pg_class c ON p.polrelid = c.oid
        JOIN 
            pg_namespace n ON c.relnamespace = n.oid
        JOIN 
            pg_roles r ON r.oid = ANY(p.polroles)
        WHERE 
            pg_get_expr(p.polqual, p.polrelid) LIKE '%auth.uid()%' OR 
            pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%auth.uid()%'
        GROUP BY 
            p.polname, n.nspname, c.relname, p.polqual, p.polwithcheck, p.polrelid, p.polcmd
    LOOP
        -- Replace auth.uid() with (SELECT auth.uid())
        IF policy_rec.qual IS NOT NULL THEN
            qual_expr := REPLACE(policy_rec.qual, 'auth.uid()', '(SELECT auth.uid())');
        ELSE
            qual_expr := NULL;
        END IF;
        
        IF policy_rec.with_check IS NOT NULL THEN
            with_check_expr := REPLACE(policy_rec.with_check, 'auth.uid()', '(SELECT auth.uid())');
        ELSE
            with_check_expr := NULL;
        END IF;
        
        -- Drop the existing policy
        drop_sql := 'DROP POLICY "' || policy_rec.policy_name || '" ON ' || 
                    policy_rec.schema_name || '.' || policy_rec.table_name || ';';
        
        -- Create the new policy with optimized expression
        recreate_sql := 'CREATE POLICY "' || policy_rec.policy_name || '" ON ' ||
                        policy_rec.schema_name || '.' || policy_rec.table_name ||
                        ' FOR ' || policy_rec.polcmd ||
                        ' TO ' || array_to_string(policy_rec.roles, ', ');
        
        IF qual_expr IS NOT NULL THEN
            recreate_sql := recreate_sql || ' USING (' || qual_expr || ')';
        END IF;
        
        IF with_check_expr IS NOT NULL THEN
            recreate_sql := recreate_sql || ' WITH CHECK (' || with_check_expr || ')';
        END IF;
        
        recreate_sql := recreate_sql || ';';
        
        -- Execute the SQL statements
        EXECUTE drop_sql;
        EXECUTE recreate_sql;
        
        RAISE NOTICE 'Updated policy "%" on %.%', 
            policy_rec.policy_name, policy_rec.schema_name, policy_rec.table_name;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_auth_settings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    config_json jsonb;
BEGIN
    -- Get auth settings from auth.config table
    SELECT config INTO config_json FROM auth.config LIMIT 1;
    
    RETURN config_json;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    result jsonb;
BEGIN
    -- Execute the SQL statement
    EXECUTE sql;
    
    -- Return empty object as success indicator
    result := '{}'::jsonb;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    -- Return error information
    result := jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE
    );
    
    RETURN result;
END;
$function$;

-- Improve RLS policies for better security

-- Fix overly permissive user_access policies
DROP POLICY IF EXISTS "System can manage access" ON public.user_access;
CREATE POLICY "System can manage access" ON public.user_access
FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) OR
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()) OR
  (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Add proper user_id restrictions to INSERT policies
DROP POLICY IF EXISTS "System can insert honeypot submissions" ON public.honeypot_submissions;
CREATE POLICY "System can insert honeypot submissions" ON public.honeypot_submissions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR (auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "System can insert donations" ON public.donations;
CREATE POLICY "System can insert donations" ON public.donations
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

DROP POLICY IF EXISTS "Authenticated can insert security events" ON public.security_events;
CREATE POLICY "Authenticated can insert security events" ON public.security_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add missing policies for waitlist subscribers with proper restrictions
DROP POLICY IF EXISTS "anyone_can_join_waitlist" ON public.waitlist_subscribers;
CREATE POLICY "Service can manage waitlist" ON public.waitlist_subscribers
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Allow public signup for waitlist but with validation
CREATE POLICY "Public can join waitlist" ON public.waitlist_subscribers
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);