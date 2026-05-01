# PLAN 02: DESIGN SYSTEM V2 🎨

**Priority:** HIGH  
**Status:** PLANNED  
**Created:** 2026-02-17  
**Dependencies:** PLAN 01 (Recovery) muss abgeschlossen sein

---

## 🎯 ZIEL

Modernes, zugängliches Design System für OpenDocs mit:

- Professional Typography Scale
- Color Tokens mit Dark Mode 2.0
- Component Library (Button, Input, Card, etc.)
- Full Accessibility (WCAG 2.1 AA)

---

## 📋 TASKS

### Task 2.1: DESIGN AUDIT

**Actions:**

1. Analysiere existierende DESIGN-SYSTEM.md (aktuell v1.0)
2. Analysiere DESIGN-AUDIT-REPORT.md
3. Analysiere DESIGN_SYSTEM_RESEARCH.md (33KB!)
4. Identifiziere Lücken zwischen Research und Implementation

**Deliverables:**

- [ ] Design Gap Analysis Document
- [ ] Priority List für Implementation

### Task 2.2: TYPOGRAPHY V2

**Actions:**

1. Definiere Typography Scale (modular scale 1.25)
2. Font Families: Inter (Sans), JetBrains Mono (Mono)
3. Font Sizes: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60px
4. Line Heights: tight (1.25), normal (1.5), loose (1.75)
5. Font Weights: 400, 500, 600, 700

**Files:**

- [ ] `src/styles/typography.css`
- [ ] Update `src/styles/variables.css`

### Task 2.3: COLOR TOKENS V2

**Actions:**

1. Base Colors: Zinc (Neutral), Blue (Primary)
2. Semantic Colors: Success, Warning, Error, Info
3. Dark Mode Palette (nicht nur invertiert!)
4. Accessibility Contrast Checks (WCAG AA)

**Files:**

- [ ] `src/styles/colors.css`
- [ ] `src/styles/dark-mode.css`

### Task 2.4: COMPONENT LIBRARY

**Components to Create/Update:**

- [ ] Button (primary, secondary, ghost, danger)
- [ ] Input (text, textarea, select, checkbox)
- [ ] Card (base, interactive, elevated)
- [ ] Badge (info, success, warning, error)
- [ ] Avatar (image, fallback, status)
- [ ] Tooltip (accessible, keyboard)
- [ ] Modal (accessible, focus trap)
- [ ] Toast (notifications, undo)

**Files:**

- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] ... (alle Components)

### Task 2.5: DARK MODE 2.0

**Features:**

1. System preference detection
2. Manual toggle (persisted in localStorage)
3. Smooth transitions (0.3s ease)
4. Image filtering für Dark Mode
5. Print styles (immer light mode)

**Files:**

- [ ] `src/hooks/useDarkMode.ts`
- [ ] `src/components/DarkModeToggle.tsx`
- [ ] Update `src/styles/dark-mode.css`

---

## 📊 METRICS

| Metric           | Current | Target   | Status |
| ---------------- | ------- | -------- | ------ |
| Color Tokens     | 10      | 50+      | 📈     |
| Typography Scale | Basic   | Modular  | 📈     |
| Components       | 5       | 15+      | 📈     |
| Dark Mode        | Basic   | Advanced | 📈     |
| A11y Score       | Unknown | 95+      | 📈     |

---

## 🎯 SUCCESS CRITERIA

✅ Typography Scale implementiert und dokumentiert  
✅ Color Tokens mit Dark Mode 2.0  
✅ 15+ UI Components erstellt  
✅ Dark Mode Toggle funktioniert perfekt  
✅ WCAG 2.1 AA Contrast Ratios erreicht  
✅ Design System in Storybook dokumentiert

---

**Dependencies:** PLAN 01 muss abgeschlossen sein  
**ETA:** 3-4 Tage  
**Blocker:** Keine
