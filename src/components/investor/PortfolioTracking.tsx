import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus } from 'lucide-react';
import { PortfolioStartup, StartupData } from '@/hooks/useInvestorData';
import { ScorecardInsights } from './ScorecardInsights';

interface PortfolioTrackingProps {
  portfolioStartups: PortfolioStartup[];
  onAddToPortfolio: (startupUserId: string, assessmentId?: string, data?: any) => Promise<void>;
  availableStartups?: StartupData[];
}

export const PortfolioTracking: React.FC<PortfolioTrackingProps> = ({
  portfolioStartups,
  onAddToPortfolio,
  availableStartups = [],
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investmentDate, setInvestmentDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = async () => {
    if (!selectedStartup) return;

    const startup = availableStartups.find(s => s.id === selectedStartup);
    if (!startup) return;

    await onAddToPortfolio(startup.user_id, startup.assessment_id, {
      investment_amount: investmentAmount ? parseFloat(investmentAmount) : undefined,
      investment_date: investmentDate || undefined,
      notes: notes || undefined,
    });

    setShowAddDialog(false);
    setSelectedStartup('');
    setInvestmentAmount('');
    setInvestmentDate('');
    setNotes('');
  };

  const calculatePortfolioStats = () => {
    const totalInvested = portfolioStartups.reduce(
      (sum, s) => sum + (s.investment_amount || 0),
      0
    );
    const averageScore = portfolioStartups.length > 0
      ? portfolioStartups.reduce((sum, s) => sum + s.score, 0) / portfolioStartups.length
      : 0;
    const activeInvestments = portfolioStartups.filter(s => s.status === 'active').length;

    return { totalInvested, averageScore, activeInvestments };
  };

  const stats = calculatePortfolioStats();

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {stats.totalInvested.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Investments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Portfolio Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(0)}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Add to Portfolio Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Startup to Portfolio
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Startup</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={selectedStartup}
                onChange={(e) => setSelectedStartup(e.target.value)}
              >
                <option value="">Choose a startup...</option>
                {availableStartups.map((startup) => (
                  <option key={startup.id} value={startup.id}>
                    {startup.company_name} (Score: {startup.score})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Investment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="50000"
              />
            </div>

            <div>
              <Label htmlFor="date">Investment Date</Label>
              <Input
                id="date"
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes..."
                rows={3}
              />
            </div>

            <Button onClick={handleAdd} className="w-full" disabled={!selectedStartup}>
              Add to Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portfolio Startups */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Investments</h3>
        {portfolioStartups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <p>No investments in your portfolio yet.</p>
              <p className="text-sm mt-2">Start tracking your investments by adding startups above.</p>
            </CardContent>
          </Card>
        ) : (
          portfolioStartups.map((startup) => (
            <Card key={startup.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{startup.company_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Added: {new Date(startup.added_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="text-xl" variant={startup.status === 'active' ? 'default' : 'secondary'}>
                    {startup.score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  {startup.investment_amount && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        ${startup.investment_amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {startup.investment_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(startup.investment_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <Badge variant={startup.status === 'active' ? 'default' : 'secondary'}>
                    {startup.status}
                  </Badge>
                </div>

                {startup.notes && (
                  <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-md">
                    {startup.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <ScorecardInsights startup={startup} />
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Track Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
