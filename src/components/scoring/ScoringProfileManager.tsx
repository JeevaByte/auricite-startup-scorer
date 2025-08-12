import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Minimal weights shape expected by validate_scoring_config
// { businessIdea, financials, team, traction } -> must sum to ~1.0

export default function ScoringProfileManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('My Scoring Model');
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [weights, setWeights] = useState({
    businessIdea: 0.3,
    financials: 0.25,
    team: 0.25,
    traction: 0.2,
  });

  const total = useMemo(
    () => weights.businessIdea + weights.financials + weights.team + weights.traction,
    [weights]
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Load the user's default scoring profile if any
      const { data, error } = await supabase
        .from('user_scoring_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .maybeSingle();

      if (error) {
        console.error('Error loading scoring profile:', error);
        return;
      }
      if (data) {
        setProfileId(data.id);
        setName(data.name);
        // Only map known keys to avoid shape mismatch
        const w = (data.weights as unknown as Partial<{
          businessIdea: number; financials: number; team: number; traction: number;
        }>) || {};
        setWeights({
          businessIdea: Number(w.businessIdea ?? 0.3),
          financials: Number(w.financials ?? 0.25),
          team: Number(w.team ?? 0.25),
          traction: Number(w.traction ?? 0.2),
        });
      }
    })();
  }, [user]);

  const normalize = (w: typeof weights) => {
    const sum = w.businessIdea + w.financials + w.team + w.traction;
    if (sum === 0) return w;
    return {
      businessIdea: w.businessIdea / sum,
      financials: w.financials / sum,
      team: w.team / sum,
      traction: w.traction / sum,
    };
  };

  const save = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const normalized = normalize(weights);
      const payload = {
        user_id: user.id,
        name,
        role_type: 'investor',
        weights: normalized,
        is_default: true,
        visibility: 'private',
      } as const;

      if (profileId) {
        const { error } = await supabase
          .from('user_scoring_profiles')
          .update(payload)
          .eq('id', profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('user_scoring_profiles')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        setProfileId(data.id);
      }

      toast({ title: 'Saved', description: 'Your scoring model has been saved.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Save failed', description: e.message || 'Unexpected error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ label, keyName }: { label: string; keyName: keyof typeof weights }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{Math.round(weights[keyName] * 100)}%</span>
      </div>
      <Slider
        value={[weights[keyName] * 100]}
        min={0}
        max={100}
        step={1}
        onValueChange={(v) => setWeights((prev) => ({ ...prev, [keyName]: v[0] / 100 }))}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Scoring Weights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Row label="Business Idea" keyName="businessIdea" />
            <Row label="Financials" keyName="financials" />
          </div>
          <div className="space-y-4">
            <Row label="Team" keyName="team" />
            <Row label="Traction" keyName="traction" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Model Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className={total > 1.01 || total < 0.99 ? 'text-destructive font-semibold' : 'font-semibold'}>
              {Math.round(total * 100)}%
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={save} disabled={loading}>
            {loading ? 'Saving…' : 'Save as Default'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Note: Weights must sum to 100%. If they do not, we will normalize them automatically on save.
        </p>
      </CardContent>
    </Card>
  );
}
