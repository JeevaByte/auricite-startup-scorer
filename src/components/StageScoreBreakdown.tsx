import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, TrendingUp } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface StageWeights {
  team: number;
  product: number;
  market: number;
  financials: number;
  traction: number;
  legal: number;
}

interface ScoreBreakdownProps {
  stage: string;
  scores: {
    team: number;
    business_idea: number;
    traction: number;
    financials: number;
  };
}

export function StageScoreBreakdown({ stage, scores }: ScoreBreakdownProps) {
  const [weights, setWeights] = useState<StageWeights | null>(null);

  useEffect(() => {
    fetchWeights();
  }, [stage]);

  const fetchWeights = async () => {
    try {
      const { data, error } = await supabase
        .from("score_weights")
        .select("weights")
        .eq("stage", stage.toLowerCase().replace(" ", "-"))
        .single();

      if (error) throw error;
      if (data && typeof data.weights === 'object') {
        setWeights(data.weights as unknown as StageWeights);
      }
    } catch (error) {
      console.error("Error fetching weights:", error);
    }
  };

  if (!weights) return null;

  const chartData = [
    { subject: "Team", value: scores.team, weight: weights.team * 100 },
    { subject: "Product", value: scores.business_idea, weight: weights.product * 100 },
    { subject: "Market", value: scores.business_idea, weight: weights.market * 100 },
    { subject: "Financials", value: scores.financials, weight: weights.financials * 100 },
    { subject: "Traction", value: scores.traction, weight: weights.traction * 100 },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="mr-2 h-4 w-4" />
          See Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Score Breakdown for {stage}</DialogTitle>
          <DialogDescription>
            How your score was calculated based on {stage} stage weights
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{stage}</Badge>
            <p className="text-sm text-muted-foreground">
              Stage-specific weighting applied
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Your Score"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            <h4 className="font-semibold">Component Weights</h4>
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Card className="p-4 bg-muted">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Stage-Aware Scoring</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Different funding stages prioritize different metrics. For {stage}, 
                  {weights.team > 0.25 && " team strength is heavily weighted"}
                  {weights.traction > 0.20 && " traction is a key factor"}
                  {weights.financials > 0.20 && " financial metrics are critical"}
                  .
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
