
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAuditLogs, AuditLog } from '@/utils/auditService';
import { FileSearch, Filter } from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTable, setFilterTable] = useState('');
  const [filterRecord, setFilterRecord] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [filterTable, filterRecord]);

  const loadAuditLogs = async () => {
    setLoading(true);
    const logs = await getAuditLogs(
      filterTable || undefined,
      filterRecord || undefined
    );
    setAuditLogs(logs);
    setLoading(false);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Badge className="bg-green-100 text-green-800">CREATE</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-100 text-blue-800">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">DELETE</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  if (loading) {
    return <div>Loading audit trail...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="filterTable">Table Name</Label>
            <Input
              id="filterTable"
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              placeholder="Filter by table name..."
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="filterRecord">Record ID</Label>
            <Input
              id="filterRecord"
              value={filterRecord}
              onChange={(e) => setFilterRecord(e.target.value)}
              placeholder="Filter by record ID..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="font-medium">{log.table_name}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {log.record_id.slice(0, 8)}...
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                
                {log.user_id && (
                  <div className="text-sm text-muted-foreground">
                    User: {log.user_id.slice(0, 8)}...
                  </div>
                )}

                {(log.old_values || log.new_values) && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground">
                      View Changes
                    </summary>
                    <div className="mt-2 space-y-2">
                      {log.old_values && (
                        <div>
                          <strong>Before:</strong>
                          <pre className="p-2 bg-red-50 rounded text-xs overflow-auto">
                            {JSON.stringify(log.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_values && (
                        <div>
                          <strong>After:</strong>
                          <pre className="p-2 bg-green-50 rounded text-xs overflow-auto">
                            {JSON.stringify(log.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
