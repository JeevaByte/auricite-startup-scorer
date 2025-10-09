import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export const PerformanceMonitor = () => {
  const performanceData = useRef<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0
  });

  useEffect(() => {
    // Defer performance monitoring until after page is interactive
    // This prevents blocking the critical rendering path
    const initDelay = setTimeout(() => {
      observePerformance();
    }, 2000); // Delay by 2 seconds to allow critical resources to load

    // Monitor Core Web Vitals
    const observePerformance = () => {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[0];
        if (fcp) {
          reportMetric('fcp', fcp.startTime);
        }
      });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportMetric('lcp', lastEntry.startTime);
        }
      });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            reportMetric('fid', fid);
          }
        });
      });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportMetric('cls', clsValue);
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }

      // Time to First Byte
      window.addEventListener('load', () => {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          reportMetric('ttfb', ttfb);
        }
      });
    };

    const reportMetric = (metricName: string, value: number) => {
      console.log(`Performance Metric - ${metricName}:`, value);
      
      // Update ref data
      performanceData.current = {
        ...performanceData.current,
        [metricName]: Math.round(value)
      };
      
      // Send to analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'web_vitals', {
          metric_name: metricName,
          metric_value: Math.round(value),
          custom_parameter: {
            page: window.location.pathname,
            timestamp: Date.now()
          }
        });
      }

      // Store in local storage for debugging
      const storedData = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
      storedData[metricName] = {
        value: Math.round(value),
        timestamp: Date.now(),
        page: window.location.pathname
      };
      localStorage.setItem('performance_metrics', JSON.stringify(storedData));

      // Send to Supabase for analytics (optional)
      // Use requestIdleCallback to defer until browser is idle
      if (window.location.hostname !== 'localhost' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => {
          fetch('/api/performance-metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metric: metricName,
              value: Math.round(value),
              page: window.location.pathname,
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            }),
            keepalive: true, // Allow request to complete even if page unloads
            priority: 'low' // Mark as low priority
          }).catch(err => console.warn('Failed to send performance metric:', err));
        });
      }
    };

    // Cleanup on unmount
    return () => {
      clearTimeout(initDelay);
    };

    // Monitor resource loading times
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources (>1s)
          console.warn('Slow resource detected:', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
          });
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource Observer not supported:', error);
    }

    // Memory usage monitoring
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    // Removed memory monitoring interval - it was already defined inside observePerformance
  }, []);

  return null; // This is a monitoring component, no UI needed
};