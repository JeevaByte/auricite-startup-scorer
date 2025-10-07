import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StartupData } from '@/hooks/useInvestorData';
import { RadarVisualization } from '@/components/RadarVisualization';

interface StartupComparisonProps {
  startups: StartupData[];
}

export const StartupComparison: React.FC<StartupComparisonProps> = ({ startups }) => {
  const [selectedStartups, setSelectedStartups] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleStartup = (id: string) => {
    setSelectedStartups(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  };

  const comparedStartups = startups.filter(s => selectedStartups.includes(s.id));

  const getComparisonData = (startup: StartupData) => ({
    labels: ['Business Idea', 'Team', 'Traction', 'Financials'],
    datasets: [{
      label: startup.company_name,
      data: [
        startup.business_idea || 0,
        startup.team || 0,
        startup.traction || 0,
        startup.financials || 0,
      ],
    }],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Select Startups to Compare (Max 4)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {startups.map((startup) => (
              <div key={startup.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedStartups.includes(startup.id)}
                  onCheckedChange={() => toggleStartup(startup.id)}
                  disabled={!selectedStartups.includes(startup.id) && selectedStartups.length >= 4}
                />
                <div className="flex-1">
                  <div className="font-semibold">{startup.company_name}</div>
                  <div className="text-sm text-muted-foreground">Score: {startup.score}/100</div>
                </div>
                <Badge variant="secondary">{startup.score}</Badge>
              </div>
            ))}
          </div>

          {selectedStartups.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Dialog open={showComparison} onOpenChange={setShowComparison}>
                <DialogTrigger asChild>
                  <Button className="flex-1" disabled={selectedStartups.length < 2}>
                    Compare ({selectedStartups.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Startup Comparison</DialogTitle>
                  </DialogHeader>

                  {/* Score Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Metric</th>
                          {comparedStartups.map((startup) => (
                            <th key={startup.id} className="text-center p-3">
                              {startup.company_name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 font-semibold">Total Score</td>
                          {comparedStartups.map((startup) => (
                            <td key={startup.id} className="text-center p-3">
                              <Badge className="text-lg">{startup.score}</Badge>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Business Idea</td>
                          {comparedStartups.map((startup) => (
                            <td key={startup.id} className="text-center p-3">
                              {startup.business_idea || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Team</td>
                          {comparedStartups.map((startup) => (
                            <td key={startup.id} className="text-center p-3">
                              {startup.team || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Traction</td>
                          {comparedStartups.map((startup) => (
                            <td key={startup.id} className="text-center p-3">
                              {startup.traction || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">Financials</td>
                          {comparedStartups.map((startup) => (
                            <td key={startup.id} className="text-center p-3">
                              {startup.financials || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Radar Charts */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {comparedStartups.map((startup) => (
                      <div key={startup.id}>
                        <h4 className="font-semibold mb-3 text-center">{startup.company_name}</h4>
                        <RadarVisualization
                          scoreResult={{
                            businessIdea: startup.business_idea || 0,
                            team: startup.team || 0,
                            traction: startup.traction || 0,
                            financials: startup.financials || 0,
                            totalScore: startup.score,
                            businessIdeaExplanation: '',
                            teamExplanation: '',
                            tractionExplanation: '',
                            financialsExplanation: '',
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* AI Summary Section */}
                  <Card className="mt-6 bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm">AI Comparison Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {comparedStartups.length >= 2 && (
                          <>
                            Comparing {comparedStartups[0].company_name} (Score: {comparedStartups[0].score}) 
                            with {comparedStartups[1].company_name} (Score: {comparedStartups[1].score}):
                            <br /><br />
                            • <strong>{comparedStartups[0].company_name}</strong> shows stronger{' '}
                            {(comparedStartups[0].team || 0) > (comparedStartups[1].team || 0) ? 'team metrics' : 
                             (comparedStartups[0].traction || 0) > (comparedStartups[1].traction || 0) ? 'traction' :
                             (comparedStartups[0].business_idea || 0) > (comparedStartups[1].business_idea || 0) ? 'business concept' : 'financial metrics'}
                            <br />
                            • <strong>{comparedStartups[1].company_name}</strong> demonstrates better{' '}
                            {(comparedStartups[1].team || 0) > (comparedStartups[0].team || 0) ? 'team composition' : 
                             (comparedStartups[1].traction || 0) > (comparedStartups[0].traction || 0) ? 'market traction' :
                             (comparedStartups[1].business_idea || 0) > (comparedStartups[0].business_idea || 0) ? 'business viability' : 'financial planning'}
                          </>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => setSelectedStartups([])}>
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
