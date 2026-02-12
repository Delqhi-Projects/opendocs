export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",
  DEFAULT: "shadow-md",
  md: "shadow-lg",
  lg: "shadow-xl",
  xl: "shadow-2xl",
  inner: "shadow-inner",
  outer: "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
  card: "shadow-[0_2px_8px_rgb(0,0,0,0.08)]",
  cardHover: "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
  modal: "shadow-[0_25px_50px_-12px_rgb(0,0,0,0.25)]",
  dropdown: "shadow-[0_10px_40px_rgb(0,0,0,0.15)]",
  focus: "shadow-[0_0_0_2px_rgba(99,102,241,0.5)]",
};

export const darkShadows = {
  none: "dark:shadow-none",
  sm: "dark:shadow-none",
  DEFAULT: "dark:shadow-lg dark:shadow-zinc-900/20",
  md: "dark:shadow-xl dark:shadow-zinc-900/25",
  lg: "dark:shadow-2xl dark:shadow-zinc-900/30",
  xl: "dark:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.5)]",
  inner: "dark:shadow-inner dark:shadow-black/20",
  outer: "dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]",
  card: "dark:shadow-none",
  cardHover: "dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
  modal: "dark:shadow-[0_25px_50px_-12px_rgb(0,0,0,0.7)]",
  dropdown: "dark:shadow-[0_10px_40px_rgb(0,0,0,0.5)]",
  focus: "dark:shadow-[0_0_0_2px_rgba(99,102,241,0.5)]",
};

export function cnShadow(
  light: keyof typeof shadows,
  dark: keyof typeof darkShadows
): string {
  return `${shadows[light]} ${darkShadows[dark]}`;
}

export const depthLevels = {
  surface: cnShadow("none", "none"),
  elevated: cnShadow("sm", "DEFAULT"),
  floating: cnShadow("DEFAULT", "md"),
  overlay: cnShadow("md", "lg"),
  modal: cnShadow("lg", "modal"),
  dropdown: cnShadow("outer", "dropdown"),
};

export const interactionShadows = {
  idle: cnShadow("card", "card"),
  hover: cnShadow("cardHover", "cardHover"),
  active: cnShadow("sm", "sm"),
};
