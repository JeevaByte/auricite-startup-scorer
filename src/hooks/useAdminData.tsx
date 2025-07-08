
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AssessmentWithUser, DashboardStats } from '@/types/admin';

export const useAdminData = (userId: string | undefined) => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentWithUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    avgScore: 0,
    completionRate: 0,
    recentAssessments: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return;
      }

      if (data) {
        setIsAdmin(true);
        await loadDashboardData();
      } else {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load assessments with user info and scores
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          scores(total_score)
        `)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('Error loading assessments:', assessmentsError);
        throw assessmentsError;
      }

      // Get user profiles separately
      const userIds = [...new Set(assessmentsData?.map(a => a.user_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Combine assessment and profile data
      const enrichedAssessments: AssessmentWithUser[] = (assessmentsData || []).map(assessment => {
        const profile = profilesData?.find(p => p.id === assessment.user_id);
        return {
          ...assessment,
          user_email: profile?.email || 'N/A',
          user_name: profile?.full_name || 'N/A',
          company_name: profile?.company_name || 'N/A',
          total_score: assessment.scores?.[0]?.total_score || 0
        };
      });

      setAssessments(enrichedAssessments);

      // Calculate stats
      const totalAssessments = enrichedAssessments.length;
      const scoresWithValues = enrichedAssessments.filter(a => a.total_score && a.total_score > 0);
      const avgScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, a) => sum + (a.total_score || 0), 0) / scoresWithValues.length 
        : 0;
      
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentAssessments = enrichedAssessments.filter(
        a => new Date(a.created_at) > recentDate
      ).length;

      setStats({
        totalAssessments,
        avgScore: Math.round(avgScore),
        completionRate: scoresWithValues.length > 0 ? Math.round((scoresWithValues.length / totalAssessments) * 100) : 0,
        recentAssessments
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (userId) {
      checkAdminStatus();
    }
  }, [userId]);

  return {
    assessments,
    stats,
    loading,
    isAdmin,
    loadDashboardData
  };
};
