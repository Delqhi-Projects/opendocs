# OpenDocs

> **Besser als Notion + Linear + Plane.**
> Das Open Source Betriebssystem für Dokumentation, relationale Datenbanken und visuelle Workflows. Gebaut mit Best Practices Februar 2026.

---

## ⚡ Kern-Features (100% Implementiert)

- **AI Prompt Block:** Erstellen Sie komplexe Dokumentations-Strukturen per natürlicher Sprache. Die KI generiert echte Tabellen, Guides und Diagramme direkt im Dokument.
- **Echte Datenbanken:** Datenbank-Blöcke erzeugen automatisch echte Tabellen in Ihrem Supabase/Postgres Backend mit **6 interaktiven Ansichten** (Tabelle, Kanban, Flow, Kalender, Timeline, Galerie).
- **Per-Block AI Agent:** Jeder Block verfügt über einen eigenen KI-Kontext für gezielte Transformationen (Refactor, Summarize, Translate).
- **Visuelle n8n Orchestrierung:** Verbinden und überwachen Sie Automations-Knoten visuell direkt in Ihrem Dokument.
- **Object-Based Whiteboard:** Verschieben Sie Datenbank-Einträge auf einem Graphen; Positionen werden sofort in SQL persistiert.
- **Hard Locks (R2):** Schützen Sie kritische Bereiche vor KI- oder Benutzer-Änderungen.

## 🛠 Setup & Launch

1. **Repository klonen**
2. **Environment konfigurieren** (`.env.example` -> `.env`)
3. **Abhängigkeiten installieren:** `npm install`
4. **Server starten (AI Proxy + DB Sync):** `node server.js`
5. **Frontend starten:** `npm run dev`

## 📘 Dokumentation (Master Plans)

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technisches Herzstück & Schichtenmodell.
- [AGENTS-PLAN.md](./AGENTS-PLAN.md) - Chronologisches Task-System & Session-Log.
- [REQUIREMENTS.md](./REQUIREMENTS.md) - Vollständige Dependency-Liste.
- [API-ENDPOINTS.md](./API-ENDPOINTS.md) - REST API Referenz (n8n, Agent, DB).
- [SUPABASE.md](./SUPABASE.md) - Visueller-Relationaler Daten-Guide.
- [ONBOARDING.md](./ONBOARDING.md) - Einstiegshilfe für Admins & User.

## 🏗 Architektur

OpenDocs nutzt eine **Client-First Architektur** mit einem Express 5 Proxy für KI-Anfragen und direkte Postgres-Provisionierung. Jede Datenbank-Tabelle im Dokument ist eine echte SQL-Tabelle in Ihrer Infrastruktur.

## 🧩 Block Components (12 Core Blocks)

OpenDocs includes 12 specialized block components for various use cases:

### Data & Database Blocks

- **TableBlock** (`src/components/blocks/TableBlock.ts`) - Data tables with sorting and filtering
- **DatabaseBlock** (`src/components/blocks/DatabaseBlock.ts`) - Database connection management

### Workflow & Automation Blocks

- **N8NBlock** (`src/components/blocks/N8NBlock.ts`) - n8n workflow integration and execution
- **CodeBlock** (`src/components/blocks/CodeBlock.ts`) - Code editor with syntax highlighting
- **DrawBlock** (`src/components/blocks/DrawBlock.ts`) - Canvas drawing component

### CAPTCHA & Worker Blocks

- **CaptchaWidget** (`src/components/blocks/CaptchaWidget.ts`) - CAPTCHA solving widget
- **CaptchaWorkerPanel** (`src/components/blocks/CaptchaWorkerPanel.ts`) - Worker management panel
- **CaptchaDashboard** (`src/components/blocks/CaptchaDashboard.ts`) - CAPTCHA statistics dashboard

### Communication & Monitoring Blocks

- **ChatPanel** (`src/components/blocks/ChatPanel.ts`) - AI chat interface
- **RightSidebarAIChat** (`src/components/blocks/RightSidebarAIChat.ts`) - Sidebar chat component
- **HealthDashboard** (`src/components/blocks/HealthDashboard.ts`) - System health monitoring
- **EarningsTracker** (`src/components/blocks/EarningsTracker.ts`) - Earnings tracking panel

### Usage

```typescript
import { TableBlock, N8NBlock, ChatPanel } from "./components/blocks";

const table = new TableBlock("container-id");
const n8n = new N8NBlock("container-id", { n8nUrl: "http://localhost:5678" });
```

---

© 2026 OpenDocs Project. Ready for Enterprise.
