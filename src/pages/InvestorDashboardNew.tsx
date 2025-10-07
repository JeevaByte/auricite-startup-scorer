import React, { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, TrendingUp, Star, MapPin, Briefcase, Bell } from 'lucide-react';

const InvestorDashboardNew: React.FC = () => {
  const [savedStartups] = useState([
    { id: '1', name: 'TechCo AI', score: 78, sector: 'AI/ML', stage: 'Seed', region: 'US', saved: true },
    { id: '2', name: 'FinTech Solutions', score: 72, sector: 'FinTech', stage: 'Pre-Seed', region: 'UK', saved: true },
    { id: '3', name: 'HealthTech Inc', score: 85, sector: 'HealthTech', stage: 'Series A', region: 'US', saved: true },
  ]);

  const [feedStartups] = useState([
    { id: '4', name: 'CleanTech Innovations', score: 82, sector: 'CleanTech', stage: 'Seed', region: 'EU', traction: 'High', revenue: '$50K MRR', verified: true },
    { id: '5', name: 'EdTech Platform', score: 75, sector: 'EdTech', stage: 'Pre-Seed', region: 'US', traction: 'Medium', revenue: 'Pre-revenue', verified: false },
    { id: '6', name: 'Logistics AI', score: 88, sector: 'Logistics', stage: 'Series A', region: 'Asia', traction: 'High', revenue: '$200K MRR', verified: true },
    { id: '7', name: 'AgriTech Solutions', score: 79, sector: 'AgriTech', stage: 'Seed', region: 'Africa', traction: 'Medium', revenue: '$30K MRR', verified: true },
  ]);

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
            <TabsTrigger value="saved">Saved Startups</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
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
                    <Input placeholder="Search startups..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="ai">AI/ML</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="healthtech">HealthTech</SelectItem>
                      <SelectItem value="cleantech">CleanTech</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                      <SelectItem value="seed">Seed</SelectItem>
                      <SelectItem value="series-a">Series A</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="us">North America</SelectItem>
                      <SelectItem value="eu">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Startups */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recommended for You
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {feedStartups.map((startup) => (
                  <Card key={startup.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{startup.name}</CardTitle>
                            {startup.verified && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline">{startup.sector}</Badge>
                            <Badge variant="outline">{startup.stage}</Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{startup.score}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{startup.region}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>{startup.traction} Traction</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{startup.revenue}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">View Details</Button>
                          <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Saved Startups */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Your Saved Startups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {savedStartups.map((startup) => (
                    <Card key={startup.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{startup.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{startup.stage}</Badge>
                          <Badge variant="outline">{startup.sector}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-primary">{startup.score}</div>
                          <div className="text-sm text-muted-foreground">Readiness Score</div>
                        </div>
                        <Button className="w-full" variant="outline">
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab - Placeholder */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Score Insights & Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed scorecard insights and AI-powered analysis coming soon. 
                  Compare startups, view detailed breakdowns, and get investment recommendations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab - Placeholder */}
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Track your investments and monitor startup progress over time.
                  Get alerts when readiness scores improve and receive quarterly updates.
                </p>
                <Button>Add Startup to Portfolio</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
};

export default InvestorDashboardNew;
