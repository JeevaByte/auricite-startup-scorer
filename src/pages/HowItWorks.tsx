import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, TrendingUp, Users, DollarSign, FileCheck } from 'lucide-react';

export default function HowItWorks() {
  const stageWeights = {
    'Pre-Seed': { team: 35, product: 25, market: 20, traction: 5, financials: 10, legal: 5 },
    'Seed': { team: 30, product: 20, market: 20, traction: 15, financials: 10, legal: 5 },
    'Series A': { team: 25, product: 15, market: 20, traction: 20, financials: 15, legal: 5 },
    'Series B': { team: 20, product: 15, market: 15, traction: 25, financials: 20, legal: 5 },
    'Series C+': { team: 15, product: 10, market: 15, traction: 30, financials: 25, legal: 5 },
  };

  const components = [
    {
      name: 'Team',
      icon: Users,
      description: 'Experience, skills, commitment, and team composition',
      color: 'text-blue-500',
    },
    {
      name: 'Product',
      icon: Target,
      description: 'Product development stage, MVP status, and technical capabilities',
      color: 'text-purple-500',
    },
    {
      name: 'Market',
      icon: TrendingUp,
      description: 'Market size, opportunity, competition, and positioning',
      color: 'text-green-500',
    },
    {
      name: 'Traction',
      icon: BarChart3,
      description: 'User growth, revenue, engagement metrics, and milestones',
      color: 'text-orange-500',
    },
    {
      name: 'Financials',
      icon: DollarSign,
      description: 'Revenue model, burn rate, runway, and financial projections',
      color: 'text-emerald-500',
    },
    {
      name: 'Legal',
      icon: FileCheck,
      description: 'Company structure, IP protection, and compliance',
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">How the Fundraising Scorecard Works</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Our AI-powered scorecard evaluates your startup across multiple dimensions,
          providing investors with a comprehensive readiness assessment.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Components</CardTitle>
          <CardDescription>
            Your overall score is calculated from six key components, each weighted according to your funding stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => {
              const Icon = component.icon;
              return (
                <div key={component.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${component.color}`} />
                    <h3 className="font-semibold">{component.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stage-Aware Weighting</CardTitle>
          <CardDescription>
            Component weights adjust based on your funding stage to reflect investor priorities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="Pre-Seed" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {Object.keys(stageWeights).map((stage) => (
                <TabsTrigger key={stage} value={stage}>
                  {stage}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(stageWeights).map(([stage, weights]) => (
              <TabsContent key={stage} value={stage} className="space-y-4 mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(weights).map(([component, weight]) => (
                    <div key={component} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{component}</span>
                        <Badge variant="secondary">{weight}%</Badge>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${weight}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Why these weights?</strong>{' '}
                    {stage === 'Pre-Seed' &&
                      'At pre-seed, investors focus heavily on team quality and product vision, as traction is minimal.'}
                    {stage === 'Seed' &&
                      'Seed investors balance team strength with early product-market fit signals and initial traction.'}
                    {stage === 'Series A' &&
                      'Series A requires proven traction and clear path to scalable revenue alongside strong fundamentals.'}
                    {stage === 'Series B' &&
                      'Series B emphasizes consistent growth metrics and financial performance over team credentials.'}
                    {stage === 'Series C+' &&
                      'Later stages prioritize strong financials, sustained traction, and market dominance potential.'}
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>For Fundraisers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">✅ Identify Gaps</h4>
              <p className="text-sm text-muted-foreground">
                See which areas need improvement before approaching investors
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">📊 Track Progress</h4>
              <p className="text-sm text-muted-foreground">
                Monitor your readiness over time as you build and iterate
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">🎯 Stand Out</h4>
              <p className="text-sm text-muted-foreground">
                Demonstrate preparedness with a comprehensive, verified assessment
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Investors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">⚡ Quick Screening</h4>
              <p className="text-sm text-muted-foreground">
                Filter and prioritize deal flow with standardized assessments
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">🔍 Deep Insights</h4>
              <p className="text-sm text-muted-foreground">
                Access detailed component breakdowns and AI-generated recommendations
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">🤝 Better Matches</h4>
              <p className="text-sm text-muted-foreground">
                Find startups aligned with your investment thesis and stage focus
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Example Score Breakdown</h3>
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Overall Score</span>
                  <span className="text-3xl font-bold text-primary">82/100</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Team', score: 85, weight: 30 },
                    { name: 'Product', score: 78, weight: 20 },
                    { name: 'Market', score: 88, weight: 20 },
                    { name: 'Traction', score: 72, weight: 15 },
                    { name: 'Financials', score: 90, weight: 10 },
                    { name: 'Legal', score: 95, weight: 5 },
                  ].map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {item.name} <span className="text-muted-foreground">({item.weight}%)</span>
                        </span>
                        <span className="font-semibold">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
