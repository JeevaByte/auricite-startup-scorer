import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface VersionData {
  id: string;
  created_at: string;
  businessIdea: number;
  financials: number;
  team: number;
  traction: number;
  totalScore: number;
  version: number;
}

export const VersionComparison: React.FC = () => {
  const { user } = useAuth();
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVersionHistory();
    }
  }, [user]);

  const loadVersionHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scores')
        .select(`
          id,
          created_at,
          business_idea,
          financials,
          team,
          traction,
          total_score,
          assessments!inner(created_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedVersions: VersionData[] = data.map((item, index) => ({
        id: item.id,
        created_at: item.created_at,
        businessIdea: item.business_idea,
        financials: item.financials,
        team: item.team,
        traction: item.traction,
        totalScore: item.total_score,
        version: data.length - index
      }));

      setVersions(formattedVersions);
      
      // Auto-select last 2 versions for comparison
      if (formattedVersions.length >= 2) {
        setSelectedVersions([formattedVersions[0].id, formattedVersions[1].id]);
      }
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = versions
    .filter(v => selectedVersions.length === 0 || selectedVersions.includes(v.id))
    .reverse()
    .map((version, index) => ({
      version: `V${version.version}`,
      businessIdea: version.businessIdea,
      financials: version.financials,
      team: version.team,
      traction: version.traction,
      totalScore: version.totalScore,
      date: version.created_at
    }));

  const getImprovement = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: 0 };
    const diff = current - previous;
    const percentage = ((diff / previous) * 100);
    return { value: diff, percentage };
  };

  const getLatestComparison = () => {
    if (versions.length < 2) return null;
    
    const latest = versions[0];
    const previous = versions[1];
    
    return {
      businessIdea: getImprovement(latest.businessIdea, previous.businessIdea),
      financials: getImprovement(latest.financials, previous.financials),
      team: getImprovement(latest.team, previous.team),
      traction: getImprovement(latest.traction, previous.traction),
      totalScore: getImprovement(latest.totalScore, previous.totalScore)
    };
  };

  const comparison = getLatestComparison();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Iterative Improvement Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start Your Improvement Journey</h3>
            <p className="text-muted-foreground">
              Complete multiple assessments to track your investment readiness progress over time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Latest Improvement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {comparison && Object.entries(comparison).map(([key, improvement]) => {
              const isPositive = improvement.value > 0;
              const categoryName = key === 'businessIdea' ? 'Business Idea' 
                                 : key === 'totalScore' ? 'Total Score' 
                                 : key.charAt(0).toUpperCase() + key.slice(1);
              
              return (
                <div key={key} className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">{categoryName}</div>
                  <div className={`flex items-center justify-center gap-1 ${isPositive ? 'text-green-600' : improvement.value < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : improvement.value < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                    <span className="font-medium">
                      {improvement.value > 0 ? '+' : ''}{improvement.value.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {improvement.percentage > 0 ? '+' : ''}{improvement.percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Version Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trend Analysis
          </CardTitle>
          {versions.length > 2 && (
            <div className="flex gap-2">
              <Select onValueChange={(value) => setSelectedVersions(value ? [value] : [])}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Compare specific versions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All versions</SelectItem>
                  {versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      V{version.version} - {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedVersions([])}
              >
                Show All
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="version" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? `${label} - ${formatDistanceToNow(new Date(data.date), { addSuffix: true })}` : label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="businessIdea" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Business Idea"
                />
                <Line 
                  type="monotone" 
                  dataKey="financials" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Financials"
                />
                <Line 
                  type="monotone" 
                  dataKey="team" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="Team"
                />
                <Line 
                  type="monotone" 
                  dataKey="traction" 
                  stroke="hsl(var(--chart-4))" 
                  strokeWidth={2}
                  name="Traction"
                />
                <Line 
                  type="monotone" 
                  dataKey="totalScore" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Total Score"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Version History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assessment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div key={version.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">V{version.version}</Badge>
                  <div>
                    <div className="font-medium">Assessment {version.version}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{version.totalScore}/999</div>
                    <div className="text-sm text-muted-foreground">Total Score</div>
                  </div>
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      {version.totalScore > versions[index - 1].totalScore ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : version.totalScore < versions[index - 1].totalScore ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : null}
                      <span className={`text-sm ${
                        version.totalScore > versions[index - 1].totalScore ? 'text-green-600' :
                        version.totalScore < versions[index - 1].totalScore ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {version.totalScore > versions[index - 1].totalScore ? '+' : ''}
                        {(version.totalScore - versions[index - 1].totalScore).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};