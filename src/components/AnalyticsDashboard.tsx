import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Users, Zap, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalyticsDashboardProps {
  analysis: {
    clarity: number;
    engagement: number;
    readability: number;
    persuasiveness: number;
    overallScore: number;
    industryBenchmarks?: {
      clarityIndustryAvg: number;
      engagementIndustryAvg: number;
      readabilityIndustryAvg: number;
      persuasivenessIndustryAvg: number;
      percentileRanking: number;
      competitiveAdvantage: string;
    };
    personaAnalysis?: {
      investorAppeal: { score: number; feedback: string };
      customerAppeal: { score: number; feedback: string };
      partnerAppeal: { score: number; feedback: string };
      mediaAppeal: { score: number; feedback: string };
    };
    contentHeatmap?: {
      highImpactSections: string[];
      mediumImpactSections: string[];
      lowImpactSections: string[];
      improvementZones: string[];
    };
    predictiveInsights?: {
      successProbability: number;
      conversionLikelihood: number;
      investorInterestScore: number;
      viralPotential: number;
    };
    strengths: Array<{
      area: string;
      description: string;
      score: number;
    }>;
    suggestions: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      suggestion: string;
      impact: string;
      implementation: string;
      timeline?: string;
      effortLevel?: string;
    }>;
  };
  contentType: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analysis, contentType }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clarity</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.clarity)}`}>
                  {analysis.clarity}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={analysis.clarity} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.engagement)}`}>
                  {analysis.engagement}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={analysis.engagement} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Readability</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.readability)}`}>
                  {analysis.readability}%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <Progress value={analysis.readability} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Persuasiveness</p>
                <p className={`text-2xl font-bold ${getScoreColor(analysis.persuasiveness)}`}>
                  {analysis.persuasiveness}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={analysis.persuasiveness} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Industry Benchmarking */}
      {analysis.industryBenchmarks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <span>Industry Benchmarking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analysis.industryBenchmarks.percentileRanking}th
                  </div>
                  <p className="text-sm text-gray-600">Percentile Ranking</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">vs Industry Average</h4>
                {[
                  { name: 'Clarity', your: analysis.clarity, industry: analysis.industryBenchmarks.clarityIndustryAvg },
                  { name: 'Engagement', your: analysis.engagement, industry: analysis.industryBenchmarks.engagementIndustryAvg },
                  { name: 'Readability', your: analysis.readability, industry: analysis.industryBenchmarks.readabilityIndustryAvg },
                  { name: 'Persuasiveness', your: analysis.persuasiveness, industry: analysis.industryBenchmarks.persuasivenessIndustryAvg }
                ].map((metric) => {
                  const difference = metric.your - metric.industry;
                  const isAbove = difference > 0;
                  return (
                    <div key={metric.name} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{metric.your}%</span>
                        <div className={`flex items-center space-x-1 ${isAbove ? 'text-green-600' : 'text-red-600'}`}>
                          {isAbove ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span className="text-xs">{Math.abs(difference)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">{analysis.industryBenchmarks.competitiveAdvantage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persona Analysis */}
      {analysis.personaAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Audience Appeal Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.personaAnalysis).map(([persona, data]) => (
                <div key={persona} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {persona.replace('Appeal', ' Appeal')}
                    </h4>
                    <Badge className={getScoreBadgeColor(data.score)}>
                      {data.score}%
                    </Badge>
                  </div>
                  <Progress value={data.score} className="mb-2" />
                  <p className="text-sm text-gray-600">{data.feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Heatmap */}
      {analysis.contentHeatmap && (
        <Card>
          <CardHeader>
            <CardTitle>Content Impact Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.contentHeatmap.highImpactSections.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">🔥 High Impact Sections</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.contentHeatmap.highImpactSections.map((section, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.contentHeatmap.improvementZones.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Improvement Zones</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.contentHeatmap.improvementZones.map((zone, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800">
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictive Insights */}
      {analysis.predictiveInsights && (
        <Card>
          <CardHeader>
            <CardTitle>Predictive Success Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analysis.predictiveInsights.successProbability}%
                </div>
                <p className="text-xs text-blue-700">Success Probability</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysis.predictiveInsights.conversionLikelihood}%
                </div>
                <p className="text-xs text-green-700">Conversion Likelihood</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analysis.predictiveInsights.investorInterestScore}%
                </div>
                <p className="text-xs text-purple-700">Investor Interest</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-b from-orange-50 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {analysis.predictiveInsights.viralPotential}%
                </div>
                <p className="text-xs text-orange-700">Viral Potential</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.suggestions
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              })
              .map((suggestion, index) => (
                <div 
                  key={index} 
                  className={`p-4 border-l-4 rounded-lg ${getPriorityColor(suggestion.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(suggestion.priority)}
                      <h4 className="font-semibold text-gray-800">{suggestion.category}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.priority.toUpperCase()}
                      </Badge>
                      {suggestion.timeline && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.timeline}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{suggestion.suggestion}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">Impact:</span>
                      <span className="text-gray-700">{suggestion.impact}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">Implementation:</span>
                      <span className="text-gray-700">{suggestion.implementation}</span>
                    </div>
                    {suggestion.effortLevel && (
                      <div className="flex items-start space-x-2">
                        <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">Effort:</span>
                        <span className="text-gray-700">{suggestion.effortLevel}</span>
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