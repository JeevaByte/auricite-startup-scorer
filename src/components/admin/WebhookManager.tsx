
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export const WebhookManager: React.FC = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: ['score_created', 'score_updated']
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('webhook_configs')
        .insert({
          name: newWebhook.name,
          url: newWebhook.url,
          events: newWebhook.events,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Webhook configuration added successfully',
      });

      setNewWebhook({ name: '', url: '', events: ['score_created', 'score_updated'] });
      setShowAdd(false);
      loadWebhooks();
    } catch (error) {
      console.error('Error adding webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to add webhook configuration',
        variant: 'destructive',
      });
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Webhook ${isActive ? 'enabled' : 'disabled'} successfully`,
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to update webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Webhook configuration deleted successfully',
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading webhook configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Webhook Management
          </CardTitle>
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          {showAdd && (
            <div className="border rounded-lg p-4 mb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Name *</Label>
                <Input
                  id="webhook-name"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                  placeholder="Slack Notifications"
                  aria-label="Webhook name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL *</Label>
                <Input
                  id="webhook-url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                  placeholder="https://hooks.slack.com/services/..."
                  aria-label="Webhook URL"
                />
              </div>

              <div className="space-y-2">
                <Label>Events</Label>
                <div className="flex gap-2">
                  <Badge variant="secondary">score_created</Badge>
                  <Badge variant="secondary">score_updated</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddWebhook}>Add Webhook</Button>
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{webhook.name}</h3>
                    <p className="text-sm text-muted-foreground">{webhook.url}</p>
                    <div className="flex gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) => toggleWebhook(webhook.id, checked)}
                      aria-label={`Toggle ${webhook.name} webhook`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                      aria-label={`Delete ${webhook.name} webhook`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {webhooks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No webhook configurations found. Add one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
