# PLAN 01: PROJECT RECOVERY & CLEANUP 🔴 CRITICAL

**Priority:** CRITICAL  
**Status:** IN PROGRESS  
**Created:** 2026-02-17  
**Session:** ses_opendocs_recovery

---

## 🚨 KRITISCHE FEHLER (IST-ZUSTAND)

### 1. FEHLENDE package.json ❌

**Problem:** Keine package.json im Projekt-Root  
**Impact:**

- ❌ Keine Dependency-Definition
- ❌ Build-Prozess nicht reproduzierbar
- ❌ node_modules ist "orphaned" (79 TS Files aber kein Build)
- ❌ Projekt nicht deploybar

**Lösung:** package.json rekonstruieren aus existierenden Configs

### 2. lastchanges.md mit FALSCHER Content ❌

**Problem:** Enthält SIN-Solver Container Cleanup (fremdes Projekt)  
**Lösung:** Archivieren + neue OpenDocs lastchanges.md

### 3. Verwaiste Files ❌

- server.log (verwaist)
- PNG Screenshots (temp?)
- Alte Build-Artefakte

---

## ✅ PHASE 1: RECOVERY (MUST DO - TODAY)

### Task 1.1: package.json rekonstruieren

**Actions:**

1. Analysiere eslint.config.js für Linting-Setup
2. Analysiere vitest.config.ts für Test-Setup
3. Analysiere tsconfig.json für TypeScript
4. Analysiere node_modules für existierende Dependencies
5. Erstelle package.json mit:
   - scripts: dev, build, test, lint, typecheck
   - dependencies: React, Vite, TypeScript, etc.
   - devDependencies: ESLint, Vitest, Playwright

**Success:** `npm install` läuft erfolgreich

### Task 1.2: lastchanges.md korrigieren

**Actions:**

1. Verschiebe zu `lastchanges-2026-02-12-sin-solver.md` (Archiv)
2. Erstelle neue lastchanges.md mit OpenDocs Header
3. Erster Eintrag: Project Recovery Session

**Success:** lastchanges.md enthält nur OpenDocs Content

### Task 1.3: Temp Files cleanup

**Actions:**

1. Lösche server.log (verwaist)
2. Archiviere PNGs in /docs/screenshots/
3. `npm prune` für node_modules

**Success:** Git clean zeigt nur notwendige Files

---

## 📋 CHECKLISTE

#### Recovery (Critical)

- [ ] package.json erstellt
- [ ] tsconfig.json validiert
- [ ] vite.config.ts erstellt
- [ ] .gitignore geprüft
- [ ] .env.example erstellt

#### Cleanup (Important)

- [ ] lastchanges.md korrigiert
- [ ] Temp Files gelöscht/archiviert
- [ ] node_modules gepruft

#### Verification (Must Pass)

- [ ] `npm install` ✅
- [ ] `npm run dev` ✅
- [ ] `npm run build` ✅
- [ ] `npm test` ✅

---

## 🎯 SUCCESS CRITERIA

✅ package.json existiert mit allen Dependencies  
✅ npm scripts funktionieren alle  
✅ Projekt ist buildbar und deployable  
✅ lastchanges.md hat korrekten Content  
✅ Keine verwaisten Temp-Files  
✅ Git status clean

---

**Next Action:** package.json rekonstruieren  
**ETA:** 2 Stunden  
**Blocker:** Keine
