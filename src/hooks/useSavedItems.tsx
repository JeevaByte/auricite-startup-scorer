import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSavedItems() {
  const [savedInvestors, setSavedInvestors] = useState<string[]>([]);
  const [savedStartups, setSavedStartups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [investorsRes, startupsRes] = await Promise.all([
        supabase.from('saved_investors').select('investor_id').eq('user_id', user.id),
        supabase.from('saved_startups').select('startup_id').eq('user_id', user.id)
      ]);

      if (investorsRes.data) {
        setSavedInvestors(investorsRes.data.map(item => item.investor_id));
      }
      if (startupsRes.data) {
        setSavedStartups(startupsRes.data.map(item => item.startup_id));
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveInvestor = async (investorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please log in to save investors', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('saved_investors')
        .insert({ user_id: user.id, investor_id: investorId });

      if (error) throw error;

      setSavedInvestors(prev => [...prev, investorId]);
      toast({ title: 'Investor saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const unsaveInvestor = async (investorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_investors')
        .delete()
        .eq('user_id', user.id)
        .eq('investor_id', investorId);

      if (error) throw error;

      setSavedInvestors(prev => prev.filter(id => id !== investorId));
      toast({ title: 'Investor removed from saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const saveStartup = async (startupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please log in to save startups', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('saved_startups')
        .insert({ user_id: user.id, startup_id: startupId });

      if (error) throw error;

      setSavedStartups(prev => [...prev, startupId]);
      toast({ title: 'Startup saved successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const unsaveStartup = async (startupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('saved_startups')
        .delete()
        .eq('user_id', user.id)
        .eq('startup_id', startupId);

      if (error) throw error;

      setSavedStartups(prev => prev.filter(id => id !== startupId));
      toast({ title: 'Startup removed from saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return {
    savedInvestors,
    savedStartups,
    loading,
    saveInvestor,
    unsaveInvestor,
    saveStartup,
    unsaveStartup,
    isInvestorSaved: (id: string) => savedInvestors.includes(id),
    isStartupSaved: (id: string) => savedStartups.includes(id)
  };
}
