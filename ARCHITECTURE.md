# OpenDocs — ARCHITECTURE.md

> **Best Practices Feb 2026:** Comprehensive architectural single source of truth.

---

## 1. Projekt-Identität
- **Name:** OpenDocs (Tier 1 Production Edition)
- **Vision:** Ein vereinheitlichtes System für Dokumentation, relationale Datenbanken und visuelle n8n-Orchestrierung.
- **Tech Stack:** React 19, Zustand 5, Tailwind v4, Express 5, Supabase (Postgres).
- **Architektur:** Local-First (Zustand + LocalStorage) mit Direct-DB Provisionierung und AI-Proxy.

---

## 2. Goldene Regeln (R1-R4)
| Regel | Beschreibung | Konsequenz |
|---|---|---|
| **R1** | Keine Secrets im Client (VITE_ prefix only for public) | Security Audit Fail |
| **R2** | Hard Locks sind unverletzbar (AI & User) | Data Integrity Error |
| **R3** | Erst Lesen, dann Bearbeiten (Agent Protocol) | Architecture Drift |
| **R4** | Alle IDs via nanoid (Environment safety) | Runtime Crash |

---

## 3. Verzeichnis-Struktur
```
opendocs/
├── src/
│   ├── components/
│   │   ├── blocks/     # Modular Block Renderers (n8n, Draw, DB, etc.)
│   │   ├── database/   # 6 Dynamic Database Views
│   │   └── ui/         # Primitives (Modals, Buttons, Pickers)
│   ├── store/          # Zustand State & Persistence
│   ├── commands/       # AI Agent Execution Layer
│   ├── services/       # Typed Infrastructure Clients
│   └── types/          # Domain Layer (Database, Docs, Icons)
├── server.js           # Production API Gateway (NVIDIA, n8n, OpenClaw)
├── REQUIREMENTS.md     # Dependency Manifest
└── AGENTS-PLAN.md      # Chronological Task Master
```

---

## 4. Schichten-Modell
| Layer | Name | Verantwortung | Erlaubte Imports |
|---|---|---|---|
| **0** | Domain | Types & Schemas (database.ts, docs.ts) | - |
| **1** | Store | Global State & Hydration (useDocsStore.ts) | Layer 0, 4 |
| **2** | Commands | AI Agent Plan Execution (executeCommand.ts) | Layer 0, 1, 4 |
| **3** | UI | Presentation & Interaktion | Layer 0, 1, 2 |
| **4** | Infra | API Proxies (nvidia.ts, n8n.ts, dbProv.ts) | Layer 0 |

---

## 5. Datei-Registry (Kritische Pfade)
| Pfad | Zweck | Status |
|---|---|---|
| `src/main.tsx` | Entry point mit Global Error Boundary | 🟢 Active |
| `src/App.tsx` | App Shell & Shell Event Dispatcher | 🟢 Active |
| `server.js` | Express 5 Security Gateway & Scraper | 🟢 Active |
| `src/store/useDocsStore.ts` | Central Intelligence & Local Sync | 🟢 Active |

---

## 6. Datenfluss (Best Practice 2026)
1. **User Action:** UI → Store → LocalStorage → (Async) Supabase Sync.
2. **AI Action:** Prompt → Agent Plan Endpoint → UI Confirmation → Executor → Store.
3. **DB Action:** View Update → Store → Direct Postgres Proxy → SQL Table.

---

## 7. Performance-Budget
- **Hydration:** < 100ms (Zustand optimized).
- **First Contentful Paint:** < 1.2s (Vite chunk splitting).
- **ID Generation:** nanoid (0% collision risk, 100% environment safety).

---

## 8. Sicherheit & Resilienz
- **SSRF Hardening:** Server-side fetcher blockiert private IP-Ranges und lokale Hostnames.
- **API Gating:** Alle AI/n8n Endpoints sind durch `X-OpenDocs-Token` geschützt.
- **Error Recovery:** Root-Level `ErrorBoundary` ermöglicht Daten-Reset bei State-Korruption.

## 9. UI/UX Architecture Patterns

### 9.1 Auto-Resize Textarea Pattern
- **Problem:** Standard textarea hat scrollbar und fester Mindesthöhe
- **Lösung:** AutoResizeTextarea Komponente mit dynamischer Höhenberechnung
- **Implementation:** `src/components/ui/AutoResizeTextarea.tsx`
- **Behavior:** Wächst mit Inhalt, keine Scrollbar, min-height 24px für Single-Line

### 9.2 Grid Layout Pattern
- **Problem:** Blöcke können nur untereinander, nicht nebeneinander
- **Lösung:** Layout-Property auf Blöcken (`layout: "grid" | "default"`)
- **Implementation:** `groupBlocksForLayout()` in Editor.tsx
- **Behavior:** Aufeinanderfolgende Grid-Blöcke werden in 2-Spalten-Grid gerendert
- **UI:** "Add grid block" Button in Editor Toolbar

### 9.3 Toolbar Hover Pattern
- **Problem:** Toolbar verschwindet wenn Maus vom Block zur Toolbar bewegt wird
- **Lösung:** `onMouseEnter` auf Toolbar-Elementen behält Hover-State
- **Implementation:** BlockRenderer.tsx sideToolbar und top toolbar
- **Behavior:** Toolbar bleibt sichtbar bei Mouse-Over
- **Technical Details:** 
  - sideToolbar: positioniert bei `-left-10`, z-index 50
  - top toolbar: positioniert bei `-top-6`, z-index 10
  - Beide verwenden `onMouseEnter` um Hover-State zu behalten

### 9.4 Seamless Block Design Pattern
- **Ziel:** Notion-like seamless Design ohne sichtbare Rahmen
- **Implementation:** 
  - Text-Blöcke: `bg-transparent` statt `bg-white`
  - Keine `border` Klassen auf Text-Elementen
  - Nur `outline-none` für Fokus-State
- **Resultat:** Blöcke verschmelzen visuell mit dem Hintergrund

### 9.5 Code Block Error Handling Pattern
- **Implementation:** try-catch bei Clipboard-Operationen
- **Pattern:** Leerer catch-Block (kein Console.error)
- **Reasoning:** Clipboard-Fehler sind nicht kritisch, keine User-Benachrichtigung nötig

## 10. Block Components (12 Core Blocks)

OpenDocs includes 12 specialized block components for various use cases:

### 10.1 Core Block Registry

| Block | File | Purpose | Status |
|-------|------|---------|--------|
| **TableBlock** | `src/components/blocks/TableBlock.ts` | Data tables with sorting/filtering | ✅ Migrated |
| **DatabaseBlock** | `src/components/blocks/DatabaseBlock.ts` | Database connection management | ✅ Migrated |
| **N8NBlock** | `src/components/blocks/N8NBlock.ts` | n8n workflow integration | ✅ Migrated |
| **CodeBlock** | `src/components/blocks/CodeBlock.ts` | Code editor with syntax highlighting | ✅ Migrated |
| **DrawBlock** | `src/components/blocks/DrawBlock.ts` | Canvas drawing component | ✅ Migrated |
| **CaptchaWidget** | `src/components/blocks/CaptchaWidget.ts` | CAPTCHA solving widget | ✅ Migrated |
| **CaptchaWorkerPanel** | `src/components/blocks/CaptchaWorkerPanel.ts` | Worker management panel | ✅ Migrated |
| **CaptchaDashboard** | `src/components/blocks/CaptchaDashboard.ts` | CAPTCHA statistics dashboard | ✅ Migrated |
| **ChatPanel** | `src/components/blocks/ChatPanel.ts` | AI chat interface | ✅ Migrated |
| **RightSidebarAIChat** | `src/components/blocks/RightSidebarAIChat.ts` | Sidebar chat component | ✅ Migrated |
| **HealthDashboard** | `src/components/blocks/HealthDashboard.ts` | System health monitoring | ✅ Migrated |
| **EarningsTracker** | `src/components/blocks/EarningsTracker.ts` | Earnings tracking panel | ✅ Migrated |

### 10.2 Block Usage

All blocks are exported from `src/components/blocks/` and can be imported:

```typescript
import { TableBlock } from './components/blocks/TableBlock';
import { N8NBlock } from './components/blocks/N8NBlock';
import { ChatPanel } from './components/blocks/ChatPanel';
```

### 10.3 Block Architecture

- **Pure TypeScript:** All blocks implemented as TypeScript classes
- **DOM-based:** Direct HTMLElement manipulation
- **Self-contained:** Each block manages its own rendering and lifecycle
- **Destroy method:** Proper cleanup via `destroy()` method

---
© 2026 OpenDocs Project. Tier 1 Architecture.
