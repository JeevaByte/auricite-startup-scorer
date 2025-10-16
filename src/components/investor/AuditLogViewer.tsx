import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Eye, Heart, ThumbsDown, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  action: string;
  startup_name: string;
  timestamp: string;
  details?: string;
}

export function AuditLogViewer() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAuditLogs();
    }
  }, [user]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Mock audit logs - in production this would fetch from database
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          action: 'viewed',
          startup_name: 'TechStartup Inc',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          action: 'saved',
          startup_name: 'InnovateCo',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          action: 'accepted',
          startup_name: 'GrowthLabs',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      setLogs(mockLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'saved': return <Heart className="h-4 w-4" />;
      case 'accepted': return <MessageSquare className="h-4 w-4" />;
      case 'passed': return <ThumbsDown className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      viewed: 'secondary',
      saved: 'default',
      accepted: 'default',
      passed: 'destructive',
    };
    return variants[action] || 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading activity...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Startup</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={getActionBadge(log.action)} className="gap-1">
                        {getActionIcon(log.action)}
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.startup_name}</TableCell>
                    <TableCell>
                      {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
