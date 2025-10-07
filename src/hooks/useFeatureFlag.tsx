import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFeatureFlag = (flagKey: string) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFeatureFlag = async () => {
      if (!user) {
        setIsEnabled(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_feature_enabled', {
          _flag_key: flagKey,
          _user_id: user.id
        });

        if (error) throw error;
        setIsEnabled(data || false);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkFeatureFlag();

    // Subscribe to feature flag changes
    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
          filter: `flag_key=eq.${flagKey}`
        },
        () => {
          checkFeatureFlag();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flagKey, user]);

  return { isEnabled, loading };
};

export const FeatureFlag: React.FC<{
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ flag, children, fallback = null }) => {
  const { isEnabled, loading } = useFeatureFlag(flag);

  if (loading) return null;
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};
