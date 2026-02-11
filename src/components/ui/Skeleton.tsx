import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animated = true,
}: SkeletonProps) {
  const baseStyles = "bg-zinc-200 dark:bg-zinc-800";
  const animationStyles = animated
    ? "animate-pulse"
    : "";
  
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        baseStyles,
        animationStyles,
        variantStyles[variant],
        className
      )}
      style={style}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <Skeleton variant="rounded" height={120} className="w-full" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonDatabase({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton variant="text" height={40} className="flex-1" />
            <Skeleton variant="text" height={40} className="flex-1" />
            <Skeleton variant="text" height={40} className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-in fade-in duration-300", className)}>
      <Skeleton variant="rounded" height={192} className="w-full" />
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={40} className="w-1/2" />
          <Skeleton variant="text" height={20} className="w-1/4" />
        </div>
      </div>
      <div className="space-y-4 pt-4">
        <SkeletonText lines={4} />
        <SkeletonBlock />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
