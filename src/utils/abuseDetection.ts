
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface AbuseMetrics {
  ipAddress: string;
  userAgent: string;
  requests: number;
  timestamp: number;
}

const RATE_LIMITS = {
  assessment: { maxRequests: 5, windowMs: 60000 }, // 5 assessments per minute
  general: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { maxRequests: 10, windowMs: 60000 }, // 10 auth attempts per minute
};

const requestCache = new Map<string, AbuseMetrics>();

export const checkRateLimit = (
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'general'
): { allowed: boolean; remaining: number } => {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}_${identifier}`;
  
  const existing = requestCache.get(key);
  
  if (!existing || now - existing.timestamp > config.windowMs) {
    // Reset or create new entry
    requestCache.set(key, {
      ipAddress: identifier,
      userAgent: '',
      requests: 1,
      timestamp: now,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }
  
  if (existing.requests >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  existing.requests++;
  return { allowed: true, remaining: config.maxRequests - existing.requests };
};

export const detectSuspiciousActivity = async (
  userId: string,
  activity: string,
  metadata?: any
): Promise<{ isSuspicious: boolean; reason?: string }> => {
  try {
    // Check for rapid-fire submissions
    const { data: recentActivities } = await supabase
      .from('audit_log')
      .select('created_at')
      .eq('user_id', userId)
      .eq('action', activity)
      .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false });

    if (recentActivities && recentActivities.length > 10) {
      return {
        isSuspicious: true,
        reason: 'Excessive activity detected - more than 10 actions in 5 minutes'
      };
    }

    // Check for unusual patterns
    if (activity === 'assessment_submission') {
      const { data: assessments } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false });

      if (assessments && assessments.length > 5) {
        return {
          isSuspicious: true,
          reason: 'Multiple assessments submitted in short time'
        };
      }

      // Check for identical responses pattern
      if (assessments && assessments.length > 1) {
        const latest = assessments[0];
        const previous = assessments[1];
        
        // Simple check for identical answers (in real implementation, use more sophisticated comparison)
        const identicalFields = Object.keys(latest).filter(key => 
          key !== 'id' && key !== 'created_at' && key !== 'updated_at' &&
          latest[key] === previous[key]
        );
        
        if (identicalFields.length > 8) { // Most fields are identical
          return {
            isSuspicious: true,
            reason: 'Potentially duplicate submission detected'
          };
        }
      }
    }

    return { isSuspicious: false };
  } catch (error) {
    console.error('Error detecting suspicious activity:', error);
    return { isSuspicious: false };
  }
};

export const logSecurityEvent = async (
  eventType: 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'BOT_DETECTED',
  details: any,
  userId?: string
) => {
  try {
    await supabase.from('audit_log').insert({
      table_name: 'security_events',
      record_id: crypto.randomUUID(),
      action: eventType,
      new_values: details,
      user_id: userId,
      ip_address: details.ipAddress,
      user_agent: details.userAgent,
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

export const validateHuman = (captchaResponse?: string): boolean => {
  // In a real implementation, verify with captcha service
  // For now, just check if captcha response exists
  return !!captchaResponse && captchaResponse.length > 10;
};

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Bot detection patterns
const BOT_PATTERNS = [
  /bot|crawler|spider/i,
  /curl|wget|postman/i,
  /automated|script/i,
];

export const detectBot = (userAgent: string): boolean => {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
};
