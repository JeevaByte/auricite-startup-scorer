
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  email_assessments: boolean;
  email_recommendations: boolean;
  email_updates: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_assessments: true,
    email_recommendations: true,
    email_updates: false,
    push_notifications: true,
    marketing_emails: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (!error && data && data.notification_preferences) {
        setPreferences({ ...preferences, ...data.notification_preferences as NotificationPreferences });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          notification_preferences: newPreferences
        });

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
      // Revert the change
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Assessment Completion</span>
              </Label>
              <p className="text-sm text-gray-600">
                Receive emails when you complete assessments
              </p>
            </div>
            <Switch
              checked={preferences.email_assessments}
              onCheckedChange={(checked) => updatePreference('email_assessments', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Recommendations</span>
              </Label>
              <p className="text-sm text-gray-600">
                Get notified about new personalized recommendations
              </p>
            </div>
            <Switch
              checked={preferences.email_recommendations}
              onCheckedChange={(checked) => updatePreference('email_recommendations', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Platform Updates</span>
              </Label>
              <p className="text-sm text-gray-600">
                Stay informed about new features and improvements
              </p>
            </div>
            <Switch
              checked={preferences.email_updates}
              onCheckedChange={(checked) => updatePreference('email_updates', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-gray-600">
                Show notifications in your browser when the app is open
              </p>
            </div>
            <Switch
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-gray-600">
                Receive occasional emails about tips and best practices
              </p>
            </div>
            <Switch
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
              disabled={isSaving}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            You can update these preferences at any time. Critical security notifications will always be sent regardless of your preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
