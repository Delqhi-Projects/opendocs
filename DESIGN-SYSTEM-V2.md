# OpenDocs Design System V2

**Version:** 2.0  
**Date:** 2026-02-17  
**Status:** Production Ready  
**Inspired by:** Linear, Notion, Vercel, Atlassian

---

## 1. Design Tokens

### 1.1 Color System

#### Semantic Color Tokens

```css
/* Primitive Colors */
--color-blue-50: #eff6ff;
--color-blue-500: #3b82f6;
--color-blue-600: #2563eb;
--color-blue-700: #1d4ed8;

/* Semantic Mappings */
--color-primary: var(--color-blue-600);
--color-primary-hover: var(--color-blue-700);
--color-primary-light: var(--color-blue-50);

--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #0ea5e9;
```

#### Neutral Color Scale

```css
--color-neutral-0: #ffffff; /* Background */
--color-neutral-50: #f8fafc; /* Surface */
--color-neutral-100: #f1f5f9; /* Border light */
--color-neutral-200: #e2e8f0; /* Border */
--color-neutral-300: #cbd5e1; /* Divider */
--color-neutral-400: #94a3b8; /* Text secondary */
--color-neutral-500: #64748b; /* Text tertiary */
--color-neutral-600: #475569; /* Text regular */
--color-neutral-700: #334155; /* Text strong */
--color-neutral-800: #1e293b; /* Text heading */
--color-neutral-900: #0f172a; /* Text primary */
```

### 1.2 Typography System

#### Font Families

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

#### Type Scale

| Token            | Size            | Line Height | Weight | Use Case        |
| ---------------- | --------------- | ----------- | ------ | --------------- |
| `--text-display` | 3.5rem (56px)   | 1.1         | 700    | Hero headlines  |
| `--text-4xl`     | 2.25rem (36px)  | 1.2         | 700    | Page titles     |
| `--text-3xl`     | 1.875rem (30px) | 1.2         | 600    | Section headers |
| `--text-2xl`     | 1.5rem (24px)   | 1.3         | 600    | Subsections     |
| `--text-xl`      | 1.25rem (20px)  | 1.4         | 600    | Card titles     |
| `--text-lg`      | 1.125rem (18px) | 1.5         | 400    | Body large      |
| `--text-base`    | 1rem (16px)     | 1.5         | 400    | Body default    |
| `--text-sm`      | 0.875rem (14px) | 1.5         | 400    | Captions        |
| `--text-xs`      | 0.75rem (12px)  | 1.4         | 400    | Labels, badges  |

### 1.3 Spacing System

**Base Unit:** 4px grid

```css
--spacing-0: 0;
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem; /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem; /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem; /* 24px */
--spacing-8: 2rem; /* 32px */
--spacing-10: 2.5rem; /* 40px */
--spacing-12: 3rem; /* 48px */
--spacing-16: 4rem; /* 64px */
--spacing-20: 5rem; /* 80px */
--spacing-24: 6rem; /* 96px */
```

### 1.4 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem; /* 4px - Subtle */
--radius-md: 0.375rem; /* 6px - Default */
--radius-lg: 0.5rem; /* 8px - Cards */
--radius-xl: 0.75rem; /* 12px - Modals */
--radius-2xl: 1rem; /* 16px - Large modals */
--radius-full: 9999px; /* Pills, avatars */
```

### 1.5 Shadows (Elevation System)

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05); /* Hover */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1); /* Buttons */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1); /* Cards */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1); /* Dropdowns */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15); /* Modals */
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25); /* Popovers */
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06); /* Inputs */
```

### 1.6 Transitions

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 1.7 Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-toast: 1080;
```

---

## 2. Component Patterns

### 2.1 Buttons

```tsx
// Variants
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-danger">Danger</button>

// Sizes
<button className="btn-sm">Small</button>
<button className="btn-md">Medium</button>
<button className="btn-lg">Large</button>
```

### 2.2 Inputs

```tsx
<input className="input" placeholder="Default" />
<input className="input input-error" value="Invalid" />
<input className="input input-disabled" disabled />
```

### 2.3 Cards

```tsx
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
  <div className="card-footer">Actions</div>
</div>
```

---

## 3. Accessibility

### 3.1 Focus States

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 3.2 Color Contrast

- **Normal text:** Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text:** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

### 3.3 Skip Links

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

---

## 4. Dark Mode

### 4.1 Color Inversion

```css
[data-theme="dark"] {
  --color-neutral-0: #0f172a;
  --color-neutral-50: #1e293b;
  --color-neutral-900: #f8fafc;
  /* ... other inversions */
}
```

### 4.2 Implementation

```tsx
// Toggle function
function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute(
    "data-theme",
    current === "dark" ? "light" : "dark",
  );
}
```

---

## 5. Usage Examples

### 5.1 Page Layout

```tsx
<div className="min-h-screen bg-neutral-0">
  <header className="border-b border-neutral-200">
    <nav className="container mx-auto px-4 py-4">{/* Navigation */}</nav>
  </header>

  <main id="main-content" className="container mx-auto px-4 py-8">
    {/* Main content */}
  </main>

  <footer className="border-t border-neutral-200 mt-16">
    <div className="container mx-auto px-4 py-8">{/* Footer */}</div>
  </footer>
</div>
```

### 5.2 Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div
      key={item.id}
      className="card shadow-md hover:shadow-lg transition-shadow"
    >
      <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
      <p className="text-neutral-600">{item.description}</p>
    </div>
  ))}
</div>
```

---

## 6. Best Practices

### DO ✅

- Use semantic color tokens (not primitives)
- Maintain 4px grid alignment
- Test in both light and dark modes
- Use `rem` units for typography
- Include hover, focus, and active states

### DON'T ❌

- Hardcode hex values in components
- Skip focus states for interactive elements
- Use color as the only means of emphasis
- Break the 4px grid system
- Ignore dark mode compatibility

---

## 7. Resources

- [Figma Design System](#) (Coming soon)
- [Storybook Components](#) (Coming soon)
- [Tailwind Config](../tailwind.config.js)
- [CSS Tokens](../src/styles/tokens.css)

---

**Last Updated:** 2026-02-17  
**Maintained by:** Design Team
