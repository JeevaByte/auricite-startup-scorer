import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface DriftAlert {
  id: string;
  metric_type: string;
  metric_name: string;
  baseline_value: number;
  current_value: number;
  drift_magnitude: number;
  threshold_exceeded: boolean;
  detection_date: string;
}

export default function DriftMonitoring() {
  const [driftAlerts, setDriftAlerts] = useState<DriftAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriftAlerts();
  }, []);

  const fetchDriftAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('drift_monitoring')
        .select('*')
        .order('detection_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDriftAlerts(data || []);
    } catch (error) {
      console.error('Error fetching drift alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriftSeverity = (magnitude: number) => {
    if (magnitude > 0.2) return { label: "Critical", color: "destructive" };
    if (magnitude > 0.1) return { label: "Warning", color: "warning" };
    return { label: "Normal", color: "default" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Drift Monitoring
        </CardTitle>
        <CardDescription>
          Track feature drift, embedding drift, and score stability over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading drift alerts...</div>
        ) : driftAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            No drift detected. System is stable.
          </div>
        ) : (
          <div className="space-y-3">
            {driftAlerts.map((alert) => {
              const severity = getDriftSeverity(alert.drift_magnitude);
              return (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.threshold_exceeded && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <h4 className="font-medium">{alert.metric_name}</h4>
                      <Badge variant={severity.color as any}>
                        {severity.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {alert.metric_type} • Baseline: {alert.baseline_value?.toFixed(2)} → Current:{" "}
                      {alert.current_value?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drift: {(alert.drift_magnitude * 100).toFixed(1)}% •{" "}
                      {new Date(alert.detection_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
