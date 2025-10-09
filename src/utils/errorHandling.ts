import { useToast } from '@/hooks/use-toast';

export interface ErrorWithFallback {
  error: Error;
  fallback?: () => void;
  userMessage?: string;
}

export const handleError = (errorInfo: ErrorWithFallback) => {
  const { error, fallback, userMessage } = errorInfo;
  
  console.error('Application error:', error);
  
  // Log to monitoring service (if available)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error);
  }
  
  // Execute fallback if provided
  if (fallback) {
    try {
      fallback();
    } catch (fallbackError) {
      console.error('Fallback execution failed:', fallbackError);
    }
  }
  
  // Show user-friendly error message
  if (userMessage) {
    // Note: This would need to be called from a component context
    // For now, we'll just log it
    console.warn('User message:', userMessage);
  }
  
  return {
    handled: true,
    timestamp: new Date().toISOString(),
    errorId: generateErrorId()
  };
};

export const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  fallback?: () => ReturnType<T>
): T => {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      handleError({
        error: error as Error,
        fallback,
        userMessage: 'An unexpected error occurred. Please try again.'
      });
      
      if (fallback) {
        return fallback();
      }
      
      throw error;
    }
  }) as T;
};

// Retry logic for failed requests
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};

export const createRobustAIErrorHandler = () => {
  const fallbackResponses = {
    scoring: {
      businessIdea: "Strong concept with clear market potential. Focus on customer validation and competitive differentiation.",
      financials: "Solid financial foundation. Consider diversifying revenue streams and improving cash flow projections.",
      team: "Capable team with relevant experience. Consider adding advisory support in key areas.",
      traction: "Good early traction indicators. Focus on scaling user acquisition and retention metrics."
    },
    recommendations: {
      businessIdea: [
        "Conduct 10 customer interviews to validate problem-solution fit",
        "Research market size using industry reports and competitive analysis",
        "Develop compelling value proposition statements for different customer segments"
      ],
      financials: [
        "Create detailed 18-month financial projections with scenario planning",
        "Document clear path to profitability with key milestones",
        "Establish financial controls and reporting systems"
      ],
      team: [
        "Document team expertise and previous achievements",
        "Consider recruiting advisors with relevant industry experience",
        "Create clear roles and responsibilities documentation"
      ],
      traction: [
        "Implement comprehensive analytics to track key metrics",
        "Secure 3-5 customer testimonials or case studies",
        "Establish clear growth milestones and tracking systems"
      ]
    }
  };

  return {
    handleScoringError: (section: string) => {
      console.warn(`AI scoring failed for ${section}, using fallback`);
      return fallbackResponses.scoring[section as keyof typeof fallbackResponses.scoring] || 
             "Assessment completed. Consider strengthening this area for better investment readiness.";
    },
    
    handleRecommendationsError: (section: string) => {
      console.warn(`AI recommendations failed for ${section}, using fallback`);
      return fallbackResponses.recommendations[section as keyof typeof fallbackResponses.recommendations] || 
             ["Focus on strengthening fundamentals in this area", "Seek expert advice for targeted improvements"];
    }
  };
};

// Rate limiting for API calls
export const createAPIRateLimiter = (maxRequests: number = 10, timeWindow: number = 60000) => {
  const requestLog: number[] = [];
  
  return {
    canMakeRequest: () => {
      const now = Date.now();
      const recentRequests = requestLog.filter(time => now - time < timeWindow);
      requestLog.length = 0;
      requestLog.push(...recentRequests);
      
      return recentRequests.length < maxRequests;
    },
    
    logRequest: () => {
      requestLog.push(Date.now());
    },
    
    getTimeUntilNextRequest: () => {
      if (requestLog.length === 0) return 0;
      const oldestRequest = Math.min(...requestLog);
      const timeUntilReset = (oldestRequest + timeWindow) - Date.now();
      return Math.max(0, timeUntilReset);
    }
  };
};
