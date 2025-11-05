import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Building2, MapPin, DollarSign, TrendingUp, Star, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FundraiserDashboard() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investorSearch, setInvestorSearch] = useState('');
  const [startupSearch, setStartupSearch] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch investors
        const { data: investorData, error: investorError } = await supabase
          .from('investor_directory')
          .select('*')
          .eq('visibility', 'public')
          .eq('is_active', true);

        if (!investorError && investorData) {
          setInvestors(investorData);
        }

        // Fetch startups
        const { data: startupData, error: startupError } = await supabase
          .from('startup_directory')
          .select('*')
          .eq('visibility', 'public')
          .eq('is_active', true);

        if (!startupError && startupData) {
          setStartups(startupData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({ 
          title: 'Error', 
          description: 'Failed to load directory data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInvestors = investors.filter(investor =>
    investor.name?.toLowerCase().includes(investorSearch.toLowerCase()) ||
    investor.organization?.toLowerCase().includes(investorSearch.toLowerCase()) ||
    investor.sectors?.some((s: string) => s.toLowerCase().includes(investorSearch.toLowerCase()))
  );

  const filteredStartups = startups.filter(startup =>
    startup.company_name?.toLowerCase().includes(startupSearch.toLowerCase()) ||
    startup.sector?.toLowerCase().includes(startupSearch.toLowerCase()) ||
    startup.description?.toLowerCase().includes(startupSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fundraiser Dashboard</h1>
        <p className="text-muted-foreground">Explore investors and discover other startups</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{investors.length}</p>
            <p className="text-xs text-muted-foreground">Active investor profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{startups.length}</p>
            <p className="text-xs text-muted-foreground">Investment-ready companies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {startups.length > 0
                ? Math.round(startups.reduce((sum, s) => sum + (s.readiness_score || 0), 0) / startups.length)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground">Average readiness score</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="investors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="investors">
            <Users className="h-4 w-4 mr-2" />
            Investor Directory
          </TabsTrigger>
          <TabsTrigger value="startups">
            <Building2 className="h-4 w-4 mr-2" />
            Startup Directory
          </TabsTrigger>
        </TabsList>

        {/* Investor Directory Tab */}
        <TabsContent value="investors" className="space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors by name, organization, or sector..."
                value={investorSearch}
                onChange={(e) => setInvestorSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">
            {filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''} found
          </p>

          <div className="grid gap-4">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{investor.name}</h3>
                    {investor.organization && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {investor.organization} {investor.title && `• ${investor.title}`}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${investor.ticket_min?.toLocaleString()} - ${investor.ticket_max?.toLocaleString()}
                      </div>
                      {investor.is_verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>

                {investor.bio && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">{investor.bio}</p>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Stages</h4>
                    <div className="flex flex-wrap gap-1">
                      {investor.stages?.slice(0, 2).map((stage: string) => (
                        <Badge key={stage} variant="outline" className="text-xs">{stage}</Badge>
                      ))}
                      {investor.stages?.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{investor.stages.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Sectors</h4>
                    <div className="flex flex-wrap gap-1">
                      {investor.sectors?.slice(0, 2).map((sector: string) => (
                        <Badge key={sector} variant="secondary" className="text-xs">{sector}</Badge>
                      ))}
                      {investor.sectors?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{investor.sectors.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Regions</h4>
                    <div className="flex flex-wrap gap-1">
                      {investor.regions?.slice(0, 2).map((region: string) => (
                        <Badge key={region} variant="outline" className="text-xs">{region}</Badge>
                      ))}
                      {investor.regions?.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{investor.regions.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredInvestors.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No investors found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </Card>
          )}
        </TabsContent>

        {/* Startup Directory Tab */}
        <TabsContent value="startups" className="space-y-4">
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search startups by name, sector, or description..."
                value={startupSearch}
                onChange={(e) => setStartupSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          <p className="text-sm text-muted-foreground">
            {filteredStartups.length} startup{filteredStartups.length !== 1 ? 's' : ''} found
          </p>

          <div className="grid gap-4">
            {filteredStartups.map((startup) => (
              <Card key={startup.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary/40">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{startup.company_name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm font-semibold text-primary">{startup.readiness_score}/100</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {startup.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {startup.team_size} employees
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Seeking: ${startup.funding_goal?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">{startup.stage}</Badge>
                </div>

                {startup.description && (
                  <p className="text-muted-foreground mb-4 line-clamp-2">{startup.description}</p>
                )}

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Sector</h4>
                    <Badge variant="outline" className="text-xs">{startup.sector}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Key Metrics</h4>
                    <ul className="space-y-1">
                      {startup.current_mrr && (
                        <li className="text-xs text-muted-foreground">
                          <span className="text-primary mr-1">•</span>
                          MRR: ${startup.current_mrr.toLocaleString()}
                        </li>
                      )}
                      {startup.has_revenue && (
                        <li className="text-xs text-muted-foreground">
                          <span className="text-primary mr-1">•</span>
                          Revenue positive
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Funding Status</h4>
                    <p className="text-xs text-muted-foreground">
                      {startup.seeking_funding ? '🟢 Actively fundraising' : '⚪ Not fundraising'}
                    </p>
                    {startup.funding_raised && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Raised: ${startup.funding_raised.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/fundraiser/${startup.id}`)}
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  <Button size="sm" className="flex-1">Express Interest</Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredStartups.length === 0 && (
            <Card className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No startups found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
