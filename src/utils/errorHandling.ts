
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
