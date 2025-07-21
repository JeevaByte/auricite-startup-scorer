import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export const PerformanceMonitor = () => {
  useEffect(() => {
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
      const performanceData = JSON.parse(localStorage.getItem('performance_metrics') || '{}');
      performanceData[metricName] = {
        value: Math.round(value),
        timestamp: Date.now(),
        page: window.location.pathname
      };
      localStorage.setItem('performance_metrics', JSON.stringify(performanceData));
    };

    // Initialize performance monitoring
    observePerformance();

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

    const memoryInterval = setInterval(monitorMemory, 30000); // Every 30 seconds

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return null; // This is a monitoring component, no UI needed
};