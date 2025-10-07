import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExportRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  completed_at: string | null;
  download_url: string | null;
  expires_at: string | null;
  error_message: string | null;
}

export const DataExport: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ExportRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExportRequests();
  }, [user]);

  const loadExportRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (error) {
      console.error('Error loading export requests:', error);
    }
  };

  const requestExport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', {
        body: { userId: user.id }
      });

      if (error) throw error;

      toast.success('Export request submitted. You will be notified when it is ready.');
      loadExportRequests();
    } catch (error) {
      toast.error('Failed to request data export');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <CardTitle>Data Export</CardTitle>
        </div>
        <CardDescription>
          Download a copy of all your data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            You can request a complete export of your data at any time. The export will include
            your profile information, assessments, scores, and all related data. Exports are
            available for 7 days after completion.
          </AlertDescription>
        </Alert>

        <Button onClick={requestExport} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          Request New Export
        </Button>

        {requests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Export History</h3>
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="text-sm font-medium capitalize">{request.status}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(request.requested_at).toLocaleString()}
                    </p>
                    {request.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        {request.error_message}
                      </p>
                    )}
                  </div>
                </div>
                {request.status === 'completed' && request.download_url && (
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a href={request.download_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </Button>
                    {request.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(request.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
