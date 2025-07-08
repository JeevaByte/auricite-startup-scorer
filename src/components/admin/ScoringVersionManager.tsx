
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  createScoringVersion, 
  getScoringHistory, 
  revertToVersion,
  ScoringVersion 
} from '@/utils/versioningService';
import { History, RotateCcw, Save } from 'lucide-react';

export const ScoringVersionManager: React.FC = () => {
  const { toast } = useToast();
  const [versions, setVersions] = useState<ScoringVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConfig, setNewConfig] = useState('');
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    const history = await getScoringHistory();
    setVersions(history);
    setLoading(false);
  };

  const handleCreateVersion = async () => {
    if (!newConfig.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter configuration data.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const configData = JSON.parse(newConfig);
      const result = await createScoringVersion(configData, changeReason);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: `Created version ${result.version} successfully.`,
        });
        setNewConfig('');
        setChangeReason('');
        await loadVersions();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid JSON configuration.',
        variant: 'destructive',
      });
    }
  };

  const handleRevertToVersion = async (versionId: string, version: number) => {
    const reason = prompt(`Why are you reverting to version ${version}?`);
    if (!reason) return;

    const result = await revertToVersion(versionId, reason);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: `Reverted to version ${version} successfully.`,
      });
      await loadVersions();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading versions...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Create New Scoring Version
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="changeReason">Change Reason</Label>
            <Input
              id="changeReason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Describe what changed and why..."
            />
          </div>
          <div>
            <Label htmlFor="configData">Configuration JSON</Label>
            <Textarea
              id="configData"
              value={newConfig}
              onChange={(e) => setNewConfig(e.target.value)}
              placeholder="Enter scoring configuration JSON..."
              rows={10}
            />
          </div>
          <Button onClick={handleCreateVersion}>
            Create Version
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Version {version.version}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevertToVersion(version.id, version.version)}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Revert
                  </Button>
                </div>
                {version.change_reason && (
                  <p className="text-sm">{version.change_reason}</p>
                )}
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    View Configuration
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(version.config_data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
