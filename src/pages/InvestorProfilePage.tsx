import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

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
  public_fields: Record<string, boolean>;
}

export default function InvestorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investor, setInvestor] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchInvestor();
  }, [id]);

  const fetchInvestor = async () => {
    try {
      const { data, error } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error) throw error;
      if (data) {
        setInvestor({
          ...data,
          public_fields: typeof data.public_fields === 'object'
            ? data.public_fields as Record<string, boolean>
            : {}
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestIntro = () => {
    toast({
      title: "Request sent",
      description: "Your introduction request has been sent to the investor."
    });
  };

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!investor) {
    return (
      <div className="container py-8">
        <p>Investor not found</p>
        <Button onClick={() => navigate("/investors")} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  const shouldShow = (field: string) => {
    return investor.public_fields?.[field] !== false;
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/investors")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Directory
      </Button>

      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            {shouldShow("display_name") && (
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {investor.display_name}
                {investor.verification_status === "verified" && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </h1>
            )}
            {shouldShow("org_name") && investor.org_name && (
              <p className="text-xl text-muted-foreground mt-1">{investor.org_name}</p>
            )}
          </div>
          <Button onClick={handleRequestIntro}>
            <Mail className="mr-2 h-4 w-4" />
            Request Intro
          </Button>
        </div>

        {shouldShow("bio") && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground">{investor.bio}</p>
          </div>
        )}

        {shouldShow("sectors") && investor.sectors && investor.sectors.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Sectors of Interest</h2>
            <div className="flex flex-wrap gap-2">
              {investor.sectors.map((sector) => (
                <Badge key={sector} variant="secondary">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {shouldShow("ticket_min") && shouldShow("ticket_max") && investor.ticket_min && investor.ticket_max && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Investment Range</h2>
              <p className="text-muted-foreground">
                ${(investor.ticket_min / 1000).toLocaleString()}K - ${(investor.ticket_max / 1000).toLocaleString()}K
              </p>
            </div>
          )}

          {shouldShow("region") && investor.region && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Region</h2>
              <p className="text-muted-foreground">{investor.region}</p>
            </div>
          )}
        </div>

        {investor.verification_status === "verified" && (
          <div className="mt-6 p-4 bg-primary/10 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="font-semibold">Verified Investor</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This investor has been verified by our team
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
