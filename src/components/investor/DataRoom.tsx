import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Lock, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface DataRoomProps {
  startupUserId: string;
  startupName: string;
}

export const DataRoom = ({ startupUserId, startupName }: DataRoomProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<any[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      // Load pitch decks
      const { data: docs, error: docsError } = await supabase
        .from('pitch_decks')
        .select('*')
        .eq('user_id', startupUserId);

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Load access requests
      const { data: requests, error: requestsError } = await supabase
        .from('document_access_requests')
        .select('*')
        .eq('startup_user_id', startupUserId);

      if (requestsError) throw requestsError;
      setAccessRequests(requests || []);
    } catch (error: any) {
      console.error('Failed to load data room:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startupUserId]);

  const requestAccess = async () => {
    try {
      const { error } = await supabase.functions.invoke('manage-document-access', {
        body: {
          action: 'request',
          startupUserId,
          message: requestMessage
        }
      });

      if (error) throw error;

      toast({
        title: "Access Requested",
        description: "Your request has been sent to the startup"
      });

      setRequestDialogOpen(false);
      setRequestMessage('');
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Denied</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const hasApprovedAccess = accessRequests.some(r => r.status === 'approved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Room - {startupName}</span>
          {!hasApprovedAccess && (
            <Button onClick={() => setRequestDialogOpen(true)} size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Request Access
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="requests">Access Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No documents available
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {hasApprovedAccess ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <Lock className="h-4 w-4 mr-2" />
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {accessRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No access requests yet
              </p>
            ) : (
              accessRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Access Request</p>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.message && (
                    <p className="text-sm text-muted-foreground">
                      Message: {request.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Data Room Access</DialogTitle>
              <DialogDescription>
                Send a request to access {startupName}'s documents
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Optional: Add a message explaining why you'd like access..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={requestAccess}>
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};