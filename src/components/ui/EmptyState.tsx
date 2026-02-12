import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { HoverLift } from "./MicroInteractions";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "database" | "document" | "automation";
}

const illustrations = {
  default: (
    <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 24a8 8 0 100-16 8 8 0 000 16zM12 28v8M8 32h24M28 16a8 8 0 11-16 0 8 8 0 0116 0z" />
    </svg>
  ),
  database: (
    <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12v12a2 2 0 002 2h28a2 2 0 002-2V12M8 12V8a8 8 0 018-8h16a8 8 0 018 8v4M12 24v8" />
    </svg>
  ),
  document: (
    <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4h20a2 2 0 012 2v32a2 2 0 01-2 2H14a2 2 0 01-2-2V6a2 2 0 012-2zM16 4v6M24 4v6M16 14v20M24 14v20M16 26v10M24 26v10M8 40h8" />
    </svg>
  ),
  automation: (
    <svg className="w-16 h-16 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16h32M8 24h32M8 32h20M20 32v8M28 32v8M16 8a8 8 0 1116 0M16 40a4 4 0 004 4h8a4 4 0 004-4" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        "rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      <div className="mb-4">
        {icon || illustrations[variant]}
      </div>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <HoverLift>{action}</HoverLift>
      )}
    </motion.div>
  );
}
