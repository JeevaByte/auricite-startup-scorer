import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Save } from "lucide-react";

export function PrivacyControls() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicFields, setPublicFields] = useState({
    full_name: true,
    company_name: true
  });

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("is_public, public_fields")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setIsPublic(data.is_public || false);
        if (data.public_fields && typeof data.public_fields === 'object') {
          setPublicFields(data.public_fields as typeof publicFields);
        }
      }
    } catch (error: any) {
      console.error("Error fetching privacy settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_public: isPublic,
          public_fields: publicFields
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Also update assessment privacy
      const { error: assessmentError } = await supabase
        .from("assessments")
        .update({ is_public: isPublic })
        .eq("user_id", user.id);

      if (assessmentError) throw assessmentError;

      toast({
        title: "Privacy settings updated",
        description: "Your profile visibility has been updated."
      });
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Profile Privacy</h3>
          <p className="text-sm text-muted-foreground">
            Control who can see your profile information
          </p>
        </div>
        {isPublic ? (
          <Eye className="h-5 w-5 text-primary" />
        ) : (
          <EyeOff className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="public-profile">Make profile public</Label>
          <Switch
            id="public-profile"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
        </div>

        {isPublic && (
          <div className="pl-4 border-l-2 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              Choose what information to display:
            </p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-name">Full Name</Label>
              <Switch
                id="show-name"
                checked={publicFields.full_name}
                onCheckedChange={(checked) =>
                  setPublicFields({ ...publicFields, full_name: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-company">Company Name</Label>
              <Switch
                id="show-company"
                checked={publicFields.company_name}
                onCheckedChange={(checked) =>
                  setPublicFields({ ...publicFields, company_name: checked })
                }
              />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Privacy Settings"}
        </Button>

        {isPublic && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(`/fundraiser/${supabase.auth.getUser()}`, "_blank")}
          >
            Preview Public Profile
          </Button>
        )}
      </div>
    </Card>
  );
}
