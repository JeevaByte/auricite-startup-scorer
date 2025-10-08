import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvestorProfile {
  id: string;
  display_name: string;
  org_name: string;
  bio: string;
  sectors: string[];
  ticket_min: number;
  ticket_max: number;
  region: string;
  verification_status: string;
  is_qualified: boolean;
}

export default function InvestorListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investors, setInvestors] = useState<InvestorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    try {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("is_public", true)
        .order("verification_status", { ascending: false });

      if (error) {
        // Use mock data if database query fails
        const { mockInvestors } = await import("@/utils/mockInvestorDirectory");
        setInvestors(mockInvestors as any);
        toast({
          title: "Demo Mode",
          description: "Showing sample investor data",
        });
      } else {
        setInvestors(data || []);
      }
    } catch (error: any) {
      // Fallback to mock data
      const { mockInvestors } = await import("@/utils/mockInvestorDirectory");
      setInvestors(mockInvestors as any);
      toast({
        title: "Demo Mode",
        description: "Showing sample investor data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch = investor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.org_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !sectorFilter || investor.sectors?.includes(sectorFilter);
    const matchesRegion = !regionFilter || investor.region === regionFilter;
    return matchesSearch && matchesSector && matchesRegion;
  });

  if (loading) {
    return <div className="container py-8">Loading investors...</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Investor Directory</h1>
        <p className="text-muted-foreground">Connect with investors looking for opportunities like yours</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search investors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Sectors</option>
          <option value="SaaS">SaaS</option>
          <option value="FinTech">FinTech</option>
          <option value="HealthTech">HealthTech</option>
          <option value="AI/ML">AI/ML</option>
        </select>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Regions</option>
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia Pacific">Asia Pacific</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {investor.display_name}
                  {investor.verification_status === "verified" && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </h3>
                {investor.org_name && (
                  <p className="text-sm text-muted-foreground">{investor.org_name}</p>
                )}
              </div>
            </div>

            <p className="text-sm mb-4 line-clamp-3">{investor.bio}</p>

            <div className="space-y-2 mb-4">
              {investor.sectors && investor.sectors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {investor.sectors.slice(0, 3).map((sector) => (
                    <Badge key={sector} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                  {investor.sectors.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{investor.sectors.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {investor.ticket_min && investor.ticket_max && (
                <p className="text-sm text-muted-foreground">
                  Ticket: ${(investor.ticket_min / 1000)}K - ${(investor.ticket_max / 1000)}K
                </p>
              )}

              {investor.region && (
                <p className="text-sm text-muted-foreground">{investor.region}</p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => navigate(`/investor/${investor.id}`)}
            >
              View Profile
            </Button>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No investors found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
