export const themeColors = {
  light: {
    background: "bg-white",
    surface: "bg-zinc-50",
    border: "border-zinc-200",
    borderHover: "hover:border-zinc-300",
    text: "text-zinc-900",
    textMuted: "text-zinc-500",
    textHover: "hover:text-zinc-700",
    ring: "ring-zinc-300",
    shadow: "shadow-sm",
    shadowHover: "hover:shadow-md",
  },
  dark: {
    background: "dark:bg-zinc-950",
    surface: "dark:bg-zinc-900",
    border: "dark:border-zinc-800",
    borderHover: "dark:hover:border-zinc-700",
    text: "dark:text-zinc-100",
    textMuted: "dark:text-zinc-400",
    textHover: "dark:hover:text-zinc-200",
    ring: "dark:ring-zinc-700",
    shadow: "dark:shadow-none",
    shadowHover: "dark:shadow-none",
  },
};

export const softBorders = {
  light: {
    subtle: "border-zinc-100",
    default: "border-zinc-200",
    strong: "border-zinc-300",
  },
  dark: {
    subtle: "dark:border-zinc-900",
    default: "dark:border-zinc-800",
    strong: "dark:border-zinc-700",
  },
};

export const contrastSafe = {
  light: {
    bg: "bg-white",
    text: "text-zinc-900",
    textMuted: "text-zinc-600",
    border: "border-zinc-200",
  },
  dark: {
    bg: "dark:bg-zinc-950",
    text: "dark:text-zinc-50",
    textMuted: "dark:text-zinc-400",
    border: "dark:border-zinc-800",
  },
};

export const inputVariants = {
  default:
    "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-indigo-500 dark:focus:ring-indigo-500",
  ghost:
    "bg-transparent dark:bg-transparent border-transparent dark:border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
};

export const cardVariants = {
  default:
    "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none",
  elevated:
    "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md dark:shadow-lg dark:shadow-zinc-900/20",
  outline:
    "bg-transparent dark:bg-transparent border-zinc-300 dark:border-zinc-700",
};

export const buttonVariants = {
  primary:
    "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white border-transparent dark:border-transparent",
  secondary:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-transparent dark:border-transparent",
  ghost:
    "bg-transparent dark:bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent dark:border-transparent",
  danger:
    "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 border-transparent dark:border-transparent",
  outline:
    "bg-transparent dark:bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900",
};

export const surfaceColors = {
  light: {
    50: "bg-zinc-50",
    100: "bg-zinc-100",
    200: "bg-zinc-200",
    300: "bg-zinc-300",
  },
  dark: {
    50: "dark:bg-zinc-950",
    100: "dark:bg-zinc-900",
    200: "dark:bg-zinc-800",
    300: "dark:bg-zinc-700",
  },
};

export function cnTheme(
  light: string,
  dark: string,
  ...args: (string | undefined | null)[]
): string {
  const extended = args.filter(Boolean).join(" ");
  return `${light} ${dark} ${extended}`.trim();
}
