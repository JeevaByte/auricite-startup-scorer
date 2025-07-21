import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Don't show prompt immediately, wait for user engagement
      setTimeout(() => {
        if (!localStorage.getItem('pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds of usage
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed > 7) {
        localStorage.removeItem('pwa-prompt-dismissed');
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-sm">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Install App</CardTitle>
                <CardDescription className="text-xs">
                  Get the best experience
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            {isIOS 
              ? "Add this app to your home screen for quick access and a better experience."
              : "Install our app for faster access, offline support, and a native experience."
            }
          </p>
          
          {isIOS ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Tap the share button in Safari, then "Add to Home Screen"
              </p>
              <Button onClick={handleDismiss} variant="outline" className="w-full text-xs h-8">
                Got it
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 text-xs h-8"
              >
                Not now
              </Button>
              <Button
                onClick={handleInstallClick}
                className="flex-1 text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};