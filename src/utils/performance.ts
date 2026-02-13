import { useEffect, useRef } from 'react';

// Type definitions for Web Performance APIs - Best Practices 2026
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface EventTimingEntry extends PerformanceEntry {
  processingStart: number;
}

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
          case 'first-input': {
            const eventEntry = entry as EventTimingEntry;
            metricsRef.current.fid = eventEntry.processingStart - eventEntry.startTime;
            break;
          }
          case 'layout-shift': {
            const layoutEntry = entry as LayoutShiftEntry;
            if (!layoutEntry.hadRecentInput) {
              metricsRef.current.cls = (metricsRef.current.cls ?? 0) + layoutEntry.value;
            }
            break;
          }
        }
      }
    });

    observer.observe({ entryTypes: ['web-vitals', 'first-input', 'layout-shift'] });

    // Use PerformanceNavigationTiming for modern browsers
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      metricsRef.current.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    return () => observer.disconnect();
  }, []);

  return metricsRef;
}

export function reportWebVitals(metric: string, value: number): void {
  if (process.env.NODE_ENV === 'production') {
    console.info(`[Web Vitals] ${metric}: ${value}`);
  }
}

export function measureRenderTime(componentName: string): () => void {
  const start = performance.now();
  
  return function endRender(): void {
    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

// Type-safe debounce implementation
type AnyFunction = (...args: readonly unknown[]) => void;

export function debounce<T extends AnyFunction>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function debounced(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Type-safe throttle implementation
export function throttle<T extends AnyFunction>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function throttled(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const now = Date.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
