import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  responseTime: number;
  services: {
    service: string;
    status: string;
    responseTime: number;
    details?: any;
  }[];
}

export const SystemHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) throw error;
      setHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Failed to check system health');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">
            Monitor service uptime and performance
          </p>
        </div>
        <Button onClick={checkHealth} disabled={checking}>
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">Checking system health...</CardContent>
        </Card>
      ) : !health ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Unable to load health status
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health.status)}
                  <div>
                    <CardTitle>Overall Status</CardTitle>
                    <CardDescription>
                      Last checked: {new Date(health.timestamp).toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(health.status) as any}>
                    {health.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {health.responseTime}ms response time
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.services.map((service) => (
              <Card key={service.service}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <CardTitle className="text-base capitalize">
                          {service.service}
                        </CardTitle>
                        <CardDescription>
                          {service.responseTime}ms
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(service.status) as any}>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                {service.details && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {typeof service.details === 'string' ? service.details : JSON.stringify(service.details)}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};