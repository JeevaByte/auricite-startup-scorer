import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Download, Search, Users, TrendingUp, FileText, Settings, History, RefreshCw, FileSearch } from 'lucide-react';
import { ScoringVersionManager } from '@/components/admin/ScoringVersionManager';
import { RescoreManager } from '@/components/admin/RescoreManager';
import { AuditTrail } from '@/components/admin/AuditTrail';

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

  const filteredAssessments = assessments.filter(assessment =>
    assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="text-2xl font-bold">{stats.avgScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
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

      <Tabs defaultValue="assessments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessments">All Assessments</TabsTrigger>
          <TabsTrigger value="scoring">Scoring Management</TabsTrigger>
          <TabsTrigger value="rescore">Dynamic Re-Scoring</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="config">System Config</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assessment.user_name}</div>
                          <div className="text-sm text-muted-foreground">{assessment.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{assessment.company_name}</TableCell>
                      <TableCell>
                        <Badge variant={assessment.total_score && assessment.total_score > 600 ? "default" : "secondary"}>
                          {assessment.total_score || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assessment.total_score ? "default" : "secondary"}>
                          {assessment.total_score ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring">
          <ScoringVersionManager />
        </TabsContent>

        <TabsContent value="rescore">
          <RescoreManager />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced system configuration options will be available in the next update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
