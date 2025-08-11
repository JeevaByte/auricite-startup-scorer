import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentData } from '@/utils/scoreCalculator';
import { fetchBenchmarkData } from '@/utils/benchmarkingService';

interface Props {
  assessmentData: AssessmentData;
}

export default function BenchmarkComparison({ assessmentData }: Props) {
  const [rows, setRows] = useState<any[] | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchBenchmarkData(assessmentData);
      setRows(data);
    })();
  }, [assessmentData]);

  const summary = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const avg = (key: string) => {
      const nums = rows.map((r) => Number(r[key] ?? 0));
      return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
    };
    return {
      businessIdea: avg('business_idea'),
      financials: avg('financials'),
      team: avg('team'),
      traction: avg('traction'),
    };
  }, [rows]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmarking & Peer Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!rows ? (
          <p className="text-sm text-muted-foreground">Loading benchmark data…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No benchmark data available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summary && Object.entries(summary).map(([k, v]) => (
              <div key={k} className="p-4 rounded-lg border">
                <p className="text-xs uppercase text-muted-foreground">{k}</p>
                <p className="text-xl font-semibold">{v}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
