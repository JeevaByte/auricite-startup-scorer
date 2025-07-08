
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export const getAuditLogs = async (
  tableName?: string,
  recordId?: string,
  limit: number = 100
): Promise<AuditLog[]> => {
  try {
    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tableName) {
      query = query.eq('table_name', tableName);
    }

    if (recordId) {
      query = query.eq('record_id', recordId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
};

export const logManualAction = async (
  tableName: string,
  recordId: string,
  action: string,
  oldValues?: any,
  newValues?: any
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        table_name: tableName,
        record_id: recordId,
        action,
        old_values: oldValues,
        new_values: newValues,
        user_agent: navigator.userAgent
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging manual action:', error);
  }
};
