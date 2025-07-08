
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { AdminTabs } from '@/components/admin/AdminTabs';

interface AssessmentWithUser {
  id: string;
  created_at: string;
  prototype: boolean;
  revenue: boolean;
  full_time_team: boolean;
  employees: string;
  funding_goal: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  company_name?: string;
  total_score?: number;
}

interface DashboardStats {
  totalAssessments: number;
  avgScore: number;
  completionRate: number;
  recentAssessments: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentWithUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    avgScore: 0,
    completionRate: 0,
    recentAssessments: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
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

  const exportToCSV = () => {
    const filteredAssessments = assessments.filter(assessment =>
      assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headers = ['Date', 'User Email', 'User Name', 'Company', 'Score', 'Prototype', 'Revenue', 'Team Size'];
    const csvData = [
      headers.join(','),
      ...filteredAssessments.map(assessment => [
        new Date(assessment.created_at).toLocaleDateString(),
        assessment.user_email || '',
        assessment.user_name || '',
        assessment.company_name || '',
        assessment.total_score || 0,
        assessment.prototype ? 'Yes' : 'No',
        assessment.revenue ? 'Yes' : 'No',
        assessment.employees
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminHeader onExportCSV={exportToCSV} />
      <DashboardStats stats={stats} />
      <AdminTabs 
        assessments={assessments}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </div>
  );
}
