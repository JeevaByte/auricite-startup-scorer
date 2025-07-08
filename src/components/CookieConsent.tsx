
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const saved = JSON.parse(consent);
      setPreferences(saved);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    applyCookieSettings(allAccepted);
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(minimal);
    localStorage.setItem('cookie-consent', JSON.stringify(minimal));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    applyCookieSettings(minimal);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    applyCookieSettings(preferences);
  };

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Enable/disable analytics tracking
    if (prefs.analytics) {
      console.log('Analytics tracking enabled');
      // Initialize analytics here
    } else {
      console.log('Analytics tracking disabled');
      // Disable analytics here
    }

    // Enable/disable marketing cookies
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    } else {
      console.log('Marketing cookies disabled');
    }

    // Enable/disable functional cookies
    if (prefs.functional) {
      console.log('Functional cookies enabled');
    } else {
      console.log('Functional cookies disabled');
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Cookie className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Cookie Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. 
                You can customize your cookie preferences or accept all cookies to continue.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll} className="bg-primary">
                  Accept All Cookies
                </Button>
                <Button onClick={handleRejectAll} variant="outline">
                  Reject All
                </Button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Cookie Preferences</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Necessary Cookies</Label>
                          <p className="text-sm text-muted-foreground">
                            Required for the website to function properly. Cannot be disabled.
                          </p>
                        </div>
                        <Switch checked={true} disabled />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Analytics Cookies</Label>
                          <p className="text-sm text-muted-foreground">
                            Help us understand how visitors interact with our website.
                          </p>
                        </div>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={(checked) =>
                            setPreferences(prev => ({ ...prev, analytics: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Marketing Cookies</Label>
                          <p className="text-sm text-muted-foreground">
                            Used to deliver personalized advertisements and track their effectiveness.
                          </p>
                        </div>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={(checked) =>
                            setPreferences(prev => ({ ...prev, marketing: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Functional Cookies</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable enhanced functionality and personalization.
                          </p>
                        </div>
                        <Switch
                          checked={preferences.functional}
                          onCheckedChange={(checked) =>
                            setPreferences(prev => ({ ...prev, functional: checked }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSavePreferences}>
                        Save Preferences
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
