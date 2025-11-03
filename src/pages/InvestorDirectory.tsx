import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Users, ExternalLink, Unlock, UserCircle } from 'lucide-react';
import { AccessControl } from '@/components/AccessControl';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { mockInvestorDirectory } from '@/utils/directoryMockData';
export default function InvestorDirectory() {
  return <InvestorDirectoryContent />;
}

function InvestorDirectoryContent() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const { data, error } = await supabase
          .from('investor_directory')
          .select('*')
          .eq('visibility', 'public')
          .eq('is_active', true);

        if (error) {
          console.warn('Supabase error loading investor_directory, falling back to mock data:', error);
          setInvestors(mockInvestorDirectory as any[]);
          toast({ title: 'Demo Mode', description: 'Showing sample investor data' });
          return;
        }

        if (!data || data.length === 0) {
          setInvestors(mockInvestorDirectory as any[]);
          toast({ title: 'Demo Mode', description: 'Showing sample investor data' });
          return;
        }

        setInvestors(data);
      } catch (err) {
        console.error('Error fetching investors, falling back to mock:', err);
        setInvestors(mockInvestorDirectory as any[]);
        toast({ title: 'Demo Mode', description: 'Showing sample investor data' });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.sectors?.some((sector: string) => sector.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = selectedSector === 'All' || investor.sectors?.includes(selectedSector);
    const matchesRegion = selectedRegion === 'All' || investor.regions?.includes(selectedRegion);
    
    return matchesSearch && matchesSector && matchesRegion;
  });

  const allSectors = Array.from(new Set(investors.flatMap(inv => inv.sectors || [])));
  const sectors = ['All', ...allSectors.sort()];
  
  const allRegions = Array.from(new Set(investors.flatMap(inv => inv.regions || [])));
  const regions = ['All', ...allRegions.sort()];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Directory</h1>
              <p className="text-gray-600">Connect with investors who match your startup's stage and sector</p>
            </div>
            <Button 
              onClick={() => navigate('/investor-dashboard')}
              variant="default"
              size="lg"
              className="flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              My Investor Profile
            </Button>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
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
                  {investor.organization && (
                    <p className="text-sm text-gray-600 mb-1">{investor.organization} {investor.title && `• ${investor.title}`}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${investor.ticket_min?.toLocaleString()} - ${investor.ticket_max?.toLocaleString()}
                    </div>
                    {investor.is_verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
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

              {investor.bio && (
                <p className="text-gray-600 mb-4">{investor.bio}</p>
              )}

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Investment Stages</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.stages.map((stage) => (
                      <Badge key={stage} variant="outline" className="text-xs">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sectors</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.sectors.slice(0, 3).map((sector) => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                    {investor.sectors.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{investor.sectors.length - 3}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Regions</h4>
                  <div className="flex flex-wrap gap-1">
                    {investor.regions.slice(0, 3).map((region) => (
                      <Badge key={region} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                    {investor.regions.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{investor.regions.length - 3}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {investor.linkedin_url && (
                <div className="border-t pt-4">
                  <a
                    href={investor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    LinkedIn Profile
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
