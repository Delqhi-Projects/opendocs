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

---
© 2026 OpenDocs Project. Tier 1 Architecture.
