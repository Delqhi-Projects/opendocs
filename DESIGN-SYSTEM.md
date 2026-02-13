# OpenDocs Design System

**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Active

---

## Overview

OpenDocs follows a modern, utility-first design system built on CSS custom properties and Tailwind CSS. The system prioritizes:

- **Simplicity** - Clear, consistent patterns
- **Accessibility** - WCAG 2.1 AA compliance
- **Dark Mode** - First-class dark theme support
- **Responsiveness** - Mobile-first approach

---

## Design Tokens

### Color Palette

#### Primary Colors (Blue)
```css
--color-primary-50:  #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;
```

#### Neutral Colors (Zinc)
```css
--color-neutral-0:   #ffffff;
--color-neutral-50:  #f8fafc;
--color-neutral-100: #f1f5f9;
--color-neutral-200: #e2e8f0;
--color-neutral-300: #cbd5e1;
--color-neutral-400: #94a3b8;
--color-neutral-500: #64748b;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1e293b;
--color-neutral-900: #0f172a;
--color-neutral-950: #020617;
```

#### Semantic Colors
| Token | Usage |
|-------|-------|
| `--color-success-*` | Success states, confirmations |
| `--color-warning-*` | Warnings, cautions |
| `--color-error-*` | Errors, destructive actions |
| `--color-info-*` | Information, help |

### Typography

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Monaco, 'Courier New', monospace;
```

#### Font Sizes
| Token | Size | Usage |
|-------|------|-------|
| `--font-size-xs` | 0.75rem | Captions, labels |
| `--font-size-sm` | 0.875rem | Small text, secondary |
| `--font-size-base` | 1rem | Body text |
| `--font-size-lg` | 1.125rem | Emphasis |
| `--font-size-xl` | 1.25rem | Subheadings |
| `--font-size-2xl` | 1.5rem | Headings |
| `--font-size-3xl` | 1.875rem | Large headings |
| `--font-size-4xl` | 2.25rem | Display |

### Spacing & Sizing

#### Border Radius
```css
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.375rem; /* 6px */
--radius-lg:   0.5rem;   /* 8px */
--radius-xl:   0.75rem;  /* 12px */
--radius-2xl:  1rem;     /* 16px */
--radius-full: 9999px;   /* Pills */
```

#### Shadows
```css
--shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Transitions

```css
--transition-fast:   150ms ease;
--transition-normal: 200ms ease;
--transition-slow:   300ms ease;
```

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 1000 | Dropdowns |
| `--z-sticky` | 1020 | Sticky elements |
| `--z-fixed` | 1030 | Fixed elements |
| `--z-modal-backdrop` | 1040 | Modal backdrop |
| `--z-modal` | 1050 | Modals |
| `--z-popover` | 1060 | Popovers |
| `--z-tooltip` | 1070 | Tooltips |
| `--z-toast` | 1080 | Toasts |

---

## Component Variants

### Button

```typescript
const variants = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300",
  danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700",
};

const sizes = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};
```

### Card

```typescript
const cardVariants = {
  default: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm",
  elevated: "bg-white dark:bg-zinc-900 shadow-md dark:shadow-lg",
  outline: "bg-transparent border-zinc-300 dark:border-zinc-700",
};
```

### Input

```typescript
const inputVariants = {
  default: "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
  ghost: "bg-transparent border-transparent",
};
```

---

## Theme System

### Theme Values

- `light` - Light theme
- `dark` - Dark theme
- `system` - Follow system preference

### Implementation

```typescript
// Hook usage
const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

// Apply theme
document.documentElement.setAttribute('data-theme', resolvedTheme);
```

### Dark Mode CSS

```css
[data-theme="dark"] {
  --color-neutral-0:   #0f172a;
  --color-neutral-50:  #1e293b;
  --color-neutral-100: #334155;
  --color-neutral-900: #f8fafc;
  --color-neutral-950: #ffffff;
}
```

---

## Responsive Design

### Breakpoints

| Name | Min Width | Target |
|------|-----------|--------|
| `xs` | 0px | Mobile (small) |
| `sm` | 640px | Mobile (large) |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop (large) |
| `2xl` | 1536px | Wide screens |

### Responsive Hooks

```typescript
const breakpoint = useBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
const isMobile = useIsMobile();     // < 768px
const isTablet = useIsTablet();     // 768px - 1023px
const isDesktop = useIsDesktop();   // >= 1024px
```

### Container Widths

```css
.container { max-width: 100%; }
@media (min-width: 640px)  { .container { max-width: 640px; } }
@media (min-width: 768px)  { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }
```

---

## Accessibility

### Utilities

| Component | Purpose |
|-----------|---------|
| `VisuallyHidden` | Hide content visually, keep for screen readers |
| `FocusTrap` | Trap focus within a container |
| `SkipLink` | Skip to main content link |
| `Announcer` | Announce changes to screen readers |

### Screen Reader Classes

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Touch Targets

All interactive elements should be at least 44x44px:

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Animation System

### Framer Motion Transitions

```typescript
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const buttonHover = {
  scale: 1.02,
  y: -1,
};

export const cardHover = {
  scale: 1.01,
  y: -2,
};
```

### Animation Components

| Component | Effect |
|-----------|--------|
| `Fade` | Fade in/out |
| `Slide` | Slide from direction |
| `Scale` | Scale in/out |
| `HoverLift` | Lift on hover |
| `InteractiveCard` | Card with hover/tap effects |

---

## Icon System

### Lucide Icons

Primary icon library: `lucide-react`

```typescript
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Folder,
  Plus,
  Search,
  SunMoon,
  Trash2
} from 'lucide-react';
```

### Icon Sizes

- Small: `h-3 w-3` (12px)
- Default: `h-4 w-4` (16px)
- Medium: `h-5 w-5` (20px)
- Large: `h-6 w-6` (24px)

---

## File Structure

```
src/
├── styles/
│   ├── tokens.css      # Design tokens
│   └── global.css      # Global styles
├── utils/
│   └── theme.ts        # Theme utilities
├── hooks/
│   ├── useTheme.ts     # Theme hook
│   └── useResponsive.ts # Responsive hooks
└── components/ui/
    ├── Button.tsx
    ├── Modal.tsx
    ├── Toast.tsx
    ├── Tooltip.tsx
    ├── A11y.tsx
    ├── Animations.tsx
    └── MicroInteractions.tsx
```

---

## Best Practices

### 1. Use Theme Utilities

```typescript
// Good
import { cnTheme } from '@/utils/theme';
className={cnTheme('text-zinc-900', 'dark:text-zinc-100')}

// Avoid
className="text-zinc-900 dark:text-zinc-100"
```

### 2. Use Responsive Hooks

```typescript
// Good
const isMobile = useIsMobile();
if (isMobile) { /* mobile logic */ }

// Avoid
if (window.innerWidth < 768) { /* mobile logic */ }
```

### 3. Accessibility First

```tsx
// Always include aria-labels
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>

// Use semantic HTML
<nav aria-label="Main navigation">
  <ul role="list">...</ul>
</nav>
```

### 4. Dark Mode Support

```typescript
// Always include dark variants
className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial design system documentation |

---

**Maintained by:** OpenDocs Team  
**License:** MIT
