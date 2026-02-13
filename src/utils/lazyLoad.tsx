import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { SkeletonBlock } from '@/components/ui/Skeleton';

interface LazyLoadOptions {
  fallback?: ReactNode;
  delay?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const { fallback = <SkeletonBlock />, delay = 0 } = options;
  
  const LazyComponent = lazy(() => 
    delay > 0 
      ? new Promise((resolve) => setTimeout(resolve, delay)).then(() => factory())
      : factory()
  );

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    factory()
      .then(resolve)
      .catch((error) => {
        if (retries <= 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          lazyLoadWithRetry(factory, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 1000);
      });
  });
}
