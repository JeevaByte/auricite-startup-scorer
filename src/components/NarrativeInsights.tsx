import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  assessmentData: AssessmentData;
  scoreResult: ScoreResult;
}

export default function NarrativeInsights({ assessmentData, scoreResult }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<null | {
    overview: string;
    strengths: string[];
    risks: string[];
    opportunities: string[];
    action_items: string[];
  }>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-narrative', {
          body: { assessmentData, scoreResult },
        });
        if (error) throw error;
        setData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentData, scoreResult]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI‑Powered Narrative Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Generating narrative…</p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">Unable to generate narrative at this time.</p>
        ) : (
          <div className="space-y-3">
            <p>{data.overview}</p>
            <div>
              <p className="font-medium">Strengths</p>
              <ul className="list-disc ml-5 text-sm">
                {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium">Risks</p>
              <ul className="list-disc ml-5 text-sm">
                {data.risks.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium">Opportunities</p>
              <ul className="list-disc ml-5 text-sm">
                {data.opportunities.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-medium">Action Items</p>
              <ul className="list-disc ml-5 text-sm">
                {data.action_items.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
