import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentData, ScoreResult } from '@/utils/scoreCalculator';
import { fetchBenchmarkData } from '@/utils/benchmarkingService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Award, AlertCircle } from 'lucide-react';

interface Props {
  assessmentData: AssessmentData;
  scoreResult: ScoreResult;
}

export const EnhancedBenchmarkComparison: React.FC<Props> = ({ assessmentData, scoreResult }) => {
  const [benchmarkData, setBenchmarkData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBenchmarks = async () => {
      const data = await fetchBenchmarkData(assessmentData);
      setBenchmarkData(data);
      setLoading(false);
    };

    loadBenchmarks();
  }, [assessmentData]);

  // Determine startup characteristics
  const getStartupProfile = () => {
    const stage = assessmentData.milestones || 'concept';
    const sector = determineSector();
    const teamSize = assessmentData.employees || '1-2';
    const fundingStage = assessmentData.fundingStage || 'preSeed';
    
    return { stage, sector, teamSize, fundingStage };
  };

  const determineSector = (): string => {
    // Basic sector detection logic - can be enhanced
    if (assessmentData.marketSize && ['500m-1b', '1b-10b', 'over10b'].includes(assessmentData.marketSize)) {
      return 'Large Market';
    }
    if (assessmentData.revenue) {
      return 'Revenue-Generating';
    }
    return 'Early Stage';
  };

  // Calculate percentiles vs industry
  const calculatePercentiles = () => {
    if (!benchmarkData || benchmarkData.length === 0) {
      return {
        businessIdea: 50,
        financials: 50,
        team: 50,
        traction: 50,
        overall: 50
      };
    }

    const profile = getStartupProfile();
    
    // Filter similar startups for more accurate benchmarking
    const similarStartups = benchmarkData.filter(item => 
      item.sector === profile.sector || item.stage === profile.stage
    );
    
    const dataset = similarStartups.length > 5 ? similarStartups : benchmarkData;
    
    const calculatePercentile = (value: number, field: string) => {
      const values = dataset.map(item => item[field] || 0).sort((a, b) => a - b);
      const rank = values.filter(v => v <= value).length;
      return Math.round((rank / values.length) * 100);
    };

    return {
      businessIdea: calculatePercentile(scoreResult.businessIdea, 'business_idea_avg'),
      financials: calculatePercentile(scoreResult.financials, 'financials_avg'),
      team: calculatePercentile(scoreResult.team, 'team_avg'),
      traction: calculatePercentile(scoreResult.traction, 'traction_avg'),
      overall: calculatePercentile(scoreResult.totalScore / 10, 'total_score_avg')
    };
  };

  const percentiles = calculatePercentiles();
  const profile = getStartupProfile();

  const getPercentileColor = (percentile: number): string => {
    if (percentile >= 80) return 'text-green-600';
    if (percentile >= 60) return 'text-blue-600';
    if (percentile >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPercentileMessage = (percentile: number): string => {
    if (percentile >= 90) return 'Top 10% performer';
    if (percentile >= 75) return 'Above average';
    if (percentile >= 50) return 'Average performance';
    if (percentile >= 25) return 'Below average';
    return 'Needs improvement';
  };

  const comparisonData = [
    {
      category: 'Business Idea',
      yourScore: scoreResult.businessIdea,
      industryAvg: benchmarkData ? Math.round(benchmarkData.reduce((acc, item) => acc + (item.business_idea_avg || 0), 0) / benchmarkData.length) : 50,
      percentile: percentiles.businessIdea
    },
    {
      category: 'Financials',
      yourScore: scoreResult.financials,
      industryAvg: benchmarkData ? Math.round(benchmarkData.reduce((acc, item) => acc + (item.financials_avg || 0), 0) / benchmarkData.length) : 50,
      percentile: percentiles.financials
    },
    {
      category: 'Team',
      yourScore: scoreResult.team,
      industryAvg: benchmarkData ? Math.round(benchmarkData.reduce((acc, item) => acc + (item.team_avg || 0), 0) / benchmarkData.length) : 50,
      percentile: percentiles.team
    },
    {
      category: 'Traction',
      yourScore: scoreResult.traction,
      industryAvg: benchmarkData ? Math.round(benchmarkData.reduce((acc, item) => acc + (item.traction_avg || 0), 0) / benchmarkData.length) : 50,
      percentile: percentiles.traction
    }
  ];

  const pieData = comparisonData.map(item => ({
    name: item.category,
    value: item.percentile,
    color: item.percentile >= 60 ? '#22c55e' : item.percentile >= 40 ? '#f59e0b' : '#ef4444'
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Startup Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Startup Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Stage</div>
              <Badge variant="outline" className="mt-1">
                {profile.stage.charAt(0).toUpperCase() + profile.stage.slice(1)}
              </Badge>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Sector</div>
              <Badge variant="outline" className="mt-1">{profile.sector}</Badge>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Team Size</div>
              <Badge variant="outline" className="mt-1">{profile.teamSize}</Badge>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground">Funding Stage</div>
              <Badge variant="outline" className="mt-1">
                {profile.fundingStage.charAt(0).toUpperCase() + profile.fundingStage.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="percentiles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="percentiles">Percentile Ranking</TabsTrigger>
          <TabsTrigger value="comparison">Category Comparison</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="percentiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Industry Percentile Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comparisonData.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getPercentileColor(item.percentile)}`}>
                          {item.percentile}th percentile
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getPercentileMessage(item.percentile)}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.percentile} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Your Score: {item.yourScore}</span>
                      <span>Industry Avg: {item.industryAvg}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Overall Performance</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      You're performing at the <strong>{percentiles.overall}th percentile</strong> compared to similar startups.
                      {percentiles.overall >= 75 && " This puts you in the top quartile - excellent work!"}
                      {percentiles.overall >= 50 && percentiles.overall < 75 && " You're above average with room for strategic improvements."}
                      {percentiles.overall < 50 && " Focus on the improvement areas to move up in rankings."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score vs Industry Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="yourScore" fill="hsl(var(--primary))" name="Your Score" />
                    <Bar dataKey="industryAvg" fill="hsl(var(--muted-foreground))" name="Industry Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Market Intelligence & Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Competitive Position */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Competitive Position
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Based on {benchmarkData?.length || 0} similar startups in your category, you rank in the{' '}
                    <strong className={getPercentileColor(percentiles.overall)}>
                      {percentiles.overall}th percentile
                    </strong>
                    . {percentiles.overall >= 75 ? 
                      "You're well-positioned for funding discussions with VCs." :
                      percentiles.overall >= 50 ?
                      "You have a solid foundation but should focus on key improvement areas." :
                      "Focus on fundamental improvements before approaching investors."
                    }
                  </p>
                </div>

                {/* Funding Readiness */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Funding Readiness Indicators
                  </h4>
                  <div className="space-y-2 text-sm">
                    {percentiles.traction >= 70 && (
                      <div className="text-green-700 dark:text-green-300">
                        ✓ Strong traction metrics suggest investor appeal
                      </div>
                    )}
                    {percentiles.team >= 70 && (
                      <div className="text-green-700 dark:text-green-300">
                        ✓ Team strength aligns with investor expectations
                      </div>
                    )}
                    {percentiles.financials >= 70 && (
                      <div className="text-green-700 dark:text-green-300">
                        ✓ Financial position supports funding case
                      </div>
                    )}
                    {percentiles.businessIdea >= 70 && (
                      <div className="text-green-700 dark:text-green-300">
                        ✓ Business concept shows strong market potential
                      </div>
                    )}
                    {Object.values(percentiles).some(p => p < 50) && (
                      <div className="text-amber-700 dark:text-amber-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        Consider addressing areas below 50th percentile before fundraising
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Strategic Recommendations</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {percentiles.overall >= 75 && (
                      <div>• Consider approaching Series A investors</div>
                    )}
                    {percentiles.overall >= 50 && percentiles.overall < 75 && (
                      <div>• Focus on angel investors and seed funding</div>
                    )}
                    {percentiles.traction < 50 && (
                      <div>• Prioritize customer acquisition and retention metrics</div>
                    )}
                    {percentiles.financials < 50 && (
                      <div>• Strengthen financial projections and unit economics</div>
                    )}
                    {percentiles.team < 50 && (
                      <div>• Consider key hires or advisory board additions</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};