import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";

interface FundraiserProfile {
  id: string;
  full_name: string;
  company_name: string;
  is_public: boolean;
  public_fields: Record<string, boolean>;
}

interface Assessment {
  id: string;
  is_public: boolean;
  public_fields: Record<string, boolean>;
}

interface Score {
  total_score: number;
  business_idea: number;
  team: number;
  traction: number;
  financials: number;
}

export default function FundraiserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FundraiserProfile | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setProfile({
          ...profileData,
          public_fields: typeof profileData.public_fields === 'object' 
            ? profileData.public_fields as Record<string, boolean>
            : {}
        });
      }

      // Fetch latest assessment and score
      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("id, is_public, public_fields")
        .eq("user_id", id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (assessmentData) {
        const { data: scoreData } = await supabase
          .from("scores")
          .select("*")
          .eq("assessment_id", assessmentData.id)
          .single();

        if (scoreData) setScore(scoreData);
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
      description: "Your introduction request has been sent."
    });
  };

  if (loading) {
    return <div className="container py-8">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <p>Profile not found</p>
        <Button onClick={() => navigate("/fundraisers")} className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  const shouldShow = (field: string) => {
    return profile.public_fields?.[field] !== false;
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/fundraisers")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Directory
      </Button>

      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            {shouldShow("company_name") && (
              <h1 className="text-3xl font-bold">{profile.company_name}</h1>
            )}
            {shouldShow("full_name") && (
              <p className="text-xl text-muted-foreground mt-1">Founded by {profile.full_name}</p>
            )}
          </div>
          <Button onClick={handleRequestIntro}>
            <Mail className="mr-2 h-4 w-4" />
            Request Intro
          </Button>
        </div>

        {score && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Investment Readiness Score</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{score.total_score}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{score.business_idea}</div>
                <p className="text-sm text-muted-foreground">Idea</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{score.team}</div>
                <p className="text-sm text-muted-foreground">Team</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{score.traction}</div>
                <p className="text-sm text-muted-foreground">Traction</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{score.financials}</div>
                <p className="text-sm text-muted-foreground">Financials</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Want to learn more? Request an introduction to connect with this founder.
          </p>
        </div>
      </Card>
    </div>
  );
}
