
import { supabase } from '@/integrations/supabase/client';

export interface ScoringVersion {
  id: string;
  version: number;
  config_data: any;
  created_at: string;
  created_by?: string;
  change_reason?: string;
  previous_version?: number;
}

export const createScoringVersion = async (
  configData: any,
  changeReason?: string
): Promise<{ success: boolean; version?: number; error?: string }> => {
  try {
    // Get current max version
    const { data: currentConfig, error: currentError } = await supabase
      .from('scoring_config')
      .select('version')
      .eq('is_active', true)
      .single();

    if (currentError && currentError.code !== 'PGRST116') {
      throw currentError;
    }

    const newVersion = (currentConfig?.version || 0) + 1;

    // Validate configuration
    const { data: validation } = await supabase.rpc('validate_scoring_config', {
      config_data: configData
    });

    if (validation && !validation[0]?.is_valid) {
      return {
        success: false,
        error: `Validation failed: ${validation[0]?.errors?.join(', ')}`
      };
    }

    // Deactivate current config
    await supabase
      .from('scoring_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Create new version
    const { error: insertError } = await supabase
      .from('scoring_config')
      .insert({
        config_name: `Version ${newVersion}`,
        config_data: configData,
        version: newVersion,
        is_active: true,
        change_reason: changeReason
      });

    if (insertError) throw insertError;

    return { success: true, version: newVersion };
  } catch (error) {
    console.error('Error creating scoring version:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getScoringHistory = async (): Promise<ScoringVersion[]> => {
  try {
    const { data, error } = await supabase
      .from('scoring_config_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching scoring history:', error);
    return [];
  }
};

export const revertToVersion = async (
  versionId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get the version data
    const { data: version, error: versionError } = await supabase
      .from('scoring_config_history')
      .select('*')
      .eq('id', versionId)
      .single();

    if (versionError) throw versionError;

    // Create new version with old data
    return await createScoringVersion(version.config_data, `Reverted to version ${version.version}: ${reason}`);
  } catch (error) {
    console.error('Error reverting to version:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
