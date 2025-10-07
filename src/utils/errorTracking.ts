import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export const logError = async (
  error: Error,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'error',
  context?: ErrorContext
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('error_logs' as any).insert({
      error_type: error.name || 'Error',
      error_message: error.message,
      stack_trace: error.stack,
      user_id: user?.id,
      severity,
      context: context || {},
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  } catch (logError) {
    // Don't throw errors from error logging
    console.error('Failed to log error:', logError);
  }
};

export const logPerformanceMetric = async (
  metricType: string,
  metricName: string,
  value: number,
  unit?: string,
  context?: Record<string, any>
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('performance_metrics').insert({
      metric_type: metricType,
      metric_name: metricName,
      value,
      unit,
      user_id: user?.id,
      context: context || {}
    });
  } catch (error) {
    console.error('Failed to log performance metric:', error);
  }
};

// Performance monitoring utilities
export const measurePerformance = async (
  name: string,
  fn: () => Promise<any>
) => {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    await logPerformanceMetric('execution_time', name, duration, 'ms', {
      success: true
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    await logPerformanceMetric('execution_time', name, duration, 'ms', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};

// Enhanced error boundary error handler
export const handleErrorBoundaryError = (error: Error, errorInfo: any) => {
  logError(error, 'critical', {
    component: errorInfo.componentStack,
    action: 'render'
  });
};
