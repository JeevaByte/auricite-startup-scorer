import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StartupData {
  id: string;
  user_id: string;
  name: string;
  company_name: string;
  score: number;
  sector?: string;
  stage?: string;
  region?: string;
  traction?: number;
  revenue?: string;
  verified: boolean;
  business_idea?: number;
  team?: number;
  financials?: number;
  assessment_id?: string;
}

export interface SavedStartup extends StartupData {
  saved_at: string;
  notes?: string;
}

export interface PortfolioStartup extends StartupData {
  added_at: string;
  investment_amount?: number;
  investment_date?: string;
  status: string;
  notes?: string;
}

export const useInvestorData = () => {
  const [savedStartups, setSavedStartups] = useState<SavedStartup[]>([]);
  const [portfolioStartups, setPortfolioStartups] = useState<PortfolioStartup[]>([]);
  const [feedStartups, setFeedStartups] = useState<StartupData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedStartups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investor_saved_startups')
        .select(`
          *,
          profiles!investor_saved_startups_startup_user_id_fkey (
            full_name,
            company_name
          ),
          assessments!investor_saved_startups_assessment_id_fkey (
            id
          ),
          scores (
            total_score,
            business_idea,
            team,
            traction,
            financials
          )
        `)
        .eq('investor_user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const formattedData: SavedStartup[] = (data || []).map((item: any) => ({
        id: item.startup_user_id,
        user_id: item.startup_user_id,
        name: item.profiles?.full_name || 'Unknown',
        company_name: item.profiles?.company_name || 'Unknown Company',
        score: item.scores?.[0]?.total_score || 0,
        business_idea: item.scores?.[0]?.business_idea,
        team: item.scores?.[0]?.team,
        traction: item.scores?.[0]?.traction,
        financials: item.scores?.[0]?.financials,
        verified: false,
        saved_at: item.saved_at,
        notes: item.notes,
        assessment_id: item.assessment_id,
      }));

      setSavedStartups(formattedData);
    } catch (error: any) {
      toast({
        title: 'Error fetching saved startups',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPortfolioStartups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investor_portfolio')
        .select(`
          *,
          profiles!investor_portfolio_startup_user_id_fkey (
            full_name,
            company_name
          ),
          scores (
            total_score,
            business_idea,
            team,
            traction,
            financials
          )
        `)
        .eq('investor_user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const formattedData: PortfolioStartup[] = (data || []).map((item: any) => ({
        id: item.startup_user_id,
        user_id: item.startup_user_id,
        name: item.profiles?.full_name || 'Unknown',
        company_name: item.profiles?.company_name || 'Unknown Company',
        score: item.scores?.[0]?.total_score || 0,
        business_idea: item.scores?.[0]?.business_idea,
        team: item.scores?.[0]?.team,
        traction: item.scores?.[0]?.traction,
        financials: item.scores?.[0]?.financials,
        verified: false,
        added_at: item.added_at,
        investment_amount: item.investment_amount,
        investment_date: item.investment_date,
        status: item.status,
        notes: item.notes,
        assessment_id: item.assessment_id,
      }));

      setPortfolioStartups(formattedData);
    } catch (error: any) {
      toast({
        title: 'Error fetching portfolio',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchFeedStartups = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          user_id,
          profiles!assessments_user_id_fkey (
            full_name,
            company_name
          ),
          scores (
            total_score,
            business_idea,
            team,
            traction,
            financials
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedData: StartupData[] = (data || []).map((item: any) => ({
        id: item.user_id,
        user_id: item.user_id,
        name: item.profiles?.full_name || 'Unknown',
        company_name: item.profiles?.company_name || 'Unknown Company',
        score: item.scores?.[0]?.total_score || 0,
        business_idea: item.scores?.[0]?.business_idea,
        team: item.scores?.[0]?.team,
        traction: item.scores?.[0]?.traction,
        financials: item.scores?.[0]?.financials,
        verified: false,
        assessment_id: item.id,
      }));

      setFeedStartups(formattedData);
    } catch (error: any) {
      toast({
        title: 'Error fetching startups feed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const saveStartup = async (startupUserId: string, assessmentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_saved_startups')
        .insert({
          investor_user_id: user.id,
          startup_user_id: startupUserId,
          assessment_id: assessmentId,
        });

      if (error) throw error;

      toast({
        title: 'Startup saved',
        description: 'Added to your saved startups',
      });

      await fetchSavedStartups();
    } catch (error: any) {
      toast({
        title: 'Error saving startup',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const unsaveStartup = async (startupUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_saved_startups')
        .delete()
        .eq('investor_user_id', user.id)
        .eq('startup_user_id', startupUserId);

      if (error) throw error;

      toast({
        title: 'Startup removed',
        description: 'Removed from your saved startups',
      });

      await fetchSavedStartups();
    } catch (error: any) {
      toast({
        title: 'Error removing startup',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addToPortfolio = async (startupUserId: string, assessmentId?: string, data?: {
    investment_amount?: number;
    investment_date?: string;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('investor_portfolio')
        .insert({
          investor_user_id: user.id,
          startup_user_id: startupUserId,
          assessment_id: assessmentId,
          ...data,
        });

      if (error) throw error;

      toast({
        title: 'Added to portfolio',
        description: 'Startup added to your investment portfolio',
      });

      await fetchPortfolioStartups();
    } catch (error: any) {
      toast({
        title: 'Error adding to portfolio',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSavedStartups(),
        fetchPortfolioStartups(),
        fetchFeedStartups(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    savedStartups,
    portfolioStartups,
    feedStartups,
    loading,
    saveStartup,
    unsaveStartup,
    addToPortfolio,
    refreshData: async () => {
      await Promise.all([
        fetchSavedStartups(),
        fetchPortfolioStartups(),
        fetchFeedStartups(),
      ]);
    },
  };
};
