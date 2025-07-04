
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, Zap } from 'lucide-react';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
}

export const MobileOptimization = ({ children }: { children: React.ReactNode }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let type: DeviceInfo['type'] = 'desktop';
      if (width <= 768) type = 'mobile';
      else if (width <= 1024) type = 'tablet';
      
      const orientation = width > height ? 'landscape' : 'portrait';
      const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setDeviceInfo({
        type,
        width,
        height,
        orientation,
        touchEnabled
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const getDeviceIcon = () => {
    switch (deviceInfo?.type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getMobileOptimizations = () => {
    if (!deviceInfo || deviceInfo.type !== 'mobile') return null;

    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        {isInstallable && (
          <Card className="p-3 bg-blue-600 text-white border-0 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Install App</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstallClick}
                className="text-blue-600"
              >
                Install
              </Button>
            </div>
          </Card>
        )}
        
        <Card className="p-2 bg-white/90 backdrop-blur-sm border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {getDeviceIcon()}
              <span className="capitalize">{deviceInfo.type}</span>
              <Badge variant="outline" className="text-xs">
                {deviceInfo.orientation}
              </Badge>
            </div>
            <span className="text-gray-500">
              {deviceInfo.width}×{deviceInfo.height}
            </span>
          </div>
        </Card>
      </div>
    );
  };

  // Apply mobile-specific CSS classes
  const mobileClasses = deviceInfo?.type === 'mobile' ? 
    'mobile-optimized touch-friendly safe-area-inset' : '';

  return (
    <div className={mobileClasses}>
      {children}
      {getMobileOptimizations()}
      
      <style jsx global>{`
        .mobile-optimized {
          /* Larger touch targets */
          --touch-target-size: 44px;
        }
        
        .mobile-optimized button {
          min-height: var(--touch-target-size);
          min-width: var(--touch-target-size);
        }
        
        .mobile-optimized input,
        .mobile-optimized textarea,
        .mobile-optimized select {
          min-height: var(--touch-target-size);
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        .touch-friendly {
          /* Better touch interactions */
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        .touch-friendly input,
        .touch-friendly textarea {
          -webkit-user-select: text;
          user-select: text;
        }
        
        .safe-area-inset {
          /* Handle notches and home indicators */
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        /* Mobile-specific scroll behavior */
        @media (max-width: 768px) {
          .mobile-optimized {
            overflow-x: hidden;
          }
          
          .mobile-optimized .scroll-container {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Sticky positioning adjustments for mobile */
          .mobile-optimized .sticky {
            position: -webkit-sticky;
            position: sticky;
          }
        }
      `}</style>
    </div>
  );
};
