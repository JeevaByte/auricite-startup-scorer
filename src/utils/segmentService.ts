
import { supabase } from '@/integrations/supabase/client';

export interface UserSegment {
  id: string;
  segment_name: string;
  segment_criteria: any;
  scoring_weights: any;
  created_at: string;
  updated_at: string;
}

export const createUserSegment = async (
  segmentName: string,
  criteria: any,
  weights: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_segments')
      .insert({
        user_id: user.id,
        segment_name: segmentName,
        segment_criteria: criteria,
        scoring_weights: weights
      });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating user segment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getUserSegments = async (): Promise<UserSegment[]> => {
  try {
    const { data, error } = await supabase
      .from('user_segments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user segments:', error);
    return [];
  }
};

export const getUserSegment = async (userId: string): Promise<UserSegment | null> => {
  try {
    // Get user profile to determine segment
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get all segments and find matching one
    const segments = await getUserSegments();
    
    for (const segment of segments) {
      if (matchesSegmentCriteria(profile, segment.segment_criteria)) {
        return segment;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user segment:', error);
    return null;
  }
};

const matchesSegmentCriteria = (profile: any, criteria: any): boolean => {
  // Simple criteria matching - can be extended
  if (criteria.company_size && profile.company_name) {
    return true; // Has company
  }
  if (criteria.user_type === 'individual' && !profile.company_name) {
    return true; // Individual user
  }
  return false;
};
