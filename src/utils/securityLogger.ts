
// Security-focused logging utility
interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS';
  userId?: string;
  details: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export const logSecurityEvent = (event: SecurityEvent) => {
  // In production, this would send to a proper logging service
  if (process.env.NODE_ENV === 'production') {
    // Only log security events in production, not console.log
    // This would typically go to a service like DataDog, Sentry, etc.
    return;
  }
  
  // In development, we can still log for debugging
  console.warn('Security Event:', {
    ...event,
    timestamp: event.timestamp.toISOString()
  });
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
