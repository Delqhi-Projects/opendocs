import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    target: "[data-testid='sidebar']",
    title: "Your Workspace",
    content: "Create pages and organize them in folders. Click + to add new content.",
    position: "right",
  },
  {
    target: "[data-testid='ai-button']",
    title: "AI Assistant",
    content: "Press Ctrl+G or click here to open the AI panel. Transform your content with AI.",
    position: "bottom",
  },
  {
    target: "[data-testid='command-palette']",
    title: "Command Palette",
    content: "Press Ctrl+K to open commands. Quick actions for everything.",
    position: "bottom",
  },
  {
    target: "[data-testid='chat-button']",
    title: "Chat Panel",
    content: "Press Ctrl+J for quick conversations with your AI assistant.",
    position: "bottom",
  },
  {
    target: "[data-testid='theme-toggle']",
    title: "Dark Mode",
    content: "Toggle between light and dark themes. Your preference is saved.",
    position: "bottom",
  },
];

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("opendocs-tour-seen");
    if (hasSeenTour) {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem("opendocs-tour-seen", "true");
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    localStorage.setItem("opendocs-tour-seen", "true");
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="mx-4 max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Step {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Skip tour
            </button>
          </div>

          <div className="mb-4 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div
              className="h-full rounded-full bg-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {step.title}
          </h3>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            {step.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1" role="tablist">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  role="tab"
                  aria-selected={i === currentStep}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === currentStep
                      ? "bg-indigo-500"
                      : i < currentStep
                      ? "bg-indigo-300 dark:bg-indigo-700"
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 active:scale-95"
            >
              {currentStep === tourSteps.length - 1
                ? "Get started"
                : "Next"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const [isTourVisible, setIsTourVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("opendocs-tour-seen");
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsTourVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const completeTour = () => setIsTourVisible(false);
  const skipTour = () => {
    localStorage.setItem("opendocs-tour-seen", "true");
    setIsTourVisible(false);
  };

  return {
    isTourVisible,
    completeTour,
    skipTour,
    resetTour: () => localStorage.removeItem("opendocs-tour-seen"),
  };
}
