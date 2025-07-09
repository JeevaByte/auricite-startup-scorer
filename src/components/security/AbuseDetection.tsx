
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AbuseReport {
  id: string;
  report_type: string;
  severity: string;
  status: string;
  created_at: string;
  details: any;
}

export const AbuseDetection: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAbuseReports();
  }, []);

  const loadAbuseReports = async () => {
    try {
      const { data, error } = await supabase
        .from('abuse_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading abuse reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load abuse reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('abuse_reports')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Abuse report resolved successfully',
      });

      loadAbuseReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve abuse report',
        variant: 'destructive',
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Loading abuse detection reports...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Abuse Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <span className="font-medium">{report.report_type}</span>
                  {getSeverityBadge(report.severity)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  {report.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => resolveReport(report.id)}
                      aria-label={`Resolve ${report.report_type} report`}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
              
              {report.details && Object.keys(report.details).length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(report.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No abuse reports found. System is secure!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
