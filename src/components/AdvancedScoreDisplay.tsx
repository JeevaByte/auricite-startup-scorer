import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Users, Target, AlertCircle, CheckCircle } from "lucide-react";

interface AdvancedScoreDisplayProps {
  score: number;
  calibratedScore: number;
  confidence: number;
  breakdown: {
    llm: number;
    embedding: number;
    ml: number;
  };
  categories: {
    innovation: number;
    traction: number;
    team: number;
    market: number;
  };
  explanations: {
    detailed: Record<string, string>;
    strengths: string[];
    weaknesses: string[];
  };
}

export default function AdvancedScoreDisplay({
  score,
  calibratedScore,
  confidence,
  breakdown,
  categories,
  explanations,
}: AdvancedScoreDisplayProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "text-green-500";
    if (conf >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Advanced Investment Readiness Score</span>
            <Badge variant={confidence >= 0.7 ? "default" : "secondary"}>
              <span className={getConfidenceColor(confidence)}>
                {(confidence * 100).toFixed(0)}% Confidence
              </span>
            </Badge>
          </CardTitle>
          <CardDescription>
            AI-powered multi-method scoring with explainability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              {calibratedScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Calibrated Score (Raw: {score})
            </p>
          </div>

          {/* Scoring Method Breakdown */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Scoring Methods</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  LLM Analysis
                </span>
                <span className="font-medium">{breakdown.llm}/100</span>
              </div>
              <Progress value={breakdown.llm} />

              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Embedding Similarity
                </span>
                <span className="font-medium">{breakdown.embedding.toFixed(1)}/100</span>
              </div>
              <Progress value={breakdown.embedding} />

              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  ML Model
                </span>
                <span className="font-medium">{breakdown.ml}/100</span>
              </div>
              <Progress value={breakdown.ml} />
            </div>
          </div>

          {/* Category Scores */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Category Breakdown</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Innovation</span>
                  <span className="font-medium">{categories.innovation.toFixed(0)}</span>
                </div>
                <Progress value={categories.innovation} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Traction</span>
                  <span className="font-medium">{categories.traction.toFixed(0)}</span>
                </div>
                <Progress value={categories.traction} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Team</span>
                  <span className="font-medium">{categories.team.toFixed(0)}</span>
                </div>
                <Progress value={categories.team} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Market</span>
                  <span className="font-medium">{categories.market.toFixed(0)}</span>
                </div>
                <Progress value={categories.market} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {explanations.strengths.map((strength, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {explanations.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
