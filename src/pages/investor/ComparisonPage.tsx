import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, DollarSign, X } from 'lucide-react';
import { mockStartups } from '@/utils/mockInvestorData';

export default function ComparisonPage() {
  const [selectedStartups, setSelectedStartups] = useState<string[]>([
    mockStartups[0].id,
    mockStartups[1].id
  ]);

  const compareData = selectedStartups.map(id => mockStartups.find(s => s.id === id)).filter(Boolean);

  const handleAddStartup = (startupId: string) => {
    if (selectedStartups.length < 4 && !selectedStartups.includes(startupId)) {
      setSelectedStartups([...selectedStartups, startupId]);
    }
  };

  const handleRemoveStartup = (startupId: string) => {
    setSelectedStartups(selectedStartups.filter(id => id !== startupId));
  };

  const availableStartups = mockStartups.filter(s => !selectedStartups.includes(s.id));

  const getHighestInCategory = (category: 'business_idea' | 'team' | 'traction' | 'financials') => {
    const scores = compareData.map(s => s?.[category] || 0);
    return Math.max(...scores);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Startup Comparison</h1>
        <p className="text-muted-foreground">
          Compare up to 4 startups side-by-side to make informed investment decisions
        </p>
      </div>

      {/* Add Startup Selector */}
      {selectedStartups.length < 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Startup to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleAddStartup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a startup..." />
              </SelectTrigger>
              <SelectContent>
                {availableStartups.map((startup) => (
                  <SelectItem key={startup.id} value={startup.id}>
                    {startup.company_name} - Score: {startup.total_score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {compareData.length >= 2 ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {compareData.map((startup) => (
              <Card key={startup?.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveStartup(startup?.id || '')}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader>
                  <CardTitle className="text-lg pr-8">{startup?.company_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {startup?.total_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Score Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Business Idea */}
                <div>
                  <h4 className="font-semibold mb-3">Business Idea</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => {
                      const isHighest = startup?.business_idea === getHighestInCategory('business_idea');
                      return (
                        <div key={startup?.id} className="text-center">
                          <div className={`text-3xl font-bold mb-1 ${isHighest ? 'text-green-600' : 'text-primary'}`}>
                            {startup?.business_idea}
                          </div>
                          {isHighest && <Badge variant="default" className="bg-green-600">Highest</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Team</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => {
                      const isHighest = startup?.team === getHighestInCategory('team');
                      return (
                        <div key={startup?.id} className="text-center">
                          <div className={`text-3xl font-bold mb-1 ${isHighest ? 'text-green-600' : 'text-primary'}`}>
                            {startup?.team}
                          </div>
                          {isHighest && <Badge variant="default" className="bg-green-600">Highest</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Traction */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Traction</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => {
                      const isHighest = startup?.traction === getHighestInCategory('traction');
                      return (
                        <div key={startup?.id} className="text-center">
                          <div className={`text-3xl font-bold mb-1 ${isHighest ? 'text-green-600' : 'text-primary'}`}>
                            {startup?.traction}
                          </div>
                          {isHighest && <Badge variant="default" className="bg-green-600">Highest</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financials */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Financials</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => {
                      const isHighest = startup?.financials === getHighestInCategory('financials');
                      return (
                        <div key={startup?.id} className="text-center">
                          <div className={`text-3xl font-bold mb-1 ${isHighest ? 'text-green-600' : 'text-primary'}`}>
                            {startup?.financials}
                          </div>
                          {isHighest && <Badge variant="default" className="bg-green-600">Highest</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Funding Goal */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Funding Goal</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => (
                      <div key={startup?.id} className="text-sm font-medium">
                        {startup?.funding_goal}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MRR */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Monthly Recurring Revenue</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => (
                      <div key={startup?.id} className="text-sm font-medium">
                        {startup?.mrr}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Size */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-semibold">Team Size</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => (
                      <div key={startup?.id} className="text-sm font-medium">
                        {startup?.employees}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage */}
                <div className="pt-2 border-t">
                  <h4 className="font-semibold mb-2">Stage</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => (
                      <Badge key={startup?.id} variant="outline">
                        {startup?.stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sectors */}
                <div className="pt-2 border-t">
                  <h4 className="font-semibold mb-2">Sectors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {compareData.map((startup) => (
                      <div key={startup?.id} className="flex flex-wrap gap-1">
                        {startup?.sector.slice(0, 2).map((sector) => (
                          <Badge key={sector} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-6">
            {compareData.slice(0, 2).map((startup) => (
              <Card key={startup?.id}>
                <CardHeader>
                  <CardTitle>{startup?.company_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {startup?.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-600 mb-2">Weaknesses</h4>
                    <ul className="space-y-1">
                      {startup?.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">!</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select Startups to Compare</h3>
            <p className="text-muted-foreground">
              Choose at least 2 startups from the dropdown above to begin comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
