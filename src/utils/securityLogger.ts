import { supabase } from '@/integrations/supabase/client';

// Security-focused logging utility
interface SecurityEvent {
  type: 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS';
  userId?: string;
  details: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  // Persist to centralized security log (write-only for clients)
  try {
    await supabase.from('security_events' as any).insert({
      type: event.type,
      user_id: event.userId ?? null,
      details: event.details,
      user_agent: event.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      ip_address: event.ipAddress ?? null,
      created_at: event.timestamp.toISOString(),
    });
  } catch (_) {
    // Swallow errors to avoid cascading failures in the UI
  }

  // In development, also log to console for visibility
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Security Event:', {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });
  }
};

export const sanitizeErrorForUser = (error: any): string => {
  // Never expose internal error details to users
  if (error?.message?.includes('auth')) {
    return 'Authentication required';
  }
  if (error?.message?.includes('database') || error?.message?.includes('postgresql')) {
    return 'Service temporarily unavailable';
  }
  if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'Network error - please try again';
  }
  
  // Generic fallback message
  return 'An error occurred - please try again';
};
