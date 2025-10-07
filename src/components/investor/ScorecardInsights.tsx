import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface ScorecardInsightsProps {
  startupId?: string;
}

export const ScorecardInsights: React.FC<ScorecardInsightsProps> = ({ startupId }) => {
  const scoreData = {
    total: 78,
    categories: [
      { name: 'Team', score: 85, evidence: ['Strong technical background', '3+ years experience', 'Previous successful exit'], strength: 'high' },
      { name: 'Product', score: 75, evidence: ['MVP launched', 'Active users: 1,200', 'Beta feedback positive'], strength: 'medium' },
      { name: 'Market', score: 80, evidence: ['TAM: $5B', 'Growing 25% YoY', 'Clear differentiation'], strength: 'high' },
      { name: 'Traction', score: 70, evidence: ['MRR: $15K', 'Growth: 20% MoM', '15 paying customers'], strength: 'medium' },
      { name: 'Financials', score: 75, evidence: ['18-month runway', 'Unit economics positive', 'Burn rate controlled'], strength: 'medium' },
      { name: 'Legal', score: 80, evidence: ['IP protected', 'Clean cap table', 'All agreements in place'], strength: 'high' }
    ],
    aiSummary: 'This startup demonstrates strong product-market fit with clear traction indicators. The team shows exceptional technical expertise with previous successful exits. Main area for improvement is financial forecasting - current projections lack detail for scaling phase. Competitive positioning is strong with clear differentiation. Legal foundation is solid with proper IP protection. Overall readiness score of 78 indicates strong investment potential for seed-stage funding.'
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'high': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Scorecard Insights</h2>
          <p className="text-muted-foreground">
            Detailed breakdown and explanation of the investment readiness score
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Overall Investment Readiness</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on comprehensive analysis of 6 key categories
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{scoreData.total}</div>
              <Badge className="mt-2">Strong Candidate</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {scoreData.categories.map((category) => (
          <Card key={category.name} className={`border ${getStrengthColor(category.strength)}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStrengthIcon(category.strength)}
                  {category.name}
                </CardTitle>
                <span className="text-2xl font-bold">{category.score}</span>
              </div>
              <Progress value={category.score} className="mt-2" />
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Evidence:</p>
              <ul className="space-y-1">
                {category.evidence.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI-Generated Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Auto-Due Diligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-sm leading-relaxed">
              {scoreData.aiSummary}
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Generate Investment Memo
            </Button>
            <Button variant="outline" size="sm">
              View Supporting Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Strengths & Concerns */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
          <CardHeader>
            <CardTitle className="text-lg text-green-700 dark:text-green-400">
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Experienced team with proven track record</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Strong market opportunity with clear TAM</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Solid legal foundation and IP protection</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/10">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-700 dark:text-yellow-400">
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Financial projections need more detail</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Customer acquisition strategy requires validation</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Scaling plan needs more specificity</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
