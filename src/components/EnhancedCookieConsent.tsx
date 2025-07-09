
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cookie, Settings, Shield, BarChart3, Zap } from 'lucide-react';

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const EnhancedCookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner to avoid layout shift
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      const savedSettings = JSON.parse(consent);
      setSettings(savedSettings);
    }
  }, []);

  const saveConsent = (newSettings: CookieSettings) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newSettings));
    setSettings(newSettings);
    setShowBanner(false);
    setShowSettings(false);
    
    // Initialize analytics based on consent
    if (newSettings.analytics) {
      // Initialize PostHog or other analytics
      console.log('Analytics enabled');
    }
    
    if (newSettings.marketing) {
      // Initialize marketing tools
      console.log('Marketing cookies enabled');
    }
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const handleCustomSave = () => {
    saveConsent(settings);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg"
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 id="cookie-banner-title" className="font-semibold mb-2">
                  We use cookies to enhance your experience
                </h3>
                <p id="cookie-banner-description" className="text-sm text-muted-foreground">
                  We use essential cookies to make our site work. We'd also like to use analytics cookies 
                  to understand how you use our service and improve your experience.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Customize cookie settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Cookie className="h-5 w-5" />
                      Cookie Preferences
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <Label className="text-sm font-medium">Essential Cookies</Label>
                            <p className="text-xs text-muted-foreground">Required for the website to function</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.essential} 
                          disabled 
                          aria-label="Essential cookies (always required)"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <div>
                            <Label className="text-sm font-medium">Analytics Cookies</Label>
                            <p className="text-xs text-muted-foreground">Help us understand site usage</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.analytics}
                          onCheckedChange={(checked) => setSettings({...settings, analytics: checked})}
                          aria-label="Analytics cookies"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-purple-600" />
                          <div>
                            <Label className="text-sm font-medium">Marketing Cookies</Label>
                            <p className="text-xs text-muted-foreground">Used to show relevant ads</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.marketing}
                          onCheckedChange={(checked) => setSettings({...settings, marketing: checked})}
                          aria-label="Marketing cookies"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-orange-600" />
                          <div>
                            <Label className="text-sm font-medium">Preference Cookies</Label>
                            <p className="text-xs text-muted-foreground">Remember your settings</p>
                          </div>
                        </div>
                        <Switch 
                          checked={settings.preferences}
                          onCheckedChange={(checked) => setSettings({...settings, preferences: checked})}
                          aria-label="Preference cookies"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCustomSave} className="flex-1">
                        Save Preferences
                      </Button>
                      <Button onClick={acceptAll} variant="outline" className="flex-1">
                        Accept All
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button onClick={acceptEssential} variant="outline" size="sm">
                Essential Only
              </Button>
              <Button onClick={acceptAll} size="sm">
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
