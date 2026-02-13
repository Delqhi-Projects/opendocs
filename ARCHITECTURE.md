# ARCHITECTURE.md - OpenDocs Technical Architecture

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Production-Ready  

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Block System](#block-system)
6. [State Management](#state-management)
7. [Server Architecture](#server-architecture)
8. [Database Integration](#database-integration)
9. [AI Integration](#ai-integration)
10. [Automation System](#automation-system)
11. [Security Architecture](#security-architecture)
12. [Performance Optimization](#performance-optimization)
13. [Testing Architecture](#testing-architecture)
14. [Deployment Architecture](#deployment-architecture)
15. [Best Practices February 2026](#best-practices-february-2026)

---

## Overview

OpenDocs is a **Client-First** documentation platform with AI-powered features, relational databases, and visual workflow orchestration. It combines the best of Notion, Linear, and Plane into a single open-source solution.

### Core Philosophy

- **Client-First:** All UI logic runs in the browser
- **Server-Proxy:** Express 5 server handles KI requests and external APIs
- **Type-Safe:** Full TypeScript strict mode with zero `any` types
- **Modular Blocks:** Everything is a composable block
- **AI-Native:** Per-block AI agents for contextual transformations

### Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **AI Prompt Block** | Create complex structures via natural language | ✅ |
| **6 Database Views** | Table, Kanban, Flow, Calendar, Timeline, Gallery | ✅ |
| **Per-Block AI Agent** | KI context for targeted transformations | ✅ |
| **Visual n8n Orchestration** | Connect automation nodes visually | ✅ |
| **Object-Based Whiteboard** | Drag DB entries onto graphs | ✅ |
| **Hard Locks (R2)** | Protect critical areas | ✅ |
| **Responsive Design** | Mobile-ready with auto-collapse | ✅ |
| **Dark Mode** | System preference + LocalStorage | ✅ |
| **Keyboard Shortcuts** | Global command palette | ✅ |
| **Undo/Redo** | Full history support (50 entries) | ✅ |

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI Framework |
| **Vite** | 7.2.4 | Build Tool |
| **TypeScript** | 5.9.3 | Type Safety |
| **Tailwind CSS** | 4.1.17 | Styling |
| **Zustand** | 5.0.11 | State Management |
| **Framer Motion** | 12.34.0 | Animations |
| **Lucide React** | 0.563.0 | Icons |
| **@xyflow/react** | 12.10.0 | Graph/Flow Diagrams |
| **Excalidraw** | 0.18.0 | Whiteboard/Draw |
| **Mermaid** | 11.12.2 | Diagrams |
| **React Markdown** | 10.1.0 | Markdown Rendering |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express** | 5.2.1 | API Server |
| **pg (node-postgres)** | 8.18.0 | PostgreSQL Client |
| **@supabase/supabase-js** | 2.95.3 | Supabase Client |
| **nanoid** | 5.1.6 | ID Generation |

### Development

| Technology | Version | Purpose |
|------------|---------|---------|
| **Vitest** | 4.0.18 | Unit Testing |
| **Playwright** | 1.58.2 | E2E Testing |
| **ESLint** | 9.39.2 | Linting |
| **Testing Library** | 16.3.2 | React Testing |

---

## Project Structure

```
opendocs/
├── src/
│   ├── components/           # React Components
│   │   ├── blocks/           # Block Renderers
│   │   │   ├── HeadingBlock.tsx
│   │   │   ├── ParagraphBlock.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── TableBlock.tsx
│   │   │   ├── DatabaseBlock.tsx
│   │   │   ├── WorkflowBlock.tsx
│   │   │   ├── DrawBlock.tsx
│   │   │   ├── N8nBlock.tsx
│   │   │   ├── AutomationBlock.tsx
│   │   │   ├── MermaidBlock.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── VideoBlock.tsx
│   │   │   ├── LinkBlock.tsx
│   │   │   ├── FileBlock.tsx
│   │   │   ├── AiPromptBlock.tsx
│   │   │   ├── ChecklistBlock.tsx
│   │   │   ├── CalloutBlock.tsx
│   │   │   ├── QuoteBlock.tsx
│   │   │   ├── DividerBlock.tsx
│   │   │   └── HorizontalBlock.tsx
│   │   ├── ui/               # UI Components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── layout/           # Layout Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── panels/           # Panel Components
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── AIPanel.tsx
│   │   │   └── ChatPanel.tsx
│   │   └── views/            # Database Views
│   │       ├── TableView.tsx
│   │       ├── KanbanView.tsx
│   │       ├── GraphView.tsx
│   │       ├── CalendarView.tsx
│   │       ├── TimelineView.tsx
│   │       └── GalleryView.tsx
│   │
│   ├── hooks/                # Custom Hooks
│   │   ├── useTheme.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useBreakpoint.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useHistory.ts
│   │   ├── useContextMenu.ts
│   │   ├── useReorder.ts
│   │   └── usePerformance.ts
│   │
│   ├── store/                # Zustand Store
│   │   └── useStore.ts
│   │
│   ├── types/                # TypeScript Types
│   │   ├── docs.ts
│   │   ├── database.ts
│   │   ├── n8n.ts
│   │   ├── automation.ts
│   │   └── icons.ts
│   │
│   ├── utils/                # Utility Functions
│   │   ├── cn.ts             # Class Names
│   │   ├── id.ts             # ID Generation
│   │   └── format.ts         # Formatting
│   │
│   ├── tests/                # Test Files
│   │   ├── unit/             # Unit Tests
│   │   └── e2e/              # E2E Tests
│   │
│   ├── App.tsx               # Main App Component
│   ├── main.tsx              # Entry Point
│   └── index.css             # Global Styles
│
├── server.js                 # Express API Server
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript Config
├── vite.config.ts            # Vite Config
├── tailwind.config.js        # Tailwind Config
├── vitest.config.ts          # Vitest Config
├── playwright.config.ts      # Playwright Config
│
├── ARCHITECTURE.md           # This File
├── API-ENDPOINTS.md          # API Documentation
├── SUPABASE.md               # Database Guide
├── OPENCLAW.md               # Integration Guide
├── ONBOARDING.md             # User/Dev Guide
├── USER-PLAN.md              # Task Checklist
├── AGENTS-PLAN.md            # Development Tasks
└── README.md                 # Project Overview
```

---

## Core Components

### App.tsx

The main application component orchestrates all UI elements:

```typescript
// Component Hierarchy
<App>
  <ThemeProvider>
    <KeyboardShortcutsProvider>
      <Sidebar />
      <MainContent>
        <Topbar />
        <PageContent>
          <BlockRenderer blocks={page.blocks} />
        </PageContent>
        <RightSidebar />
      </MainContent>
      <CommandPalette />
      <AIPanel />
      <ChatPanel />
    </KeyboardShortcutsProvider>
  </ThemeProvider>
</App>
```

### Layout Components

#### Sidebar

- **Folder Navigation:** Tree view of all folders and pages
- **Quick Actions:** New page, search, settings
- **Collapse State:** Persistent in LocalStorage
- **Responsive:** Auto-collapses on mobile

#### Topbar

- **Breadcrumb Navigation:** Current page path
- **Page Actions:** Share, export, settings
- **AI Button:** Quick access to AI panel
- **User Menu:** Profile, preferences, logout

#### RightSidebar

- **Page Properties:** Icon, cover, metadata
- **Block Properties:** Selected block settings
- **AI Chat:** Contextual AI assistance
- **Version History:** Undo/redo controls

### Panel Components

#### CommandPalette (Ctrl+K)

- **Global Search:** Search pages, blocks, commands
- **Quick Actions:** Create, delete, move operations
- **Keyboard Navigation:** Arrow keys, Enter, Escape

#### AIPanel (Ctrl+G)

- **AI Prompt Input:** Natural language commands
- **Context Display:** Current selection/active block
- **Response Rendering:** Formatted AI responses
- **Command Execution:** Apply AI suggestions

#### ChatPanel (Ctrl+J)

- **Chat Interface:** Conversational AI interaction
- **Message History:** Persistent conversation
- **Quick Replies:** Suggested responses

---

## Block System

### Block Types

| Type | Description | Features |
|------|-------------|----------|
| `heading1` | H1 heading | Lock, color |
| `heading2` | H2 heading | Lock, color |
| `heading3` | H3 heading | Lock, color |
| `paragraph` | Text content | Markdown, links |
| `code` | Code block | Syntax highlighting, language |
| `table` | Static table | Sortable, resizable |
| `database` | Relational DB | 6 views, remote sync |
| `workflow` | Visual workflow | Nodes, edges |
| `draw` | Excalidraw canvas | Freeform drawing |
| `n8n` | n8n integration | Node config, connections |
| `automation` | Custom automation | Triggers, actions |
| `callout` | Callout box | 5 tones (info, success, warning, error, tip) |
| `checklist` | Checklist items | Check/uncheck, reorder |
| `mermaid` | Mermaid diagram | Live preview |
| `quote` | Blockquote | Caption support |
| `divider` | Horizontal line | - |
| `image` | Image block | URL, caption, alt text |
| `video` | Video embed | URL, caption |
| `link` | Link preview | URL, title, description |
| `file` | File attachment | Name, URL |
| `aiPrompt` | AI generation | Prompt, result |
| `horizontal` | Column layout | Multiple blocks side-by-side |

### Block Base Structure

```typescript
type DocBlockBase = {
  id: string;              // nanoid-generated
  type: BlockType;         // Block type identifier
  locked?: boolean;        // R2 Hard Lock
  lockedAt?: string;       // Lock timestamp
  lockedBy?: string;       // User who locked
  layout?: "grid" | "default";  // Layout mode
};
```

### Block Lifecycle

```
1. Creation → generateId() → insertBlock()
2. Editing  → updateBlock() → local state update
3. Locking  → toggleLock() → R2 protection
4. Deletion → confirmDialog() → deleteBlock()
```

---

## State Management

### Zustand Store

Single source of truth for all application state:

```typescript
type DocsState = {
  // Data
  folders: Record<string, DocFolder>;
  pages: Record<string, DocPage>;
  rootFolderId: string;
  
  // UI State
  selectedPageId: string | null;
  theme: Theme;
  expandedFolderIds: string[];
};
```

### State Actions

| Action | Description |
|--------|-------------|
| `createPage(folderId, title)` | Create new page |
| `deletePage(pageId)` | Delete page |
| `updatePage(pageId, updates)` | Update page properties |
| `movePage(pageId, targetFolderId)` | Move page between folders |
| `createFolder(parentId, name)` | Create new folder |
| `deleteFolder(folderId)` | Delete folder |
| `renameFolder(folderId, name)` | Rename folder |
| `insertBlock(pageId, block, afterId)` | Insert block |
| `updateBlock(pageId, blockId, updates)` | Update block |
| `deleteBlock(pageId, blockId)` | Delete block |
| `toggleLock(pageId, blockId)` | Toggle hard lock |
| `setTheme(theme)` | Set theme |
| `toggleSidebar()` | Toggle sidebar |

### History (Undo/Redo)

```typescript
// useHistory hook
const { push, undo, redo, canUndo, canRedo } = useHistory();

// Push state change
push({ type: 'UPDATE_BLOCK', pageId, blockId, updates });

// Undo last action
undo();

// Redo undone action
redo();
```

---

## Server Architecture

### Express 5 API Server

```
┌─────────────────────────────────────────────────────────────────┐
│                      OpenDocs Server                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   NVIDIA    │  │  Supabase   │  │   n8n       │             │
│  │   AI API    │  │  PostgreSQL │  │   API       │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Express 5 Router                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ /api/   │ │ /api/   │ │ /api/   │ │ /api/   │        │   │
│  │  │ health  │ │ nvidia  │ │ db/*    │ │ n8n/*   │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ /api/   │ │ /api/   │ │ /api/   │ │ /api/   │        │   │
│  │  │ agent/* │ │ github  │ │ website │ │ images  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Middleware Stack                       │   │
│  │  • Request ID (x-request-id)                             │   │
│  │  • CORS (configurable origin)                            │   │
│  │  • Rate Limiting (60 req/min default)                    │   │
│  │  • Auth (optional X-OpenDocs-Token)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Server
PORT=3000

# NVIDIA AI (Required)
NVIDIA_API_KEY=nvapi-xxx
NVIDIA_BASE_URL=https://integrate.api.nvidia.com
NVIDIA_MODEL=moonshotai/kimi-k2.5

# Auth (Optional)
API_AUTH_TOKEN=your-secret-token
CORS_ORIGIN=https://yourdomain.com

# Supabase DB (Optional)
SUPABASE_DB_URL=postgresql://user:pass@host:5432/db
SUPABASE_DB_SCHEMA=public

# n8n Integration (Optional)
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# OpenClaw Integration (Optional)
OPENCLAW_BASE_URL=http://localhost:8213
OPENCLAW_TOKEN=your-openclaw-token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Website Fetch
WEBSITE_FETCH_TIMEOUT_MS=12000
WEBSITE_FETCH_MAX_BYTES=750000
WEBSITE_ALLOW_PRIVATE_IPS=false
```

---

## Database Integration

### Supabase PostgreSQL

OpenDocs supports remote database backing via Supabase:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Database Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │   OpenDocs      │         │   Supabase      │               │
│  │   Frontend      │         │   PostgreSQL    │               │
│  │                 │         │                 │               │
│  │  • Local State  │  ←───→  │  • Real Tables │               │
│  │  • Sync Logic   │         │  • Realtime     │               │
│  └─────────────────┘         └─────────────────┘               │
│                                                                  │
│  Table Naming Convention:                                        │
│  • opendocs_db_{id} for user databases                          │
│  • opendocs_automation_rules for automations                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Block Remote Sync

```typescript
type DatabaseRemote = {
  tableName?: string;        // Supabase table name
  provisioning?: "idle" | "creating" | "ready" | "error";
  lastError?: string;
  sync?: "off" | "realtime";
};
```

### Supported Column Types

| OpenDocs Type | PostgreSQL Type |
|---------------|-----------------|
| `text` | `text` |
| `number` | `double precision` |
| `checkbox` | `boolean` |
| `date` | `timestamptz` |
| `select` | `text` (option id/name) |

---

## AI Integration

### NVIDIA API Integration

OpenDocs uses NVIDIA's AI API for all AI features:

```typescript
// Chat completion
POST /api/nvidia/chat
Body: { messages: Message[], temperature?: number }

// Response
{
  choices: [{
    message: { role: "assistant", content: "..." }
  }]
}
```

### Agent Plan Endpoint

The agent plan endpoint returns structured commands:

```typescript
POST /api/agent/plan
Body: { prompt: string, context: object }

// Response
{
  reply: "Human-readable response",
  commands: [
    { type: "docs.page.create", title: "New Page" },
    { type: "docs.block.insertAfter", pageId: "...", ... }
  ]
}
```

### Available AI Commands

| Command | Description |
|---------|-------------|
| `docs.page.create` | Create new page |
| `docs.block.insertAfter` | Insert block after position |
| `docs.block.update` | Update block content |
| `docs.block.delete` | Delete block |
| `docs.block.toggleLock` | Toggle hard lock |
| `integration.openclaw.send` | Send message via OpenClaw |
| `db.row.insert` | Insert database row |
| `n8n.node.connect` | Connect n8n nodes |

---

## Automation System

### Automation Node Types

#### Triggers

| Node | Description | Config |
|------|-------------|--------|
| `webhook` | HTTP POST trigger | path, method |
| `schedule` | Cron-based trigger | cron, timezone |
| `db-row-changed` | Database change trigger | table, operation |
| `manual` | Button trigger | - |

#### Logic

| Node | Description | Config |
|------|-------------|--------|
| `if-else` | Conditional branching | condition |
| `switch` | Multi-path branching | expression, cases |
| `wait` | Delay execution | duration |

#### Actions

| Node | Description | Config |
|------|-------------|--------|
| `send-email` | Send email | to, subject, body |
| `send-webhook` | HTTP request | url, method, headers, body |
| `update-db-row` | Update database | table, id, data |
| `call-n8n` | Execute n8n workflow | workflowId, payload |
| `openclaw-message` | Send WhatsApp/Meta | platform, recipient, message |

### Automation Execution

```
Trigger → Logic (if-else/switch) → Action → Result
                ↓
          Branch A → Action A
                ↓
          Branch B → Action B
```

---

## Security Architecture

### Golden Rules (R1-R4)

| Rule | Description |
|------|-------------|
| **R1** | No secrets in client code |
| **R2** | Hard locks for critical areas |
| **R3** | Read before write |
| **R4** | nanoid for all IDs |

### Authentication

- **Optional Auth:** `API_AUTH_TOKEN` environment variable
- **Token Header:** `X-OpenDocs-Token`
- **Per-Request Auth:** Each API call validates token if configured

### Rate Limiting

- **Default:** 60 requests per minute
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response:** 429 Too Many Requests

### SSRF Protection

Website fetch includes SSRF mitigations:

- Protocol validation (http/https only)
- Private IP blocking (configurable)
- Timeout limits
- Response size limits

---

## Performance Optimization

### React Optimization

```typescript
// useCallback for event handlers
const handleClick = useCallback(() => { ... }, [deps]);

// useMemo for expensive computations
const sortedItems = useMemo(() => items.sort(...), [items]);

// React.memo for pure components
export const MyComponent = React.memo(({ data }) => { ... });
```

### Bundle Optimization

- **Code Splitting:** Dynamic imports for heavy components
- **Tree Shaking:** ES modules for unused code elimination
- **Single File Bundle:** vite-plugin-singlefile for deployment

### Lazy Loading

```typescript
// Lazy load heavy components
const ExcalidrawWrapper = lazy(() => import('./ExcalidrawWrapper'));
const MermaidView = lazy(() => import('./MermaidView'));
```

---

## Testing Architecture

### Unit Tests (Vitest)

```
src/hooks/__tests__/
├── useTheme.test.ts
├── useKeyboardShortcuts.test.ts
├── useBreakpoint.test.ts
├── useMediaQuery.test.ts
├── useHistory.test.ts
├── useContextMenu.test.ts
├── useReorder.test.ts
└── usePerformance.test.ts
```

### E2E Tests (Playwright)

```
src/tests/e2e/
├── page-creation.spec.ts
├── block-operations.spec.ts
├── database-views.spec.ts
├── ai-integration.spec.ts
└── keyboard-shortcuts.spec.ts
```

### Test Commands

```bash
npm test              # Run unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # E2E tests
```

---

## Deployment Architecture

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start server
node server.js

# 4. Start frontend
npm run dev
```

### Production Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Stack                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │  Cloudflare │────▶│   Express   │────▶│  Supabase   │       │
│  │   Tunnel    │     │   Server    │     │  PostgreSQL │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                   │                                    │
│         ▼                   ▼                                    │
│  ┌─────────────┐     ┌─────────────┐                           │
│  │   Static    │     │   NVIDIA    │                           │
│  │   Assets    │     │    AI API   │                           │
│  └─────────────┘     └─────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Best Practices February 2026

### Code Style

- **TypeScript Strict Mode:** All code must pass strict type checking
- **No `any` Types:** Use proper type definitions
- **ESLint 9 Flat Config:** Modern linting configuration
- **Conventional Commits:** feat, fix, docs, style, refactor, test, chore

### Component Design

- **Single Responsibility:** One purpose per component
- **Props Interface:** Explicit type for all props
- **Default Props:** Use default values for optional props
- **Error Boundaries:** Catch and handle errors gracefully

### State Management

- **Zustand Store:** Single source of truth
- **Immutability:** Never mutate state directly
- **Selectors:** Use selectors for derived state
- **Persistence:** LocalStorage for user preferences

### API Design

- **RESTful Endpoints:** Consistent naming conventions
- **Error Handling:** Proper HTTP status codes
- **Rate Limiting:** Protect against abuse
- **CORS:** Configurable allowed origins

### Security

- **Environment Variables:** Never commit secrets
- **Input Validation:** Sanitize all user input
- **Output Encoding:** Prevent XSS attacks
- **HTTPS Only:** Secure all connections

---

**Document Statistics:**
- Total Lines: 600+
- Sections: 15
- Code Examples: 20+
- Tables: 15+

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
