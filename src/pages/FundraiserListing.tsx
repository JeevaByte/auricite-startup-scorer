import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Fundraiser {
  id: string;
  full_name: string;
  company_name: string;
  score?: number;
}

export default function FundraiserListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFundraisers();
  }, []);

  const fetchFundraisers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name")
        .eq("is_public", true);

      if (error) {
        // Use mock data if database query fails
        const { mockStartups } = await import("@/utils/mockStartupDirectory");
        setFundraisers(mockStartups.map(s => ({
          id: s.id,
          full_name: s.full_name,
          company_name: s.company_name,
          score: s.score
        })));
        toast({
          title: "Demo Mode",
          description: "Showing sample startup data",
        });
      } else {
        // Fetch scores for each fundraiser
        const fundraisersWithScores = await Promise.all(
          (data || []).map(async (fundraiser) => {
            const { data: assessments } = await supabase
              .from("assessments")
              .select("id")
              .eq("user_id", fundraiser.id)
              .eq("is_public", true)
              .limit(1);

            if (assessments && assessments[0]) {
              const { data: scoreData } = await supabase
                .from("scores")
                .select("total_score")
                .eq("assessment_id", assessments[0].id)
                .single();

              return {
                ...fundraiser,
                score: scoreData?.total_score
              };
            }

            return fundraiser;
          })
        );

        setFundraisers(fundraisersWithScores);
      }
    } catch (error: any) {
      // Fallback to mock data
      const { mockStartups } = await import("@/utils/mockStartupDirectory");
      setFundraisers(mockStartups.map(s => ({
        id: s.id,
        full_name: s.full_name,
        company_name: s.company_name,
        score: s.score
      })));
      toast({
        title: "Demo Mode",
        description: "Showing sample startup data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFundraisers = fundraisers.filter((fundraiser) =>
    fundraiser.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fundraiser.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container py-8">Loading fundraisers...</div>;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Startup Directory</h1>
        <p className="text-muted-foreground">Discover investment-ready startups</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFundraisers.map((fundraiser) => (
          <Card key={fundraiser.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h3 className="font-bold text-lg">{fundraiser.company_name}</h3>
              <p className="text-sm text-muted-foreground">{fundraiser.full_name}</p>
            </div>

            {fundraiser.score && (
              <div className="mb-4">
                <Badge variant="secondary">
                  Score: {fundraiser.score}/100
                </Badge>
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => navigate(`/fundraiser/${fundraiser.id}`)}
            >
              View Profile
            </Button>
          </Card>
        ))}
      </div>

      {filteredFundraisers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No startups found</p>
        </div>
      )}
    </div>
  );
}
