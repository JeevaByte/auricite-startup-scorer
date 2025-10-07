import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'free' | 'investor' | 'fund_seeker' | 'admin';

export const useUserRole = () => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole('free');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('free');
        } else {
          setRole(data?.role || 'free');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('free');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRole();
    }
  }, [user, authLoading]);

  return { role, loading: loading || authLoading, isInvestor: role === 'investor', isFundSeeker: role === 'fund_seeker' };
};
