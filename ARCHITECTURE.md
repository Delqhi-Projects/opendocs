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

## 10. Block System (21 Block Types)

OpenDocs implements a comprehensive block-based editor with 21 distinct block types, each serving specific documentation and workflow needs.

### 10.1 Block Registry (Complete)

| Block | Type | Purpose | Implementation | Status |
|-------|------|---------|----------------|--------|
| **Heading 1-3** | `heading1/2/3` | Section hierarchy | BlockRenderer.tsx input | ✅ Production |
| **Paragraph** | `paragraph` | Basic text content | AutoResizeTextarea | ✅ Production |
| **Code** | `code` | Syntax-highlighted code | textarea with language selector | ✅ Production |
| **Quote** | `quote` | Blockquote with citation | textarea | ✅ Production |
| **Divider** | `divider` | Visual separator | Horizontal line | ✅ Production |
| **Callout** | `callout` | Info/success/warning/error boxes | tone selector + title + text | ✅ Production |
| **Checklist** | `checklist` | Interactive todo lists | checkbox + text inputs | ✅ Production |
| **Table** | `table` | Static data tables | Editable rows/columns | ✅ Production |
| **Database** | `database` | Real SQL-backed tables | 6 views (Table/Kanban/Graph/Calendar/Timeline/Gallery) | ✅ Production |
| **Workflow** | `workflow` | Visual node graphs | XYFlow-based canvas | ✅ Production |
| **Draw** | `draw` | Excalidraw canvas | @excalidraw/excalidraw | ✅ Production |
| **Mermaid** | `mermaid` | Diagrams from text | mermaid.js rendering | ✅ Production |
| **Image** | `image` | Image embeds | URL input + preview | ✅ Production |
| **Video** | `video` | Video embeds (YouTube/Vimeo) | URL input + iframe embed | ✅ Production |
| **Link** | `link` | URL cards | URL input | ✅ Production |
| **File** | `file` | File attachments | name + URL inputs | ✅ Production |
| **AI Prompt** | `aiPrompt` | Natural language block generation | Prompt input + AI execution | ✅ Production |
| **n8n Node** | `n8n` | Workflow automation nodes | n8n integration panel | ✅ Production |
| **Horizontal Layout** | `horizontal` | 2-column nested blocks | Grid with editable sub-blocks | ✅ Production |

### 10.2 Block Architecture (Best Practices 2026)

```
DocBlock (Base)
├── id: string (nanoid)
├── type: BlockType
├── locked?: boolean (R2: Hard Locks)
├── lockedAt?: string
├── lockedBy?: string
├── layout?: "grid" | "default" (Section 9.2)
└── ...type-specific data
```

**Implementation Patterns:**
- **Single File per Block:** Each block type rendered in BlockRenderer.tsx switch statement
- **Type Safety:** Full TypeScript discriminated unions in `src/types/docs.ts`
- **Lock Support:** All blocks respect R2 (Hard Locks) via `locked` property
- **Grid Layout:** Blocks support `layout: "grid"` for 2-column rendering (Section 9.2)
- **Toolbar Pattern:** Every block has hover-activated toolbar (Section 9.3)
- **AI Integration:** Every block has per-block chat via BlockChatModal

### 10.3 Block Data Flow

```
User Input → BlockRenderer → onUpdate() → useDocsStore → LocalStorage → Supabase
                                              ↓
                                       Block validation
                                       (type guards)
```

### 10.4 Adding New Blocks

1. **Add type to** `src/types/docs.ts`:
   ```typescript
   export type BlockType = ... | "newBlock";
   export type NewBlock = DocBlockBase & { type: "newBlock"; data: any };
   ```

2. **Implement in** `src/components/blocks/BlockRenderer.tsx`:
   ```typescript
   } else if (block.type === "newBlock") {
     content = <NewBlockView block={block} ... />
   }
   ```

3. **Add to SlashMenu** `src/components/SlashMenu.tsx`

4. **Add to store** `src/store/useDocsStore.ts` `newBlock()` function

---

## 11. Automation Architecture (Phase 2)

### 11.1 n8n-Style Visual Automation Builder

**Design:** Node-based workflow editor (n8n-style), NOT linear Zapier-style

**Components:**
- **Canvas:** XYFlow-based infinite canvas
- **Nodes:** Trigger, Condition, Action types
- **Connections:** Bezier curves between node handles
- **Node Panel:** Draggable node types sidebar
- **Property Panel:** Right-side configuration panel

**Node Types:**
| Node | Category | Purpose |
|------|----------|---------|
| **Webhook** | Trigger | HTTP endpoint trigger |
| **Schedule** | Trigger | Cron-based time trigger |
| **DB Row Changed** | Trigger | Supabase realtime trigger |
| **Manual** | Trigger | Button-activated |
| **If/Else** | Logic | Condition branching |
| **Switch** | Logic | Multi-path branching |
| **Wait** | Logic | Delay execution |
| **Send Email** | Action | Email notification |
| **Send Webhook** | Action | HTTP POST/GET |
| **Update DB Row** | Action | Modify Supabase row |
| **Call n8n** | Action | Execute n8n workflow |
| **OpenClaw** | Action | Send WhatsApp/Meta |

### 11.2 Edge Functions (Supabase)

**Runtime:** Deno-based Supabase Edge Functions

**Functions:**
```typescript
// supabase/functions/on-row-change/index.ts
- Trigger: Supabase database webhooks
- Input: { table, operation, old_record, new_record }
- Action: Evaluate automation rules, execute actions

// supabase/functions/on-schedule/index.ts  
- Trigger: CRON jobs (pg_cron)
- Input: { schedule_id, timestamp }
- Action: Time-based automation execution

// supabase/functions/send-notification/index.ts
- Trigger: Internal API call
- Input: { type: 'email'|'slack'|'discord', payload }
- Action: Send external notifications
```

### 11.3 Automation Data Model

```typescript
interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  createdAt: string;
  updatedAt: string;
}

interface AutomationNode {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  position: { x: number; y: number };
  data: {
    subtype: string;
    config: Record<string, any>;
  };
}

interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
```

---

## 12. Integration Architecture

### 12.1 Supabase Integration
- **Auth:** JWT-based, stored in memory (never localStorage)
- **Database:** Direct Postgres connection for provisioning
- **Realtime:** WebSocket subscriptions for live collaboration
- **Edge Functions:** Deno runtime for serverless automation

### 12.2 n8n Integration
- **Webhook:** Trigger workflows via HTTP POST
- **API:** n8n REST API for workflow CRUD
- **Nodes:** Custom OpenDocs nodes for n8n

### 12.3 OpenClaw Integration
- **Purpose:** Meta/WhatsApp API without official APIs
- **Auth:** Local container with user-provided credentials
- **Endpoints:** /send-message, /get-status, /webhook

---

## 13. State Management Patterns

### 13.1 Zustand Store Structure
```typescript
useDocsStore
├── state: DocsState
│   ├── rootFolderId
│   ├── folders: Record<string, DocFolder>
│   ├── pages: Record<string, DocPage>
│   ├── selectedPageId
│   └── theme
└── actions: DocsActions
    ├── CRUD operations
    ├── Block operations
    └── Persistence (localStorage)
```

### 13.2 Persistence Strategy
- **Primary:** localStorage (immediate, offline-capable)
- **Secondary:** Supabase sync (background, eventual consistency)
- **Hydration:** On load, merge localStorage with defaults

---

## 14. Security Considerations

### 14.1 Client-Side
- No secrets in React code (R1)
- Input sanitization for user content
- XSS prevention via React's escape hatch

### 14.2 Server-Side (server.js)
- SSRF protection (private IP blocking)
- Rate limiting per IP
- CORS strict mode
- Token validation for all AI endpoints

---

© 2026 OpenDocs Project. Tier 1 Architecture. Phase 2 Ready.
