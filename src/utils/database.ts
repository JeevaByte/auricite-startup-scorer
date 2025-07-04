import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';

export const saveAssessmentData = async (data: AssessmentData, userId: string) => {
  try {
    const { error } = await supabase
      .from('assessment_data')
      .upsert({ user_id: userId, data: data }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving assessment data:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error saving assessment data:', error);
    return false;
  }
};

export const getAssessmentData = async (userId: string): Promise<AssessmentData | null> => {
  try {
    const { data, error } = await supabase
      .from('assessment_data')
      .select('data')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching assessment data:', error);
      return null;
    }

    return (data?.data as AssessmentData) || null;
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    return null;
  }
};
