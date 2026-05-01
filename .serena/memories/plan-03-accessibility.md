# PLAN 03: ACCESSIBILITY OVERHAUL ♿

**Priority:** HIGH  
**Status:** PLANNED  
**Created:** 2026-02-17  
**Dependencies:** PLAN 02 (Design System)

---

## 🎯 ZIEL

WCAG 2.1 AA Compliance für alle OpenDocs Features:

- Vollständige Keyboard Navigation
- Screen Reader Support (VoiceOver, NVDA, JAWS)
- Focus Indicators (visible, consistent)
- ARIA Labels und Roles
- Skip Links

---

## 📋 TASKS

### Task 3.1: FOCUS MANAGEMENT

**Actions:**

1. Visible Focus Indicators (3px outline, high contrast)
2. Focus Trap in Modals/Dialogs
3. Focus Restore nach Modal schließen
4. Skip to Content Link
5. Focus Order (logical tab order)

**Files:**

- [ ] `src/styles/focus.css` (Focus Indicators)
- [ ] `src/hooks/useFocusTrap.ts`
- [ ] `src/components/SkipLink.tsx`

### Task 3.2: KEYBOARD NAVIGATION

**Actions:**

1. Alle interaktiven Elements per Keyboard bedienbar
2. Custom Keyboard Shortcuts (Strg+K, Strg+S, etc.)
3. Arrow Key Navigation in Lists/Menus
4. Escape schließt Modals/Dropdowns
5. Tab/Shift+Tab navigiert logisch

**Features:**

- [ ] Global Keyboard Shortcuts
- [ ] List/Menu Navigation
- [ ] Modal/Dropdown Keyboard Support
- [ ] Form Navigation

### Task 3.3: ARIA & SEMANTICS

**Actions:**

1. Semantic HTML (header, main, nav, article, etc.)
2. ARIA Labels für alle interaktiven Elements
3. ARIA Live Regions für dynamische Updates
4. Role Attributes wo nötig
5. Screen Reader Announcements

**Components to Fix:**

- [ ] Block Editor (ARIA roles)
- [ ] Comments System (live regions)
- [ ] Collaboration Features (presence announcements)
- [ ] Toast Notifications (aria-live)

### Task 3.4: SCREEN READER TESTING

**Actions:**

1. Test mit VoiceOver (macOS)
2. Test mit NVDA (Windows)
3. Test mit JAWS (Windows)
4. Fix alle gefundenen Issues
5. Create Screen Reader Guide

**Test Cases:**

- [ ] Navigate through document
- [ ] Edit blocks with screen reader
- [ ] Add comments
- [ ] Use collaboration features
- [ ] Navigate menus

### Task 3.5: CONTRAST & VISUAL ACCESSIBILITY

**Actions:**

1. Contrast Check (WCAG AA: 4.5:1 normal, 3:1 large)
2. Color Blindness Simulation testen
3. Text Scaling (bis 200% ohne Zoom)
4. Reduced Motion Support

**Tools:**

- [ ] axe DevTools
- [ ] WAVE
- [ ] Color Oracle (Color Blindness)
- [ ] Chrome DevTools Accessibility

---

## 📊 METRICS

| Metric              | Current  | Target     | Status |
| ------------------- | -------- | ---------- | ------ |
| Keyboard Accessible | ~60%     | 100%       | 📈     |
| ARIA Coverage       | ~30%     | 95%+       | 📈     |
| Contrast Ratio      | Unknown  | AA (4.5:1) | 📈     |
| Screen Reader Score | Untested | 90+        | 📈     |
| Skip Links          | 0        | 3+         | 📈     |

---

## 🎯 SUCCESS CRITERIA

✅ Alle Features per Keyboard bedienbar  
✅ Focus Indicators sichtbar und konsistent  
✅ ARIA Labels für alle interaktiven Elements  
✅ Screen Reader Testing bestanden (90+ Score)  
✅ WCAG 2.1 AA Contrast Ratios erreicht  
✅ Skip Links vorhanden und funktionierend

---

**Dependencies:** PLAN 02 (Design System muss Focus Styles liefern)  
**ETA:** 2-3 Tage  
**Blocker:** Keine
