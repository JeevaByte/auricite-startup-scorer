import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, Star } from 'lucide-react';
import { useInvestorData } from '@/hooks/useInvestorData';
import { ScorecardInsights } from '@/components/investor/ScorecardInsights';

export default function DealFlow() {
  const { feedStartups, loading, saveStartup, unsaveStartup } = useInvestorData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filteredFeed = feedStartups.filter(startup => {
    const matchesSearch = startup.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || startup.sector === sectorFilter;
    const matchesStage = stageFilter === 'all' || startup.stage === stageFilter;
    const matchesRegion = regionFilter === 'all' || startup.region === regionFilter;
    
    return matchesSearch && matchesSector && matchesStage && matchesRegion;
  });

  const handleSave = async (startupUserId: string, assessmentId: string | undefined) => {
    await saveStartup(startupUserId, assessmentId);
    setSavedIds([...savedIds, startupUserId]);
  };

  const handleUnsave = async (startupUserId: string) => {
    await unsaveStartup(startupUserId);
    setSavedIds(savedIds.filter(id => id !== startupUserId));
  };

  const isSaved = (startupUserId: string) => savedIds.includes(startupUserId);

  if (loading) {
    return <div className="text-center py-12">Loading deal flow...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Deal Flow</h2>
        <p className="text-muted-foreground">
          Discover and evaluate investment opportunities
        </p>
      </div>

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

      {/* Startups Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Investment Opportunities ({filteredFeed.length})
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      onClick={() => isSaved(startup.user_id) 
                        ? handleUnsave(startup.user_id) 
                        : handleSave(startup.user_id, startup.assessment_id)
                      }
                    >
                      <Heart className={`h-4 w-4 ${isSaved(startup.user_id) ? 'fill-red-500 text-red-500' : ''}`} />
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
    </div>
  );
}
