import { useEffect, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  ["2xl"]: 1536,
};

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      let current: Breakpoint = "xs";
      for (const [name, value] of Object.entries(breakpoints)) {
        if (width >= value) {
          current = name as Breakpoint;
        }
      }
      setBreakpoint(current);
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
