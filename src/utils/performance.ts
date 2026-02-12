import { useEffect, useRef } from 'react';

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export function usePerformanceMonitor() {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'web-vitals':
            if (entry.name === 'FCP') {
              metricsRef.current.fcp = entry.startTime;
            }
            if (entry.name === 'LCP') {
              metricsRef.current.lcp = entry.startTime;
            }
            break;
          case 'first-input':
            metricsRef.current.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              metricsRef.current.cls = (metricsRef.current.cls || 0) + (entry as any).value;
            }
            break;
        }
      }
    });

    observer.observe({ entryTypes: ['web-vitals', 'first-input', 'layout-shift'] });

    if (performance.timing) {
      const timing = performance.timing;
      metricsRef.current.ttfb = timing.responseStart - timing.requestStart;
    }

    return () => observer.disconnect();
  }, []);

  return metricsRef;
}

export function reportWebVitals(metric: string, value: number) {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[Web Vitals] ${metric}: ${value}`);
  }
}

export function measureRenderTime(componentName: string) {
  const start = performance.now();
  
  return function endRender() {
    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let lastTime = 0;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
