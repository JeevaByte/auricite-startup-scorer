import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Flag, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_roles: string[];
  created_at: string;
}

export const FeatureFlagsManager: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const [formData, setFormData] = useState({
    flag_key: '',
    flag_name: '',
    description: '',
    enabled: false,
    rollout_percentage: 0,
    target_roles: [] as string[]
  });

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      toast.error('Failed to load feature flags');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFlag) {
        const { error } = await supabase
          .from('feature_flags')
          .update(formData)
          .eq('id', editingFlag.id);

        if (error) throw error;
        toast.success('Feature flag updated');
      } else {
        const { error } = await supabase
          .from('feature_flags')
          .insert([formData]);

        if (error) throw error;
        toast.success('Feature flag created');
      }

      setIsDialogOpen(false);
      resetForm();
      loadFeatureFlags();
    } catch (error) {
      toast.error('Failed to save feature flag');
      console.error(error);
    }
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !flag.enabled })
        .eq('id', flag.id);

      if (error) throw error;
      toast.success(`Feature flag ${!flag.enabled ? 'enabled' : 'disabled'}`);
      loadFeatureFlags();
    } catch (error) {
      toast.error('Failed to toggle feature flag');
      console.error(error);
    }
  };

  const deleteFlag = async (flagId: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', flagId);

      if (error) throw error;
      toast.success('Feature flag deleted');
      loadFeatureFlags();
    } catch (error) {
      toast.error('Failed to delete feature flag');
      console.error(error);
    }
  };

  const openEditDialog = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      flag_key: flag.flag_key,
      flag_name: flag.flag_name,
      description: flag.description || '',
      enabled: flag.enabled,
      rollout_percentage: flag.rollout_percentage,
      target_roles: flag.target_roles || []
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFlag(null);
    setFormData({
      flag_key: '',
      flag_name: '',
      description: '',
      enabled: false,
      rollout_percentage: 0,
      target_roles: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Flags</h2>
          <p className="text-muted-foreground">
            Manage feature rollouts and A/B testing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="flag_key">Flag Key</Label>
                <Input
                  id="flag_key"
                  value={formData.flag_key}
                  onChange={(e) => setFormData({ ...formData, flag_key: e.target.value })}
                  placeholder="new_dashboard_ui"
                  required
                  disabled={!!editingFlag}
                />
              </div>

              <div>
                <Label htmlFor="flag_name">Display Name</Label>
                <Input
                  id="flag_name"
                  value={formData.flag_name}
                  onChange={(e) => setFormData({ ...formData, flag_name: e.target.value })}
                  placeholder="New Dashboard UI"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this feature flag controls..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="rollout">Rollout Percentage: {formData.rollout_percentage}%</Label>
                <Slider
                  id="rollout"
                  value={[formData.rollout_percentage]}
                  onValueChange={([value]) => setFormData({ ...formData, rollout_percentage: value })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gradually roll out to a percentage of users
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingFlag ? 'Update' : 'Create'} Flag
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">Loading feature flags...</CardContent>
        </Card>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No feature flags created yet. Create your first flag to start managing feature rollouts.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Flag className="w-5 h-5 mt-0.5" />
                    <div>
                      <CardTitle className="text-lg">{flag.flag_name}</CardTitle>
                      <code className="text-xs text-muted-foreground">{flag.flag_key}</code>
                      {flag.description && (
                        <CardDescription className="mt-2">
                          {flag.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => toggleFlag(flag)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(flag)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFlag(flag.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {flag.rollout_percentage > 0 && (
                    <Badge variant="outline">
                      {flag.rollout_percentage}% rollout
                    </Badge>
                  )}
                  {flag.target_roles && flag.target_roles.length > 0 && (
                    <Badge variant="outline">
                      Roles: {flag.target_roles.join(', ')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
