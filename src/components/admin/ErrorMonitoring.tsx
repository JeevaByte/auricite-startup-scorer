import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  stack_trace: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  resolved: boolean;
  created_at: string;
  url: string;
  user_id: string;
}

export const ErrorMonitoring: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    unresolved: 0,
    last24h: 0
  });

  useEffect(() => {
    loadErrors();
    loadStats();

    // Subscribe to real-time error updates
    const channel = supabase
      .channel('error-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'error_logs'
        },
        () => {
          loadErrors();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrors((data as any) || []);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: total } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true });

      const { count: critical } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'critical');

      const { count: unresolved } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: last24h } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yesterday.toISOString());

      setStats({
        total: total || 0,
        critical: critical || 0,
        unresolved: unresolved || 0,
        last24h: last24h || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const resolveError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', errorId);

      if (error) throw error;
      toast.success('Error marked as resolved');
      loadErrors();
      loadStats();
    } catch (error) {
      toast.error('Failed to resolve error');
      console.error(error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'warning':
        return <Info className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Errors</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.critical}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Unresolved</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.unresolved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 24h</CardDescription>
            <CardTitle className="text-3xl">{stats.last24h}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="unresolved">
        <TabsList>
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
          <TabsTrigger value="all">All Errors</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="unresolved" className="space-y-4">
          {errors
            .filter((e) => !e.resolved)
            .map((error) => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSeverityIcon(error.severity)}
                      <div className="flex-1">
                        <CardTitle className="text-base">{error.error_type}</CardTitle>
                        <CardDescription className="mt-1">
                          {error.error_message}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={getSeverityColor(error.severity) as any}>
                            {error.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(error.created_at).toLocaleString()}
                          </span>
                          {error.url && (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {new URL(error.url).pathname}
                            </code>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveError(error.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  </div>
                </CardHeader>
                {error.stack_trace && (
                  <CardContent>
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium mb-2">
                        Stack Trace
                      </summary>
                      <pre className="bg-muted p-3 rounded overflow-x-auto">
                        {error.stack_trace}
                      </pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all">
          {/* Similar layout for all errors */}
        </TabsContent>

        <TabsContent value="resolved">
          {/* Similar layout for resolved errors */}
        </TabsContent>
      </Tabs>
    </div>
  );
};
