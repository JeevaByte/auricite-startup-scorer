import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/utils/scoreCalculator';

export interface DraftAssessment {
  id?: string;
  user_id: string;
  draft_data: Partial<AssessmentData>;
  step: number;
  created_at?: string;
  updated_at?: string;
}

export const saveDraft = async (data: Partial<AssessmentData>, step: number): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const draftData = {
    user_id: user.id,
    draft_data: data,
    step
  };

  // Use type assertion to work with the current Supabase types
  const { error } = await (supabase as any)
    .from('assessment_drafts')
    .upsert(draftData, { 
      onConflict: 'user_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const loadDraft = async (): Promise<DraftAssessment | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Use type assertion to work with the current Supabase types
  const { data, error } = await (supabase as any)
    .from('assessment_drafts')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error loading draft:', error);
    return null;
  }

  return data as DraftAssessment;
};

export const clearDraft = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return;
  }

  // Use type assertion to work with the current Supabase types
  const { error } = await (supabase as any)
    .from('assessment_drafts')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing draft:', error);
    throw error;
  }
};
