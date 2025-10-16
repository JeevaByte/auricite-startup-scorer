import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Bookmark, TrendingUp, Building2, MapPin, DollarSign, Users, Eye } from 'lucide-react';
import { mockStartups } from '@/utils/mockInvestorData';
import { useToast } from '@/hooks/use-toast';
import { InvestorPreferencesFilter, PreferenceFilters } from '@/components/investor/InvestorPreferencesFilter';

export default function DealFlow() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [preferenceFilters, setPreferenceFilters] = useState<PreferenceFilters>({
    industries: [],
    stages: [],
    geographies: [],
  });

  const handlePreferenceFilterChange = (filters: PreferenceFilters) => {
    setPreferenceFilters(filters);
    // You can also sync these with the basic filters if needed
  };

  const filteredStartups = mockStartups.filter(startup => {
    const matchesSearch = startup.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || startup.sector.some(s => s.includes(sectorFilter));
    const matchesStage = stageFilter === 'all' || startup.stage === stageFilter;
    const matchesScore = scoreFilter === 'all' || 
                        (scoreFilter === 'high' && startup.total_score >= 80) ||
                        (scoreFilter === 'medium' && startup.total_score >= 60 && startup.total_score < 80) ||
                        (scoreFilter === 'low' && startup.total_score < 60);
    
    return matchesSearch && matchesSector && matchesStage && matchesScore;
  });

  const handleSave = (startupId: string, companyName: string) => {
    toast({
      title: 'Saved',
      description: `${companyName} added to your saved list`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Deal Flow</h1>
        <p className="text-muted-foreground">
          Browse and filter investment opportunities - {filteredStartups.length} startups available
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="SaaS">SaaS</SelectItem>
                <SelectItem value="FinTech">FinTech</SelectItem>
                <SelectItem value="HealthTech">HealthTech</SelectItem>
                <SelectItem value="CleanTech">CleanTech</SelectItem>
                <SelectItem value="EdTech">EdTech</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                <SelectItem value="Seed">Seed</SelectItem>
                <SelectItem value="Series A">Series A</SelectItem>
                <SelectItem value="Series B">Series B</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (80+)</SelectItem>
                <SelectItem value="medium">Medium (60-79)</SelectItem>
                <SelectItem value="low">Below 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <InvestorPreferencesFilter 
          onFilterChange={handlePreferenceFilterChange}
          initialFilters={preferenceFilters}
        />
      )}

      {/* Startup Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStartups.length > 0 ? (
          filteredStartups.map((startup) => (
            <Card key={startup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{startup.company_name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {startup.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleSave(startup.id, startup.company_name)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sectors & Stage */}
                <div className="flex flex-wrap gap-2">
                  {startup.sector.slice(0, 3).map((sector) => (
                    <Badge key={sector} variant="secondary">{sector}</Badge>
                  ))}
                  <Badge variant="outline">{startup.stage}</Badge>
                </div>

                {/* Score Display */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Investment Readiness</span>
                  <Badge className={`text-lg font-bold ${getScoreColor(startup.total_score)}`}>
                    {startup.total_score}
                  </Badge>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{startup.business_idea}</div>
                    <div className="text-xs text-muted-foreground">Idea</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{startup.team}</div>
                    <div className="text-xs text-muted-foreground">Team</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{startup.traction}</div>
                    <div className="text-xs text-muted-foreground">Traction</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{startup.financials}</div>
                    <div className="text-xs text-muted-foreground">Finance</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Seeking:</span>
                    <span className="font-medium">{startup.funding_goal}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">MRR:</span>
                    <span className="font-medium">{startup.mrr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Team:</span>
                    <span className="font-medium">{startup.employees}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Region:</span>
                    <span className="font-medium">{startup.region}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1"
                    onClick={() => navigate(`/investor/startup-details?id=${startup.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/investor/compare?startup=${startup.id}`)}
                  >
                    Compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Startups Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
