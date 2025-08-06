// Performance monitoring utilities
import React from 'react';

export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  
  static startTiming(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.metrics.push({
        componentName,
        renderTime,
        timestamp: Date.now()
      });
      
      // Log slow components (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }
  
  static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }
  
  static clearMetrics(): void {
    this.metrics = [];
  }
  
  static getAverageRenderTime(componentName: string): number {
    const componentMetrics = this.metrics.filter(m => m.componentName === componentName);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    return total / componentMetrics.length;
  }
  
  static getSlowestComponents(limit = 5): Array<{name: string; avgTime: number}> {
    const componentNames = [...new Set(this.metrics.map(m => m.componentName))];
    
    return componentNames
      .map(name => ({
        name,
        avgTime: this.getAverageRenderTime(name)
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }
}

// Hook for measuring component render time
export function usePerformanceMonitor(componentName: string) {
  const endTiming = PerformanceMonitor.startTiming(componentName);
  
  React.useEffect(() => {
    return endTiming;
  });
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window !== 'undefined') {
    // Safely import web-vitals only in browser environment
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        console.log('CLS:', metric);
        // Send to analytics
      });
      
      getFID((metric) => {
        console.log('FID:', metric);
        // Send to analytics
      });
      
      getFCP((metric) => {
        console.log('FCP:', metric);
        // Send to analytics
      });
      
      getLCP((metric) => {
        console.log('LCP:', metric);
        // Send to analytics
      });
      
      getTTFB((metric) => {
        console.log('TTFB:', metric);
        // Send to analytics
      });
    }).catch(error => {
      console.warn('Failed to load web-vitals:', error);
    });
  }
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    return {
      usedJSHeapSize: memInfo.usedJSHeapSize,
      totalJSHeapSize: memInfo.totalJSHeapSize,
      jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
      percentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
    };
  }
  return null;
}

// Bundle size analysis helper
export function logBundleSize() {
  if (typeof window !== 'undefined') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.group('Bundle Size Analysis');
    console.log('Script files:', scripts.length);
    console.log('Stylesheet files:', styles.length);
    console.groupEnd();
  }
}