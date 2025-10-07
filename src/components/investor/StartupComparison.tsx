import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radar } from 'react-chartjs-2';
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';

interface Startup {
  id: string;
  name: string;
  stage: string;
  sector: string;
  totalScore: number;
  scores: {
    team: number;
    product: number;
    market: number;
    traction: number;
    financials: number;
    legal: number;
  };
  fundingRequired: string;
}

export const StartupComparison: React.FC = () => {
  const [selectedStartups, setSelectedStartups] = useState<Startup[]>([
    {
      id: '1',
      name: 'TechCo AI',
      stage: 'Seed',
      sector: 'AI/ML',
      totalScore: 78,
      scores: { team: 85, product: 75, market: 80, traction: 70, financials: 75, legal: 80 },
      fundingRequired: '$2M'
    },
    {
      id: '2',
      name: 'FinTech Solutions',
      stage: 'Pre-Seed',
      sector: 'FinTech',
      totalScore: 72,
      scores: { team: 80, product: 70, market: 75, traction: 65, financials: 70, legal: 72 },
      fundingRequired: '$500K'
    }
  ]);

  const radarData = {
    labels: ['Team', 'Product', 'Market', 'Traction', 'Financials', 'Legal'],
    datasets: selectedStartups.map((startup, index) => ({
      label: startup.name,
      data: [
        startup.scores.team,
        startup.scores.product,
        startup.scores.market,
        startup.scores.traction,
        startup.scores.financials,
        startup.scores.legal
      ],
      backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
      borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(139, 92, 246)',
      borderWidth: 2,
    })),
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20 }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Startup Comparison</h2>
        <p className="text-muted-foreground">
          Compare multiple startups side-by-side to make informed investment decisions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Score Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Startup Cards */}
        {selectedStartups.map((startup) => (
          <Card key={startup.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{startup.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{startup.stage}</Badge>
                    <Badge variant="outline">{startup.sector}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{startup.totalScore}</div>
                  <div className="text-xs text-muted-foreground">Total Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Funding Required</span>
                  <span className="font-semibold">{startup.fundingRequired}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(startup.scores).map(([category, score]) => (
                    <div key={category} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="font-medium w-8">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  View Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Generated Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <strong>TechCo AI</strong> demonstrates stronger team metrics (+5 points) and market positioning (+5 points) 
            compared to <strong>FinTech Solutions</strong>. However, FinTech Solutions shows better legal compliance 
            and foundation. TechCo AI requires 4x more capital but targets a larger market opportunity. 
            Both are at different stages - TechCo AI is more suitable for institutional investors seeking 
            established traction, while FinTech Solutions offers early-stage opportunities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
