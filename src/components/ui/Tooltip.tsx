import { useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-zinc-900",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900",
  left: "left-full top-1/2 -translate-y-1/2 border-l-zinc-900",
  right: "right-full top-1/2 -translate-y-1/2 border-r-zinc-900",
};

export function Tooltip({
  children,
  content,
  position = "top",
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          >
            <div className="rounded-md bg-zinc-900 px-2 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-zinc-800">
              {content}
            </div>
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ContextualTooltipProps {
  children: ReactNode;
  title: string;
  description: string;
  docsLink?: string;
}

export function ContextualTooltip({
  children,
  title,
  description,
  docsLink,
}: ContextualTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="max-w-xs text-left">
          <div className="font-medium">{title}</div>
          {description && <div className="mt-1 opacity-80">{description}</div>}
          {docsLink && (
            <a
              href={docsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block opacity-60 hover:opacity-100 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more →
            </a>
          )}
        </div>
      }
    >
      {children}
    </Tooltip>
  );
}
