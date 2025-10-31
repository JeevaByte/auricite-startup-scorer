import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, TrendingUp, Building2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StartupDirectoryItem } from '@/utils/directoryMockData';

// Using comprehensive mock data directly
const mockStartupDirectory: StartupDirectoryItem[] = [
  {
    id: 'startup-001',
    company_name: 'VisionAI',
    tagline: 'AI-powered computer vision for manufacturing quality control',
    description: 'We reduce defect rates by 95% using real-time AI visual inspection on production lines.',
    founder_name: 'Marcus Johnson',
    team_size: '28',
    sector: 'AI/ML',
    stage: 'Series A',
    location: 'San Francisco, CA',
    region: 'North America',
    funding_raised: 5000000,
    funding_goal: 3000000,
    current_mrr: 85000,
    has_revenue: true,
    readiness_score: 85,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
  {
    id: 'startup-002',
    company_name: 'HealthPulse',
    tagline: 'Remote patient monitoring for chronic disease management',
    description: 'FDA-cleared wearable + AI platform helping doctors monitor chronic patients remotely.',
    founder_name: 'Dr. Samantha Lee',
    team_size: '15',
    sector: 'HealthTech',
    stage: 'Seed',
    location: 'Boston, MA',
    region: 'North America',
    funding_raised: 1500000,
    funding_goal: 2000000,
    current_mrr: 42000,
    has_revenue: true,
    readiness_score: 78,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
  {
    id: 'startup-003',
    company_name: 'GreenCharge',
    tagline: 'Solar-powered EV charging network',
    description: 'Building the largest carbon-neutral EV charging network with 200+ stations installed.',
    founder_name: 'Elena Rodriguez',
    team_size: '65',
    sector: 'Climate Tech',
    stage: 'Series B',
    location: 'Austin, TX',
    region: 'North America',
    funding_raised: 25000000,
    funding_goal: 10000000,
    current_mrr: 420000,
    has_revenue: true,
    readiness_score: 89,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
  {
    id: 'startup-004',
    company_name: 'EduFlow',
    tagline: 'AI tutor personalizing K-12 education',
    description: 'Adaptive learning platform improving test scores by 32% across 45 schools.',
    founder_name: 'Jason Park',
    team_size: '12',
    sector: 'EdTech',
    stage: 'Seed',
    location: 'Palo Alto, CA',
    region: 'North America',
    funding_raised: 800000,
    funding_goal: 1500000,
    current_mrr: 28000,
    has_revenue: true,
    readiness_score: 75,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
  {
    id: 'startup-005',
    company_name: 'SecureAPI',
    tagline: 'Real-time API security platform',
    description: 'AI-powered API threat detection protecting $2B+ in transactions daily.',
    founder_name: 'Linda Chen',
    team_size: '22',
    sector: 'Cybersecurity',
    stage: 'Series A',
    location: 'New York, NY',
    region: 'North America',
    funding_raised: 8000000,
    funding_goal: 5000000,
    current_mrr: 180000,
    has_revenue: true,
    readiness_score: 82,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
  {
    id: 'startup-006',
    company_name: 'FarmTech Solutions',
    tagline: 'Precision agriculture platform',
    description: 'IoT sensors and AI helping farmers increase yields by 25% while reducing water usage.',
    founder_name: 'Raj Patel',
    team_size: '18',
    sector: 'AgTech',
    stage: 'Seed',
    location: 'Bangalore, India',
    region: 'Asia',
    funding_raised: 2000000,
    funding_goal: 3000000,
    current_mrr: 35000,
    has_revenue: true,
    readiness_score: 76,
    is_verified: true,
    is_active: true,
    seeking_funding: true,
  },
];

export default function StartupDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');

  const filteredStartups = mockStartupDirectory.filter(startup => {
    const matchesSearch = startup.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'All' || startup.stage === selectedStage;
    const matchesSector = selectedSector === 'All' || startup.sector === selectedSector;
    
    return matchesSearch && matchesStage && matchesSector && startup.is_active;
  });

  const stages = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];
  const allSectors = Array.from(new Set(mockStartupDirectory.map(s => s.sector))).filter(Boolean);
  const sectors = ['All', ...allSectors.sort()];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Startup Directory</h1>
          <p className="text-muted-foreground text-lg">
            Discover investment-ready startups with verified scores and traction
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, sector, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Funding Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredStartups.length} startup{filteredStartups.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Startup Cards */}
        <div className="grid gap-6">
          {filteredStartups.map((startup) => (
            <Card key={startup.id} className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary/40">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{startup.company_name}</h3>
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
                      <TrendingUp className="h-4 w-4" />
                      Team: {startup.team_size}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Seeking: ${startup.funding_goal?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {startup.stage}
                </Badge>
              </div>

              {startup.description && (
                <p className="text-muted-foreground mb-4">{startup.description}</p>
              )}

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Sector</h4>
                  <Badge variant="outline" className="text-xs">
                    {startup.sector}
                  </Badge>
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
                    <li className="text-xs text-muted-foreground">
                      <span className="text-primary mr-1">•</span>
                      Score: {startup.readiness_score}/100
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Funding Status</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-muted-foreground">
                      <span className="text-green-600 mr-1">✓</span>
                      {startup.seeking_funding ? 'Actively fundraising' : 'Not fundraising'}
                    </li>
                    {startup.funding_raised && (
                      <li className="text-xs text-muted-foreground">
                        <span className="text-green-600 mr-1">✓</span>
                        Raised: ${startup.funding_raised.toLocaleString()}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/fundraiser/${startup.id}`)}
                  className="flex-1"
                >
                  View Full Profile
                </Button>
                <Button 
                  size="sm"
                  className="flex-1"
                >
                  Express Interest
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredStartups.length === 0 && (
          <Card className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No startups found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}
