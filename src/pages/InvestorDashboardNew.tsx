import React, { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, TrendingUp, Star, MapPin, Briefcase } from 'lucide-react';
import { useInvestorData } from '@/hooks/useInvestorData';
import { StartupComparison } from '@/components/investor/StartupComparison';
import { ScorecardInsights } from '@/components/investor/ScorecardInsights';
import { PortfolioTracking } from '@/components/investor/PortfolioTracking';

const InvestorDashboardNew: React.FC = () => {
  const { 
    savedStartups, 
    portfolioStartups, 
    feedStartups, 
    loading,
    saveStartup,
    unsaveStartup,
    addToPortfolio
  } = useInvestorData();

  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  const filteredFeed = feedStartups.filter(startup => {
    const matchesSearch = startup.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || startup.sector === sectorFilter;
    const matchesStage = stageFilter === 'all' || startup.stage === stageFilter;
    const matchesRegion = regionFilter === 'all' || startup.region === regionFilter;
    
    return matchesSearch && matchesSector && matchesStage && matchesRegion;
  });

  const isSaved = (startupId: string) => savedStartups.some(s => s.id === startupId);

  if (loading) {
    return (
      <AuthGuard requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading investor dashboard...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            Discover, analyze, and track investment opportunities
          </p>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Deal Flow</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedStartups.length})</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio ({portfolioStartups.length})</TabsTrigger>
          </TabsList>

          {/* Deal Flow Feed */}
          <TabsContent value="feed" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search startups..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="FinTech">FinTech</SelectItem>
                      <SelectItem value="HealthTech">HealthTech</SelectItem>
                      <SelectItem value="CleanTech">CleanTech</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={stageFilter} onValueChange={setStageFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="US">North America</SelectItem>
                      <SelectItem value="EU">Europe</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Startups */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Investment Opportunities ({filteredFeed.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredFeed.map((startup) => (
                  <Card key={startup.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{startup.company_name}</CardTitle>
                            {startup.verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">{startup.name}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{startup.score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          {startup.sector && <Badge variant="outline">{startup.sector}</Badge>}
                          {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <ScorecardInsights 
                            startup={startup}
                            trigger={<Button className="flex-1">View Scorecard</Button>}
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => isSaved(startup.id) ? unsaveStartup(startup.user_id) : saveStartup(startup.user_id, startup.assessment_id)}
                          >
                            <Heart className={`h-4 w-4 ${isSaved(startup.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {filteredFeed.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No startups match your current filters.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Saved Startups */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Your Saved Startups</CardTitle>
              </CardHeader>
              <CardContent>
                {savedStartups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No saved startups yet.</p>
                    <p className="text-sm mt-2">Save startups from the Deal Flow tab to track them here.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {savedStartups.map((startup) => (
                      <Card key={startup.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{startup.company_name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{startup.name}</div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-primary">{startup.score}</div>
                            <div className="text-sm text-muted-foreground">Readiness Score</div>
                          </div>
                          {startup.notes && (
                            <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded-md">
                              {startup.notes}
                            </p>
                          )}
                          <div className="space-y-2">
                            <ScorecardInsights 
                              startup={startup}
                              trigger={<Button variant="outline" className="w-full">View Profile</Button>}
                            />
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => unsaveStartup(startup.user_id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare">
            <StartupComparison startups={[...savedStartups, ...feedStartups.slice(0, 10)]} />
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <PortfolioTracking 
              portfolioStartups={portfolioStartups}
              onAddToPortfolio={addToPortfolio}
              availableStartups={[...savedStartups, ...feedStartups]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
};

export default InvestorDashboardNew;
