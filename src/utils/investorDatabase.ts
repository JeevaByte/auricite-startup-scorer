import { supabase } from '@/integrations/supabase/client';

export interface InvestorProfileData {
  personalCapital: boolean;
  structuredFund: boolean;
  registeredEntity: boolean;
  dueDiligence: boolean;
  esgMetrics: boolean;
  checkSize: 'low' | 'medium' | 'high' | 'veryHigh';
  stage: 'preSeed' | 'seed' | 'seriesB' | 'preIPO';
  dealSource: 'personal' | 'platforms' | 'funds' | 'public';
  frequency: 'occasional' | 'frequent' | 'quarterly' | 'portfolio';
  objective: 'support' | 'returns' | 'strategic' | 'impact';
}

export interface InvestorClassification {
  id: string;
  category: 'Angel' | 'VC' | 'Family Office' | 'Institutional' | 'Crowdfunding';
  confidence: number;
  explanation: string;
  created_at: string;
}

export interface DatabaseInvestorProfile {
  id: string;
  user_id: string;
  personal_capital: boolean;
  structured_fund: boolean;
  registered_entity: boolean;
  due_diligence: boolean;
  esg_metrics: boolean;
  check_size: string;
  stage: string;
  deal_source: string;
  frequency: string;
  objective: string;
  created_at: string;
  updated_at: string;
}

export const saveInvestorProfile = async (data: InvestorProfileData): Promise<string> => {
  const { data: profile, error } = await supabase
    .from('investor_profiles')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      personal_capital: data.personalCapital,
      structured_fund: data.structuredFund,
      registered_entity: data.registeredEntity,
      due_diligence: data.dueDiligence,
      esg_metrics: data.esgMetrics,
      check_size: data.checkSize,
      stage: data.stage,
      deal_source: data.dealSource,
      frequency: data.frequency,
      objective: data.objective,
    })
    .select()
    .single();

  if (error) throw error;
  return profile.id;
};

export const saveInvestorClassification = async (
  profileId: string, 
  classification: { category: string; confidence: number; explanation: string }
): Promise<void> => {
  const { error } = await supabase
    .from('investor_classifications')
    .insert({
      profile_id: profileId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      category: classification.category,
      confidence: classification.confidence,
      explanation: classification.explanation,
    });

  if (error) throw error;
};

export const getUserInvestorProfiles = async (): Promise<(DatabaseInvestorProfile & { 
  classifications: InvestorClassification[] 
})[]> => {
  const { data, error } = await supabase
    .from('investor_profiles')
    .select(`
      *,
      investor_classifications (
        id,
        category,
        confidence,
        explanation,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Map the data to match our interface structure
  return (data || []).map(profile => {
    const { investor_classifications, ...profileWithoutClassifications } = profile;
    return {
      ...profileWithoutClassifications,
      classifications: (investor_classifications || []).map((classification: any) => ({
        id: classification.id,
        category: classification.category as InvestorClassification['category'],
        confidence: classification.confidence,
        explanation: classification.explanation,
        created_at: classification.created_at,
      }))
    };
  });
};

export const classifyInvestor = async (profileData: InvestorProfileData) => {
  const { data, error } = await supabase.functions.invoke('categorize-investor', {
    body: { data: profileData }
  });

  if (error) throw error;
  return data;
};
