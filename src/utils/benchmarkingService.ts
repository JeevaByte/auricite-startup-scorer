import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';

export const fetchBenchmarkData = async (assessmentData: AssessmentData) => {
  try {
    const { data, error } = await supabase
      .from('startup_benchmarks')
      .select('*');

    if (error) {
      console.error('Error fetching benchmark data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching benchmark data:', error);
    return null;
  }
};
