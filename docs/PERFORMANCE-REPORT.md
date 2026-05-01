# Performance Report - OpenDocs

**Date:** 2026-02-14  
**URL Tested:** http://localhost:5173  
**Lighthouse Version:** 12.8.2  
**Preset:** Desktop

---

## Executive Summary

| Metric                                | Value  | Score | Status            |
| ------------------------------------- | ------ | ----- | ----------------- |
| **Performance Score**                 | 49/100 | 0.49  | Needs Improvement |
| First Contentful Paint (FCP)          | 3.0s   | 0.07  | Poor              |
| Largest Contentful Paint (LCP)        | 5.5s   | 0.06  | Poor              |
| Speed Index                           | 3.5s   | 0.16  | Needs Improvement |
| Time to Interactive (TTI)             | 5.9s   | 0.28  | Needs Improvement |
| Total Blocking Time (TBT)             | 260ms  | 0.67  | Needs Improvement |
| Max Potential First Input Delay (FID) | 230ms  | 0.55  | Needs Improvement |
| Cumulative Layout Shift (CLS)         | 0      | 1.00  | Excellent         |

---

## Key Performance Issues

### 1. Largest Contentful Paint (LCP) - 5.5s (CRITICAL)

**Current State:** 5,490ms  
**Target:** <2,500ms (Good)  
**Score:** 0.06 (Poor)

**Root Causes:**

- Large JavaScript bundle loading before content renders
- React DOM hydration delay (development mode)
- Heavy component tree initialization (Mermaid, Database, Workflow blocks)
- Multiple nested dependencies loading sequentially

**Recommendations:**

1. Implement code splitting with dynamic imports for heavy components
2. Preload critical assets using `<link rel="preload">`
3. Consider Server-Side Rendering (SSR) for initial content
4. Lazy-load non-critical components (MermaidView, DatabaseBlockView, WorkflowBlockView)
5. Use production build instead of development build

---

### 2. First Contentful Paint (FCP) - 3.0s (CRITICAL)

**Current State:** 2,966ms  
**Target:** <1,800ms (Good)  
**Score:** 0.07 (Poor)

**Root Causes:**

- Large CSS bundle (111KB blocking render)
- Development mode overhead (React, Vite)
- Font loading delay
- Multiple synchronous module loads

**Recommendations:**

1. Enable CSS minification and tree-shaking
2. Implement critical CSS inlining
3. Add `font-display: swap` to prevent FOIT
4. Preconnect to external font origins
5. Use Vite's build optimization for production

---

### 3. JavaScript Bundle Optimization (CRITICAL)

**Total Unused JavaScript:** ~1.5MB

| File                  | Size    | Wasted | Waste % |
| --------------------- | ------- | ------ | ------- |
| react-dom (dev)       | 1,004KB | 386KB  | 38.4%   |
| @supabase/supabase-js | 431KB   | 296KB  | 68.6%   |
| framer-motion         | 420KB   | 295KB  | 70.1%   |
| lucide-react          | 960KB   | 242KB  | 25.2%   |

**Recommendations:**

1. **Switch to Production Build**

   ```bash
   npm run build  # Instead of npm run dev
   ```

2. **Implement Dynamic Imports**

   ```typescript
   // Instead of static import
   const MermaidView = lazy(() => import("./blocks/MermaidView"));
   const DatabaseBlockView = lazy(() => import("./blocks/DatabaseBlockView"));
   const WorkflowBlockView = lazy(() => import("./blocks/WorkflowBlockView"));
   ```

3. **Tree-Shake Dependencies**
   - Use specific imports from libraries:

   ```typescript
   // Instead of: import { useState, useEffect } from 'react'
   // Use: import { useState } from 'react'

   // Instead of: import { X, Y, Z } from 'lucide-react'
   // Use: import X from 'lucide-react/icons/X'
   ```

4. **Optimize Supabase**

   ```typescript
   // Use modular imports
   import { createClient } from "@supabase/supabase-js";
   // Already modular, but verify unused methods are tree-shaken
   ```

5. **Framer Motion Optimization**
   ```typescript
   // Use motion instead of framer-motion for smaller bundle
   import { motion } from "framer-motion";
   // Already minimal - consider reducing animation complexity
   ```

---

### 4. Total Blocking Time (TBT) - 260ms

**Current State:** 260ms  
**Target:** <200ms (Good)  
**Score:** 0.67 (Needs Improvement)

**JavaScript Execution Time (Heaviest):**
| Script | Total Time | Scripting |
|--------|------------|-----------|
| react-dom (dev) | 585ms | 467ms |
| Unattributable | 362ms | 7ms |
| Main bundle | 102ms | 1ms |

**Recommendations:**

1. Defer non-critical JavaScript
2. Break up long tasks using `requestIdleCallback`
3. Use Web Workers for heavy computations
4. Optimize event handlers

---

### 5. First Input Delay (FID) - 230ms

**Current State:** 230ms  
**Target:** <100ms (Good)  
**Score:** 0.55 (Needs Improvement)

**Recommendations:**

1. Reduce main thread work (see TBT improvements)
2. Break up JavaScript execution into smaller chunks
3. Use `requestAnimationFrame` for visual updates
4. Defer third-party scripts

---

### 6. Cumulative Layout Shift (CLS) - 0 (EXCELLENT)

**Current State:** 0  
**Target:** <0.1 (Good)  
**Score:** 1.00 (Excellent)

No action needed - this is already optimal.

---

## Bundle Size Analysis

### Unminified JavaScript (Development Mode)

| File                  | Size    | Potential Savings |
| --------------------- | ------- | ----------------- |
| react-dom (dev)       | 1,004KB | 307KB (30%)       |
| lucide-react          | 960KB   | 242KB (25%)       |
| @supabase/supabase-js | 431KB   | 190KB (44%)       |

**Total Potential Savings:** ~739KB

### Recommendations:

1. Always use production builds for deployment
2. Configure Vite for production optimization:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       minify: "terser",
       terserOptions: {
         compress: {
           drop_console: true,
           drop_debugger: true,
         },
       },
       rollupOptions: {
         output: {
           manualChunks: {
             "react-vendor": ["react", "react-dom"],
             supabase: ["@supabase/supabase-js"],
             ui: ["lucide-react", "framer-motion"],
           },
         },
       },
     },
   });
   ```

---

## Network Request Analysis

### Critical Request Chains

- **Total Chains:** 49
- **Deepest Chain:** 8 levels
- **Largest Transfer:** react-dom (1,005KB)

### Render-Blocking Resources

No explicit render-blocking resources detected (Vite handles this well).

---

## Priority Actions

### P0 - Critical (Fix Immediately)

1. **Switch to Production Build**

   ```bash
   npm run build && npm run preview
   ```

   Expected improvement: 40-60% faster LCP

2. **Implement Code Splitting**
   - Add React.lazy() for heavy components
   - Expected improvement: 20-30% faster FCP

### P1 - High Priority (This Week)

3. **Configure Vite Build Optimization**
   - Enable minification
   - Configure manual chunks
   - Expected improvement: 15-25% faster TTI

4. **Optimize Dependencies**
   - Use specific imports
   - Remove unused dependencies
   - Expected improvement: 10-20% smaller bundle

### P2 - Medium Priority (This Month)

5. **Consider SSR Implementation**
   - Next.js or React Server Components
   - Expected improvement: 50%+ faster FCP

6. **Add Performance Monitoring**
   - Web Vitals integration
   - Real user monitoring (RUM)

---

## Quick Wins (Immediate)

1. **Add to vite.config.ts:**

   ```typescript
   build: {
     target: 'esnext',
     minify: 'esbuild',
     sourcemap: false,
   }
   ```

2. **Add to index.html:**

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preload" as="style" href="https://fonts.googleapis.com/..." />
   ```

3. **Use dynamic imports in App.tsx:**
   ```typescript
   const MermaidView = React.lazy(
     () => import("./components/blocks/MermaidView"),
   );
   const DatabaseBlockView = React.lazy(
     () => import("./components/blocks/DatabaseBlockView"),
   );
   ```

---

## Benchmarks After Optimization (Target)

| Metric            | Current | Target | Improvement |
| ----------------- | ------- | ------ | ----------- |
| Performance Score | 49      | 85+    | +36         |
| LCP               | 5.5s    | 2.0s   | 64%         |
| FCP               | 3.0s    | 1.5s   | 50%         |
| TTI               | 5.9s    | 3.0s   | 49%         |
| TBT               | 260ms   | 150ms  | 42%         |
| Bundle Size       | ~3MB    | ~1MB   | 67%         |

---

## Conclusion

The OpenDocs application has significant performance issues primarily due to:

1. Running in development mode (not production)
2. Large bundle sizes without code splitting
3. Heavy dependencies (React, Supabase, Framer Motion)

**Immediate action:** Run `npm run build` and serve the production build instead of development mode for a 40-60% performance improvement.

---

_Generated by Lighthouse 12.8.2 on 2026-02-14_
