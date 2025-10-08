import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SubMetric {
  name: string;
  value: number;
  benchmark?: number;
  label: string;
}

interface ScoreSubmetricsProps {
  category: 'business_idea' | 'team' | 'traction' | 'financials';
  submetrics: {
    // Traction
    revenue_growth_pct?: number;
    retention_rate?: number;
    cac_ltv_ratio?: number;
    user_acquisition_rate?: number;
    // Team
    team_completeness?: number;
    domain_expertise?: number;
    advisor_quality?: number;
    hiring_velocity?: number;
    // Business Idea
    market_size_score?: number;
    product_differentiation?: number;
    scalability_score?: number;
    innovation_index?: number;
    // Financials
    burn_rate_efficiency?: number;
    runway_adequacy?: number;
    revenue_quality?: number;
    unit_economics?: number;
  };
  benchmarks?: {
    revenue_growth_benchmark?: number;
    retention_benchmark?: number;
    cac_ltv_benchmark?: number;
  };
}

const CATEGORY_METRICS: Record<string, SubMetric[]> = {
  traction: [
    { name: 'revenue_growth_pct', label: 'Revenue Growth %', value: 0 },
    { name: 'retention_rate', label: 'Retention Rate', value: 0, benchmark: 70 },
    { name: 'cac_ltv_ratio', label: 'CAC/LTV Ratio', value: 0, benchmark: 2.0 },
    { name: 'user_acquisition_rate', label: 'User Acquisition', value: 0 }
  ],
  team: [
    { name: 'team_completeness', label: 'Team Completeness', value: 0 },
    { name: 'domain_expertise', label: 'Domain Expertise', value: 0 },
    { name: 'advisor_quality', label: 'Advisor Quality', value: 0 },
    { name: 'hiring_velocity', label: 'Hiring Velocity', value: 0 }
  ],
  business_idea: [
    { name: 'market_size_score', label: 'Market Size', value: 0 },
    { name: 'product_differentiation', label: 'Differentiation', value: 0 },
    { name: 'scalability_score', label: 'Scalability', value: 0 },
    { name: 'innovation_index', label: 'Innovation', value: 0 }
  ],
  financials: [
    { name: 'burn_rate_efficiency', label: 'Burn Rate Efficiency', value: 0 },
    { name: 'runway_adequacy', label: 'Runway Adequacy', value: 0 },
    { name: 'revenue_quality', label: 'Revenue Quality', value: 0 },
    { name: 'unit_economics', label: 'Unit Economics', value: 0 }
  ]
};

const getTrendIcon = (value: number, benchmark?: number) => {
  if (!benchmark) return <Minus className="w-4 h-4 text-muted-foreground" />;
  
  const diff = ((value - benchmark) / benchmark) * 100;
  
  if (diff > 10) return <TrendingUp className="w-4 h-4 text-success" />;
  if (diff < -10) return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const getPerformanceLevel = (value: number, benchmark?: number): string => {
  if (!benchmark) return 'Not Available';
  
  const ratio = value / benchmark;
  
  if (ratio >= 1.2) return 'Excellent';
  if (ratio >= 1.0) return 'Above Average';
  if (ratio >= 0.8) return 'Average';
  return 'Below Average';
};

export const ScoreSubmetrics: React.FC<ScoreSubmetricsProps> = ({
  category,
  submetrics,
  benchmarks = {}
}) => {
  const categoryMetrics = CATEGORY_METRICS[category] || [];
  
  const metricsWithValues = categoryMetrics.map(metric => {
    const value = submetrics[metric.name as keyof typeof submetrics] || 0;
    const benchmarkValue = benchmarks[`${metric.name}_benchmark` as keyof typeof benchmarks];
    
    return {
      ...metric,
      value,
      benchmark: benchmarkValue || metric.benchmark
    };
  }).filter(m => m.value > 0); // Only show metrics with values

  if (metricsWithValues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your assessment to see detailed performance metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{category.replace('_', ' ')} - Detailed KPIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metricsWithValues.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metric.label}</span>
                {getTrendIcon(metric.value, metric.benchmark)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                  {metric.name.includes('_pct') || metric.name.includes('_rate') ? '%' : ''}
                </span>
                {metric.benchmark && (
                  <Badge variant="outline" className="text-xs">
                    vs {metric.benchmark}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <Progress 
                value={Math.min(100, (metric.value / (metric.benchmark || 100)) * 100)} 
                className="h-2"
              />
              {metric.benchmark && (
                <p className="text-xs text-muted-foreground">
                  {getPerformanceLevel(metric.value, metric.benchmark)} compared to industry
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};