
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Users, BarChart3, Settings, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminStats {
  totalAssessments: number;
  totalUsers: number;
  averageScore: number;
  todayAssessments: number;
}

interface AssessmentWithUser {
  id: string;
  created_at: string;
  user_id: string;
  total_score: number;
  user_email?: string;
  company_name?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalAssessments: 0,
    totalUsers: 0,
    averageScore: 0,
    todayAssessments: 0,
  });
  const [assessments, setAssessments] = useState<AssessmentWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentWithUser[]>([]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    const filtered = assessments.filter(assessment =>
      assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.id.includes(searchTerm)
    );
    setFilteredAssessments(filtered);
  }, [assessments, searchTerm]);

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

      setIsAdmin(!!data);
      if (data) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const [assessmentsResult, scoresResult, profilesResult] = await Promise.all([
        supabase.from('assessments').select('*', { count: 'exact' }),
        supabase.from('scores').select('total_score'),
        supabase.from('profiles').select('*', { count: 'exact' })
      ]);

      const totalAssessments = assessmentsResult.count || 0;
      const totalUsers = profilesResult.count || 0;
      const scores = scoresResult.data || [];
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score.total_score, 0) / scores.length 
        : 0;

      // Count today's assessments
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact' })
        .gte('created_at', today);

      setStats({
        totalAssessments,
        totalUsers,
        averageScore: Math.round(averageScore),
        todayAssessments: todayCount || 0,
      });

      // Load assessments with user data
      const { data: assessmentsWithScores } = await supabase
        .from('assessments')
        .select(`
          id,
          created_at,
          user_id,
          scores!inner(total_score),
          profiles!inner(email, company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      const formattedAssessments = (assessmentsWithScores || []).map(assessment => ({
        id: assessment.id,
        created_at: assessment.created_at,
        user_id: assessment.user_id,
        total_score: assessment.scores[0]?.total_score || 0,
        user_email: assessment.profiles[0]?.email,
        company_name: assessment.profiles[0]?.company_name,
      }));

      setAssessments(formattedAssessments);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          scores(*),
          profiles(email, company_name, full_name)
        `);

      if (error) throw error;

      const csvContent = [
        ['Assessment ID', 'User Email', 'Company', 'Total Score', 'Created At', 'MRR', 'Employees', 'Revenue'].join(','),
        ...data.map(assessment => [
          assessment.id,
          assessment.profiles?.[0]?.email || '',
          assessment.profiles?.[0]?.company_name || '',
          assessment.scores?.[0]?.total_score || '',
          assessment.created_at,
          assessment.mrr,
          assessment.employees,
          assessment.revenue
        ].join(','))
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
        description: 'Assessment data has been exported to CSV',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please log in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have admin privileges to access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage investment readiness assessments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Assessments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAssessments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="config">Scoring Config</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Assessments</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assessments..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-mono text-xs">
                        {assessment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{assessment.user_email}</TableCell>
                      <TableCell>{assessment.company_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={assessment.total_score >= 700 ? 'default' : 'secondary'}
                        >
                          {assessment.total_score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Scoring Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Scoring configuration is now managed in the database. 
                Use the scoring_config table to update weights and sector-specific settings.
              </p>
              <Button variant="outline">
                Edit Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
