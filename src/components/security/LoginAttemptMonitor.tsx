import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { authRateLimiter } from '@/utils/rateLimiting';

interface LoginAttemptMonitorProps {
  email: string;
  onRateLimited: (remainingTime: number) => void;
}

export const LoginAttemptMonitor: React.FC<LoginAttemptMonitorProps> = ({
  email,
  onRateLimited
}) => {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  useEffect(() => {
    if (!email) return;

    const rateLimitKey = `login_${email}`;
    const checkRateLimit = () => {
      const limited = authRateLimiter.isRateLimited(rateLimitKey);
      const remaining = authRateLimiter.getRemainingTime(rateLimitKey);
      
      setIsRateLimited(limited);
      setRemainingTime(remaining);
      
      if (limited) {
        onRateLimited(remaining);
      }
    };

    checkRateLimit();
    
    // Check every second while rate limited
    const interval = remainingTime > 0 ? setInterval(checkRateLimit, 1000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [email, remainingTime, onRateLimited]);

  if (!isRateLimited) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Too many login attempts. Please wait {remainingTime} seconds before trying again.
      </AlertDescription>
    </Alert>
  );
};

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Shield className="w-4 h-4" />
      <span>Protected by advanced security measures</span>
    </div>
  );
};