import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Users, ExternalLink, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadingState } from '@/components/ui/loading-state';

interface InvestorProfile {
  id: string;
  name: string;
  type: 'Angel' | 'VC' | 'Corporate VC' | 'Family Office';
  location: string;
  checkSize: string;
  stage: string[];
  sectors: string[];
  description: string;
  website?: string;
  portfolio: string[];
}

const mockInvestors: InvestorProfile[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    type: 'Angel',
    location: 'San Francisco, CA',
    checkSize: '$25K - $100K',
    stage: ['Pre-Seed', 'Seed'],
    sectors: ['SaaS', 'FinTech', 'HealthTech'],
    description: 'Former VP at Stripe, focused on B2B SaaS and fintech startups. Active mentor and advisor.',
    website: 'https://sarahchen.vc',
    portfolio: ['Startup A', 'Startup B', 'Startup C']
  },
  {
    id: '2',
    name: 'Accel Partners',
    type: 'VC',
    location: 'Palo Alto, CA',
    checkSize: '$1M - $15M',
    stage: ['Seed', 'Series A', 'Series B'],
    sectors: ['Enterprise', 'Consumer', 'Mobile'],
    description: 'Early-stage venture capital firm with a focus on software and internet companies.',
    website: 'https://accel.com',
    portfolio: ['Facebook', 'Dropbox', 'Slack']
  },
  {
    id: '3',
    name: 'Google Ventures',
    type: 'Corporate VC',
    location: 'Mountain View, CA',
    checkSize: '$250K - $50M',
    stage: ['Seed', 'Series A', 'Series B', 'Growth'],
    sectors: ['AI/ML', 'Healthcare', 'Robotics', 'Cybersecurity'],
    description: 'Venture capital arm of Alphabet Inc., investing in bold new companies.',
    website: 'https://gv.com',
    portfolio: ['Uber', 'Nest', 'Flatiron Health']
  },
  {
    id: '4',
    name: 'Johnson Family Office',
    type: 'Family Office',
    location: 'New York, NY',
    checkSize: '$100K - $5M',
    stage: ['Pre-Seed', 'Seed', 'Series A'],
    sectors: ['Real Estate Tech', 'E-commerce', 'Climate'],
    description: 'Multi-generational family office with interests in sustainable technology.',
    portfolio: ['CleanTech Co', 'PropTech Startup']
  }
];

export default function InvestorDirectory() {
  const { user, loading: authLoading } = useAuth();
  const { hasPremiumAccess, loading: subLoading, plans } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');

  // Show loading state while checking authentication and subscription
  if (authLoading || subLoading) {
    return <LoadingState message="Checking access permissions..." />;
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access the investor directory.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Require premium access
  if (!hasPremiumAccess) {
    const premiumPlan = plans.find(p => p.name === 'Premium');
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-3xl font-bold mb-2">Investor Directory</h1>
            <Badge className="bg-yellow-100 text-yellow-800">
              Premium Feature
            </Badge>
          </div>

          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Premium Access Required</h2>
            <p className="text-gray-600 mb-6">
              Connect with our curated network of investors including angels, VCs, and family offices. 
              Upgrade to Premium to access detailed investor profiles and contact information.
            </p>
            
            {premiumPlan && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg max-w-sm mx-auto">
                <p className="font-semibold text-lg">${premiumPlan.price_monthly}/month</p>
                <p className="text-sm text-gray-600 mt-1">Premium Plan Features:</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  {premiumPlan.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => window.location.href = '/pricing'}>
                <Crown className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.href = '/'}>
                Learn More
              </Button>
            </div>
          </Card>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">What You'll Get</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Access to 500+ verified investor profiles</li>
                <li>• Direct contact information</li>
                <li>• Investment preferences and criteria</li>
                <li>• Portfolio companies and past investments</li>
                <li>• Advanced filtering and search</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Investor Types</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Angel Investors</li>
                <li>• Venture Capital Firms</li>
                <li>• Corporate VCs</li>
                <li>• Family Offices</li>
                <li>• Institutional Investors</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Premium users can access the full directory
  const filteredInvestors = mockInvestors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.sectors.some(sector => sector.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || investor.type === selectedType;
    const matchesStage = selectedStage === 'All' || investor.stage.includes(selectedStage);
    
    return matchesSearch && matchesType && matchesStage;
  });

  const investorTypes = ['All', 'Angel', 'VC', 'Corporate VC', 'Family Office'];
  const stages = ['All', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Investor Directory</h1>
            <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
          </div>
          <p className="text-gray-600">Connect with investors who match your startup's stage and sector</p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {investorTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid gap-6">
          {filteredInvestors.map((investor) => (
            <Card key={investor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{investor.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {investor.type}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {investor.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {investor.checkSize}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button size="sm">
                    Connect
                  </Button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{investor.description}</p>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Investment Stages</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.stage.map((stage) => (
                      <Badge key={stage} variant="outline" className="text-xs">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sectors</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.sectors.map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Portfolio</h4>
                  <div className="text-sm text-gray-600">
                    {investor.portfolio.slice(0, 3).join(', ')}
                    {investor.portfolio.length > 3 && ` +${investor.portfolio.length - 3} more`}
                  </div>
                </div>
              </div>

              {investor.website && (
                <div className="border-t pt-4">
                  <a
                    href={investor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredInvestors.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}
