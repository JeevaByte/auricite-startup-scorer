import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

const SECTORS = [
  "SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce",
  "AI/ML", "Blockchain", "IoT", "CleanTech", "FoodTech"
];

const REGIONS = [
  "North America", "Europe", "Asia Pacific", "Latin America",
  "Middle East", "Africa"
];

export default function InvestorOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    org_name: "",
    bio: "",
    sectors: [] as string[],
    ticket_min: "",
    ticket_max: "",
    region: "",
    is_public: false,
    public_fields: {
      display_name: true,
      org_name: true,
      bio: true,
      sectors: true,
      ticket_min: true,
      ticket_max: true,
      region: true
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create investor profile
      const { error: profileError } = await supabase
        .from("investor_profiles")
        .insert({
          user_id: user.id,
          display_name: formData.display_name,
          org_name: formData.org_name,
          bio: formData.bio,
          sectors: formData.sectors,
          ticket_min: parseInt(formData.ticket_min) || null,
          ticket_max: parseInt(formData.ticket_max) || null,
          region: formData.region,
          is_public: formData.is_public,
          public_fields: formData.public_fields,
          personal_capital: true,
          structured_fund: false,
          registered_entity: false,
          due_diligence: false,
          esg_metrics: false,
          check_size: formData.ticket_min || '',
          stage: 'seed',
          deal_source: 'platforms',
          frequency: 'occasional',
          objective: 'returns'
        });

      if (profileError) throw profileError;

      // Update user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: "investor" })
        .eq("user_id", user.id);

      if (roleError) throw roleError;

      toast({
        title: "Profile created!",
        description: "Your investor profile has been created successfully."
      });

      navigate("/investor-dashboard");
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

  const progress = (step / 3) * 100;

  return (
    <div className="container max-w-3xl py-8">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Investor Profile Setup</h1>
          <p className="text-muted-foreground">Complete your profile to get started</p>
          <Progress value={progress} className="mt-4" />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="org_name">Organization Name</Label>
              <Input
                id="org_name"
                value={formData.org_name}
                onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                placeholder="Acme Ventures"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and your investment focus..."
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Sectors of Interest *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SECTORS.map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <Checkbox
                      id={sector}
                      checked={formData.sectors.includes(sector)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          sectors: checked
                            ? [...formData.sectors, sector]
                            : formData.sectors.filter((s) => s !== sector)
                        });
                      }}
                    />
                    <label htmlFor={sector} className="text-sm">{sector}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticket_min">Min Ticket Size ($)</Label>
                <Input
                  id="ticket_min"
                  type="number"
                  value={formData.ticket_min}
                  onChange={(e) => setFormData({ ...formData, ticket_min: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="ticket_max">Max Ticket Size ($)</Label>
                <Input
                  id="ticket_max"
                  type="number"
                  value={formData.ticket_max}
                  onChange={(e) => setFormData({ ...formData, ticket_max: e.target.value })}
                  placeholder="500000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="region">Region</Label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select region</option>
                {REGIONS.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: !!checked })}
              />
              <Label htmlFor="is_public">Make my profile public</Label>
            </div>

            {formData.is_public && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="font-semibold mb-2">Choose what to display publicly:</h3>
                <div className="space-y-2">
                  {Object.keys(formData.public_fields).map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={`public_${field}`}
                        checked={formData.public_fields[field as keyof typeof formData.public_fields]}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          public_fields: { ...formData.public_fields, [field]: !!checked }
                        })}
                      />
                      <label htmlFor={`public_${field}`} className="text-sm capitalize">
                        {field.replace(/_/g, " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <div className="ml-auto flex gap-2">
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
