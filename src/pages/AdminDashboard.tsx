
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Download, Search, Users, TrendingUp, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssessmentWithProfile {
  id: string;
  created_at: string;
  prototype: boolean;
  external_capital: boolean;
  revenue: boolean;
  full_time_team: boolean;
  term_sheets: boolean;
  cap_table: boolean;
  mrr: string;
  employees: string;
  funding_goal: string;
  investors: string;
  milestones: string;
  user_profile?: {
    email: string;
    full_name?: string;
    company_name?: string;
  };
  score?: {
    total_score: number;
    business_idea: number;
    financials: number;
    team: number;
    traction: number;
  };
}

interface DashboardStats {
  totalAssessments: number;
  averageScore: number;
  uniqueUsers: number;
  recentAssessments: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentWithProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    averageScore: 0,
    uniqueUsers: 0,
    recentAssessments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        navigate('/');
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
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load assessments with profiles and scores
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          profiles!inner(email, full_name, company_name),
          scores(total_score, business_idea, financials, team, traction)
        `)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        throw assessmentsError;
      }

      const formattedAssessments: AssessmentWithProfile[] = assessmentsData?.map(assessment => ({
        ...assessment,
        user_profile: {
          email: assessment.profiles?.email || 'Unknown',
          full_name: assessment.profiles?.full_name,
          company_name: assessment.profiles?.company_name,
        },
        score: assessment.scores?.[0] || undefined,
      })) || [];

      setAssessments(formattedAssessments);

      // Calculate stats
      const totalAssessments = formattedAssessments.length;
      const uniqueUsers = new Set(formattedAssessments.map(a => a.user_id)).size;
      const scoresWithData = formattedAssessments.filter(a => a.score);
      const averageScore = scoresWithData.length > 0
        ? scoresWithData.reduce((sum, a) => sum + (a.score?.total_score || 0), 0) / scoresWithData.length
        : 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentAssessments = formattedAssessments.filter(
        a => new Date(a.created_at) > oneWeekAgo
      ).length;

      setStats({
        totalAssessments,
        averageScore: Math.round(averageScore),
        uniqueUsers,
        recentAssessments,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const csvData = assessments.map(assessment => ({
        ID: assessment.id,
        'Created At': new Date(assessment.created_at).toLocaleDateString(),
        Email: assessment.user_profile?.email || 'Unknown',
        'Full Name': assessment.user_profile?.full_name || '',
        'Company Name': assessment.user_profile?.company_name || '',
        'Total Score': assessment.score?.total_score || 'N/A',
        'Business Idea': assessment.score?.business_idea || 'N/A',
        Financials: assessment.score?.financials || 'N/A',
        Team: assessment.score?.team || 'N/A',
        Traction: assessment.score?.traction || 'N/A',
        Prototype: assessment.prototype ? 'Yes' : 'No',
        'External Capital': assessment.external_capital ? 'Yes' : 'No',
        Revenue: assessment.revenue ? 'Yes' : 'No',
        'Full Time Team': assessment.full_time_team ? 'Yes' : 'No',
        'Term Sheets': assessment.term_sheets ? 'Yes' : 'No',
        'Cap Table': assessment.cap_table ? 'Yes' : 'No',
        MRR: assessment.mrr,
        Employees: assessment.employees,
        'Funding Goal': assessment.funding_goal,
        Investors: assessment.investors,
        Milestones: assessment.milestones,
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assessments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: 'Assessment data has been exported to CSV.',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export assessment data.',
        variant: 'destructive',
      });
    }
  };

  const filteredAssessments = assessments.filter(assessment =>
    (assessment.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (assessment.user_profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (assessment.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={exportData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAssessments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email, name, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Company</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Stage</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{new Date(assessment.created_at).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{assessment.user_profile?.full_name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{assessment.user_profile?.email || 'Unknown'}</div>
                      </div>
                    </td>
                    <td className="p-2">{assessment.user_profile?.company_name || 'N/A'}</td>
                    <td className="p-2">
                      {assessment.score ? (
                        <Badge variant={assessment.score.total_score >= 70 ? 'default' : 'secondary'}>
                          {assessment.score.total_score}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Score</Badge>
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{assessment.milestones}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={assessment.revenue ? 'default' : 'secondary'}>
                        {assessment.revenue ? 'Revenue' : 'Pre-Revenue'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAssessments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assessments found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
