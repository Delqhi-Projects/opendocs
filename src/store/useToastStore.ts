import { create } from "zustand";
import { nanoid } from "nanoid";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = nanoid();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

export function useToast() {
  const { addToast, removeToast, clearAll } = useToastStore();
  
  return {
    success: (message: string, duration?: number) =>
      addToast({ message, type: "success", duration }),
    error: (message: string, duration?: number) =>
      addToast({ message, type: "error", duration }),
    warning: (message: string, duration?: number) =>
      addToast({ message, type: "warning", duration }),
    info: (message: string, duration?: number) =>
      addToast({ message, type: "info", duration }),
    custom: addToast,
    remove: removeToast,
    clearAll,
  };
}
