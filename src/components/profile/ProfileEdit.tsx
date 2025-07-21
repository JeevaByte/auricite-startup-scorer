import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, User } from 'lucide-react';

interface ProfileData {
  full_name?: string;
  company_name?: string;
  email?: string;
}

export const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile({
        full_name: data?.full_name || '',
        company_name: data?.company_name || '',
        email: data?.email || user?.email || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          company_name: profile.company_name,
          email: profile.email,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Edit Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={profile.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={profile.company_name || ''}
            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
            placeholder="Enter your company name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};