import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AssessmentData } from '@/utils/scoreCalculator';
import { calculateDynamicScore } from '@/utils/dynamicScoreCalculator';
import { ScoreGauge } from '@/components/ScoreGauge';

interface Props {
  assessmentData: AssessmentData;
  baselineTotal: number;
}

export default function ScenarioSimulator({ assessmentData, baselineTotal }: Props) {
  const [revenuePct, setRevenuePct] = useState(20);
  const [mrrPct, setMrrPct] = useState(20);
  const [teamDelta, setTeamDelta] = useState(1);
  const [fundingDelta, setFundingDelta] = useState(100000);

  const simulated = useMemo(() => {
    const clone: AssessmentData = { ...assessmentData } as any;

    // naive adjustments based on available fields
    if (clone.revenue) clone.revenue = true; // boolean in our schema; we keep it simple
    if (clone.mrr && clone.mrr !== 'high') {
      // promote one level if positive pct
      const order = ['none', 'low', 'medium', 'high'] as const;
      const idx = Math.min(order.indexOf(clone.mrr as any) + (mrrPct > 0 ? 1 : 0), order.length - 1);
      clone.mrr = order[idx] as any;
    }
    if (clone.employees) {
      const order = ['1-2', '3-10', '11-50', '50+'] as const;
      const idx = Math.min(order.indexOf(clone.employees as any) + (teamDelta > 0 ? 1 : 0), order.length - 1);
      clone.employees = order[idx] as any;
    }
    if (clone.fundingGoal) {
      const asNumber = Number((clone.fundingGoal as any).toString().replace(/[^0-9.-]/g, '')) || 0;
      const updated = Math.max(0, asNumber + fundingDelta);
      clone.fundingGoal = String(updated);
    }

    const res = calculateDynamicScore(clone);
    return res.totalScore;
  }, [assessmentData, mrrPct, teamDelta, fundingDelta]);

  const diff = simulated - baselineTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario & What‑if Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Revenue Change (%)</Label>
            <Input type="number" value={revenuePct} onChange={(e) => setRevenuePct(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>MRR Change (%)</Label>
            <Input type="number" value={mrrPct} onChange={(e) => setMrrPct(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Team Change (Δ members)</Label>
            <Input type="number" value={teamDelta} onChange={(e) => setTeamDelta(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Additional Funding ($)</Label>
            <Input type="number" value={fundingDelta} onChange={(e) => setFundingDelta(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="text-center">
            <ScoreGauge score={baselineTotal} maxScore={999} title="Current Total" />
          </div>
          <div className="text-center">
            <ScoreGauge score={simulated} maxScore={999} title="Simulated Total" />
            <p className={`mt-2 text-sm ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {diff >= 0 ? '+' : ''}{Math.round(diff)} vs current
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => { setRevenuePct(20); setMrrPct(20); setTeamDelta(1); setFundingDelta(100000); }}>
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}
