import { useToastStore } from "@/store/useToastStore";
import { cn } from "@/utils/cn";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200 dark:border-green-800",
  error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800",
  info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800",
};

function ToastItem({
  id,
  message,
  type,
  action,
}: {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  action?: { label: string; onClick: () => void };
}) {
  const { removeToast } = useToastStore();
  const [progress, setProgress] = useState(100);
  const Icon = icons[type];

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (100 * interval) / duration;
    
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(timer);
          return 0;
        }
        return p - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-right-full duration-300",
        styles[type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-1 text-xs font-semibold underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>

        <button
          type="button"
          onClick={() => removeToast(id)}
          className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
        <X className="h-4 w-4" />
      </button>

      <div
        className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function ToastProvider() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[min(400px,calc(100vw-2rem))]">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
