import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, ArrowRight, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ZohoSyncManager = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ direction: string; results: any } | null>(null);
  const { toast } = useToast();

  const handleSync = async (direction: 'db-to-zoho' | 'zoho-to-db' | 'both') => {
    setSyncing(true);
    try {
      console.log(`Initiating ${direction} sync...`);

      const { data, error } = await supabase.functions.invoke('sync-zoho', {
        body: { direction },
      });

      if (error) throw error;

      setLastSync({ direction, results: data });

      const successCount = {
        dbToZoho: data.dbToZoho?.filter((r: any) => r.success).length || 0,
        zohoToDb: data.zohoToDb?.filter((r: any) => r.success).length || 0,
      };

      toast({
        title: 'Sync Completed',
        description: `Successfully synced ${successCount.dbToZoho} profiles to Zoho and ${successCount.zohoToDb} contacts from Zoho.`,
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync with Zoho CRM',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zoho CRM Sync</CardTitle>
        <CardDescription>
          Synchronize investor profiles between your database and Zoho CRM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleSync('db-to-zoho')}
            disabled={syncing}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            DB → Zoho
          </Button>

          <Button
            onClick={() => handleSync('zoho-to-db')}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
            Zoho → DB
          </Button>

          <Button
            onClick={() => handleSync('both')}
            disabled={syncing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-4 w-4" />
            )}
            Two-Way Sync
          </Button>
        </div>

        {lastSync && (
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Last Sync: {lastSync.direction}</p>
                {lastSync.results.dbToZoho && (
                  <p className="text-sm">
                    DB → Zoho: {lastSync.results.dbToZoho.filter((r: any) => r.success).length} synced,{' '}
                    {lastSync.results.dbToZoho.filter((r: any) => !r.success).length} failed
                  </p>
                )}
                {lastSync.results.zohoToDb && (
                  <p className="text-sm">
                    Zoho → DB: {lastSync.results.zohoToDb.filter((r: any) => r.success).length} synced,{' '}
                    {lastSync.results.zohoToDb.filter((r: any) => !r.success).length} failed
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>DB → Zoho:</strong> Push investor profiles from your database to Zoho CRM</p>
          <p><strong>Zoho → DB:</strong> Pull investor contacts from Zoho CRM to your database</p>
          <p><strong>Two-Way Sync:</strong> Perform both operations in sequence</p>
        </div>
      </CardContent>
    </Card>
  );
};
