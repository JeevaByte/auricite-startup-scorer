import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, TrendingUp, ExternalLink, Building2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartupProfile {
  id: string;
  companyName: string;
  tagline: string;
  location: string;
  fundingStage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Growth';
  sector: string[];
  seeking: string;
  description: string;
  score: number;
  teamSize: number;
  founded: number;
  traction: string[];
  highlights: string[];
}

const mockStartups: StartupProfile[] = [
  {
    id: '1',
    companyName: 'HealthTech Solutions',
    tagline: 'AI-powered healthcare diagnostics platform',
    location: 'London, UK',
    fundingStage: 'Seed',
    sector: ['HealthTech', 'AI/ML', 'SaaS'],
    seeking: '£500K - £1M',
    description: 'Revolutionizing early disease detection through advanced AI algorithms and real-time patient data analysis.',
    score: 87,
    teamSize: 12,
    founded: 2022,
    traction: ['50K+ users', '£200K ARR', 'Partnership with NHS'],
    highlights: ['Y Combinator backed', 'Proven product-market fit', 'Experienced founding team']
  },
  {
    id: '2',
    companyName: 'FinFlow',
    tagline: 'Next-gen payment infrastructure for SMEs',
    location: 'Manchester, UK',
    fundingStage: 'Series A',
    sector: ['FinTech', 'B2B', 'Payments'],
    seeking: '£2M - £5M',
    description: 'Building seamless payment solutions that help small businesses manage cash flow and accept payments globally.',
    score: 92,
    teamSize: 28,
    founded: 2020,
    traction: ['1000+ business clients', '£5M ARR', '300% YoY growth'],
    highlights: ['FCA regulated', 'Strong unit economics', 'Strategic partnerships']
  },
  {
    id: '3',
    companyName: 'GreenEnergy Labs',
    tagline: 'Sustainable energy storage solutions',
    location: 'Edinburgh, UK',
    fundingStage: 'Series B',
    sector: ['CleanTech', 'Energy', 'Hardware'],
    seeking: '£10M - £15M',
    description: 'Developing next-generation battery technology for renewable energy storage at commercial scale.',
    score: 89,
    teamSize: 45,
    founded: 2019,
    traction: ['3 commercial pilots', '£8M ARR', 'Patents filed'],
    highlights: ['Proven technology', 'Government grants', 'Experienced team']
  },
  {
    id: '4',
    companyName: 'EduStream',
    tagline: 'Interactive learning platform for professionals',
    location: 'Bristol, UK',
    fundingStage: 'Seed',
    sector: ['EdTech', 'SaaS', 'B2B'],
    seeking: '£750K - £1.5M',
    description: 'Making professional development engaging through gamified learning experiences and AI-driven personalization.',
    score: 85,
    teamSize: 15,
    founded: 2021,
    traction: ['100K+ learners', '£400K ARR', '45% completion rate'],
    highlights: ['B2B traction', 'Low CAC', 'High retention']
  },
  {
    id: '5',
    companyName: 'LogiChain',
    tagline: 'AI-powered supply chain optimization',
    location: 'Birmingham, UK',
    fundingStage: 'Series A',
    sector: ['Logistics', 'AI/ML', 'Enterprise'],
    seeking: '£3M - £6M',
    description: 'Helping enterprises reduce costs and improve efficiency through intelligent supply chain management.',
    score: 90,
    teamSize: 32,
    founded: 2020,
    traction: ['25 enterprise clients', '£3M ARR', '85% NRR'],
    highlights: ['Fortune 500 clients', 'Proven ROI', 'Scalable platform']
  },
  {
    id: '6',
    companyName: 'FoodTech Innovations',
    tagline: 'Plant-based protein alternatives',
    location: 'Cambridge, UK',
    fundingStage: 'Pre-Seed',
    sector: ['FoodTech', 'Consumer', 'Sustainability'],
    seeking: '£300K - £500K',
    description: 'Creating delicious and sustainable plant-based proteins using proprietary fermentation technology.',
    score: 82,
    teamSize: 8,
    founded: 2023,
    traction: ['Lab validation complete', 'Pilot production', 'Retail interest'],
    highlights: ['PhD founders', 'Patent pending', 'Market validation']
  },
  {
    id: '7',
    companyName: 'SecureID',
    tagline: 'Blockchain-based identity verification',
    location: 'Belfast, UK',
    fundingStage: 'Seed',
    sector: ['Cybersecurity', 'FinTech', 'Enterprise'],
    seeking: '£1M - £2M',
    description: 'Providing secure, privacy-first identity verification solutions for financial institutions and enterprises.',
    score: 88,
    teamSize: 18,
    founded: 2021,
    traction: ['15 clients', '£600K ARR', 'SOC2 compliant'],
    highlights: ['Banking clients', 'Zero breaches', 'Strong security']
  },
  {
    id: '8',
    companyName: 'PropTech Solutions',
    tagline: 'Smart property management platform',
    location: 'Glasgow, UK',
    fundingStage: 'Series A',
    sector: ['PropTech', 'SaaS', 'Real Estate'],
    seeking: '£4M - £8M',
    description: 'Transforming property management with IoT sensors, predictive maintenance, and tenant engagement tools.',
    score: 86,
    teamSize: 35,
    founded: 2019,
    traction: ['500+ properties', '£2M ARR', '95% satisfaction'],
    highlights: ['Market leader', 'Recurring revenue', 'Strong margins']
  },
  {
    id: '9',
    companyName: 'BioMed Analytics',
    tagline: 'Clinical trial data analytics',
    location: 'Oxford, UK',
    fundingStage: 'Series B',
    sector: ['HealthTech', 'Analytics', 'Enterprise'],
    seeking: '£12M - £20M',
    description: 'Accelerating drug discovery with AI-powered clinical trial data analysis and patient matching.',
    score: 94,
    teamSize: 52,
    founded: 2018,
    traction: ['10 pharma clients', '£10M ARR', 'FDA collaboration'],
    highlights: ['Pharma partnerships', 'Proven outcomes', 'IP portfolio']
  },
  {
    id: '10',
    companyName: 'RetailOS',
    tagline: 'Unified commerce platform for retailers',
    location: 'Leeds, UK',
    fundingStage: 'Seed',
    sector: ['E-commerce', 'Retail', 'SaaS'],
    seeking: '£800K - £1.5M',
    description: 'Helping traditional retailers transform digitally with our all-in-one commerce platform.',
    score: 84,
    teamSize: 20,
    founded: 2022,
    traction: ['75 retailers', '£350K ARR', '200% QoQ growth'],
    highlights: ['Strong retention', 'Negative churn', 'Proven demand']
  },
  {
    id: '11',
    companyName: 'CloudSecure',
    tagline: 'Enterprise cloud security automation',
    location: 'Reading, UK',
    fundingStage: 'Series A',
    sector: ['Cybersecurity', 'Cloud', 'Enterprise'],
    seeking: '£5M - £10M',
    description: 'Automating cloud security compliance and threat detection for enterprise organizations.',
    score: 91,
    teamSize: 38,
    founded: 2020,
    traction: ['40 enterprises', '£4M ARR', 'Zero churn'],
    highlights: ['Enterprise sales', 'High margins', 'Patent pending']
  },
  {
    id: '12',
    companyName: 'MobilityHub',
    tagline: 'Smart urban mobility solutions',
    location: 'Newcastle, UK',
    fundingStage: 'Growth',
    sector: ['Mobility', 'Smart City', 'SaaS'],
    seeking: '£15M - £25M',
    description: 'Connecting cities, operators, and users through our integrated urban mobility platform.',
    score: 93,
    teamSize: 68,
    founded: 2017,
    traction: ['12 cities', '£15M ARR', '5M+ users'],
    highlights: ['City partnerships', 'Profitable unit economics', 'Market leader']
  }
];

export default function StartupDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');

  const filteredStartups = mockStartups.filter(startup => {
    const matchesSearch = startup.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.sector.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         startup.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'All' || startup.fundingStage === selectedStage;
    const matchesSector = selectedSector === 'All' || startup.sector.includes(selectedSector);
    
    return matchesSearch && matchesStage && matchesSector;
  });

  const stages = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];
  const allSectors = Array.from(new Set(mockStartups.flatMap(s => s.sector)));
  const sectors = ['All', ...allSectors];

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
                    <h3 className="text-2xl font-bold">{startup.companyName}</h3>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                      <Star className="h-4 w-4 text-primary fill-primary" />
                      <span className="text-sm font-semibold text-primary">{startup.score}/100</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic mb-3">{startup.tagline}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {startup.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {startup.teamSize} employees
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Founded {startup.founded}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Seeking: {startup.seeking}
                    </div>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {startup.fundingStage}
                </Badge>
              </div>

              <p className="text-muted-foreground mb-4">{startup.description}</p>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Sectors</h4>
                  <div className="flex flex-wrap gap-1">
                    {startup.sector.map((sector) => (
                      <Badge key={sector} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Key Traction</h4>
                  <ul className="space-y-1">
                    {startup.traction.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start">
                        <span className="text-primary mr-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">Highlights</h4>
                  <ul className="space-y-1">
                    {startup.highlights.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start">
                        <span className="text-green-600 mr-1">✓</span>
                        {item}
                      </li>
                    ))}
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
