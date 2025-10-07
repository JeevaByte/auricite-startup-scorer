import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Eye, 
  PieChart,
  BarChart3,
  Users,
  Building2
} from 'lucide-react';
import { mockPortfolio } from '@/utils/mockInvestorData';
import { useToast } from '@/hooks/use-toast';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalInvested = mockPortfolio.reduce((sum, item) => sum + item.investment_amount, 0);
  const avgEquity = mockPortfolio.reduce((sum, item) => sum + item.equity_percentage, 0) / mockPortfolio.length;
  const activeInvestments = mockPortfolio.filter(item => item.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Investment Portfolio</h1>
        <p className="text-muted-foreground">
          Track and manage your active investments
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalInvested / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Across {mockPortfolio.length} companies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Equity</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEquity.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average ownership
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All companies performing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Companies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Portfolio Companies</h3>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>

        {mockPortfolio.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Portfolio Companies</h3>
              <p className="text-muted-foreground mb-4">
                Start building your portfolio by investing in startups from your matches or saved list.
              </p>
              <Button onClick={() => navigate('/investor/matches')}>
                View Matches
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockPortfolio.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{company.company_name}</CardTitle>
                        <Badge 
                          variant={company.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {company.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {company.description}
                      </p>
                    </div>
                    <div className="text-center ml-4">
                      <div className="text-3xl font-bold text-primary">{company.total_score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Investment Details */}
                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Investment</span>
                      </div>
                      <div className="text-lg font-bold">
                        ${(company.investment_amount / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Equity</span>
                      </div>
                      <div className="text-lg font-bold">
                        {company.equity_percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Invested</span>
                      </div>
                      <div className="text-lg font-bold">
                        {new Date(company.investment_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">MRR</span>
                      </div>
                      <div className="text-lg font-bold">
                        {company.mrr}
                      </div>
                    </div>
                  </div>

                  {/* Sectors & Stage */}
                  <div className="flex flex-wrap gap-2">
                    {company.sector.slice(0, 3).map((sector) => (
                      <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                    <Badge variant="outline">{company.stage}</Badge>
                    <Badge variant="outline">{company.region}</Badge>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{company.business_idea}</div>
                      <div className="text-xs text-muted-foreground">Idea</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{company.team}</div>
                      <div className="text-xs text-muted-foreground">Team</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{company.traction}</div>
                      <div className="text-xs text-muted-foreground">Traction</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">{company.financials}</div>
                      <div className="text-xs text-muted-foreground">Finance</div>
                    </div>
                  </div>

                  {/* Last Interaction */}
                  <div className="pt-2 border-t text-sm text-muted-foreground">
                    Last interaction: {new Date(company.last_interaction).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: 'Opening Details',
                          description: `Viewing ${company.company_name} details`,
                        });
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: 'Add Note',
                          description: 'Note feature coming soon',
                        });
                      }}
                    >
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
