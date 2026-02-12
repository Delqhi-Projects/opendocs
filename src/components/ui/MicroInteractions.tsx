import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  y?: number;
  duration?: number;
}

export function HoverLift({
  children,
  className,
  scale = 1.02,
  y = -2,
  duration = 0.2,
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ scale, y }}
      transition={{ duration }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnClickProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ScaleOnClick({
  children,
  className,
  scale = 0.95,
}: ScaleOnClickProps) {
  return (
    <motion.div
      whileTap={{ scale }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

export const microTransition = {
  duration: 0.2,
  ease: "easeInOut" as const,
};

export const buttonHover = {
  scale: 1.02,
  y: -1,
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
};

export const buttonTap = {
  scale: 0.98,
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};

export const cardHover = {
  scale: 1.01,
  y: -2,
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

export const cardTap = {
  scale: 0.99,
};

export function InteractiveCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={cardHover}
      whileTap={cardTap}
      transition={microTransition}
      className={cn("rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900", className)}
    >
      {children}
    </motion.div>
  );
}
