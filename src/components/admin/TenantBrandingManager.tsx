import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Palette, Globe, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandingSettings {
  custom_domain?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  favicon_url?: string;
  custom_css?: string;
  show_powered_by: boolean;
}

export const TenantBrandingManager: React.FC = () => {
  const [branding, setBranding] = useState<BrandingSettings>({
    primary_color: '#000000',
    secondary_color: '#ffffff',
    show_powered_by: true
  });
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single();

      if (membership) {
        setOrganizationId(membership.organization_id);

        const { data: brandingData } = await supabase
          .from('tenant_branding')
          .select('*')
          .eq('organization_id', membership.organization_id)
          .single();

        if (brandingData) {
          setBranding({
            custom_domain: brandingData.custom_domain || undefined,
            logo_url: brandingData.logo_url || undefined,
            primary_color: brandingData.primary_color,
            secondary_color: brandingData.secondary_color,
            favicon_url: brandingData.favicon_url || undefined,
            custom_css: brandingData.custom_css || undefined,
            show_powered_by: brandingData.show_powered_by
          });
        }
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error('No organization found');
      return;
    }

    try {
      const { error } = await supabase
        .from('tenant_branding')
        .upsert({
          organization_id: organizationId,
          ...branding
        });

      if (error) throw error;
      toast.success('Branding settings saved');
    } catch (error) {
      toast.error('Failed to save branding settings');
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You need to be an organization owner to manage branding
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">White-Labeling & Branding</h2>
        <p className="text-muted-foreground">
          Customize the appearance and branding for your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colors & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  value={branding.primary_color}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={branding.primary_color}
                  onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={branding.secondary_color}
                  onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={branding.logo_url || ''}
              onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="favicon">Favicon URL</Label>
            <Input
              id="favicon"
              value={branding.favicon_url || ''}
              onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Domain & Advanced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domain">Custom Domain</Label>
            <Input
              id="domain"
              value={branding.custom_domain || ''}
              onChange={(e) => setBranding({ ...branding, custom_domain: e.target.value })}
              placeholder="app.yourdomain.com"
            />
          </div>
          <div>
            <Label htmlFor="css">Custom CSS</Label>
            <Textarea
              id="css"
              value={branding.custom_css || ''}
              onChange={(e) => setBranding({ ...branding, custom_css: e.target.value })}
              placeholder=".custom-class { /* your styles */ }"
              rows={6}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="powered">Show "Powered by BAJEEVA"</Label>
            <Switch
              id="powered"
              checked={branding.show_powered_by}
              onCheckedChange={(checked) => setBranding({ ...branding, show_powered_by: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save Branding Settings</Button>
    </div>
  );
};