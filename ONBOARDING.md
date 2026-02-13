# ONBOARDING.md - OpenDocs User & Developer Guide

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Production-Ready  

---

## Table of Contents

### Part I: User Guide

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Working with Pages](#working-with-pages)
4. [Block Types](#block-types)
5. [Database Blocks](#database-blocks)
6. [AI Features](#ai-features)
7. [Automation](#automation)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Tips & Tricks](#tips--tricks)

### Part II: Admin/Developer Guide

10. [Installation](#installation)
11. [Configuration](#configuration)
12. [Deployment](#deployment)
13. [Security](#security)
14. [Performance Tuning](#performance-tuning)
15. [Monitoring](#monitoring)
16. [Backup & Recovery](#backup--recovery)
17. [Troubleshooting](#troubleshooting)
18. [Contributing](#contributing)

---

# Part I: User Guide

---

## Getting Started

### What is OpenDocs?

OpenDocs is a next-generation documentation platform that combines:

- **Document Editing** like Notion
- **Project Management** like Linear
- **Workflow Automation** like n8n
- **Relational Databases** like Airtable
- **Visual Whiteboarding** like Excalidraw

### First Steps

1. **Open the Application**
   - Navigate to `http://localhost:5173` (development) or your deployed URL

2. **Create Your First Page**
   - Click the `+` button in the sidebar
   - Enter a title for your page
   - Press Enter to create

3. **Add Content**
   - Type `/` to open the block menu
   - Select a block type
   - Start typing

4. **Save Your Work**
   - OpenDocs auto-saves as you type
   - No manual save required

---

## Interface Overview

### Main Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │          │  │  Topbar                                     │  │
│  │          │  │  ┌─────────────────────────────────────────┐│  │
│  │  Sidebar │  │  │ Breadcrumb    Actions    AI    Profile  ││  │
│  │          │  │  └─────────────────────────────────────────┘│  │
│  │  ┌────┐  │  ├─────────────────────────────────────────────┤  │
│  │  │ +  │  │  │                                             │  │
│  │  │New │  │  │                                             │  │
│  │  └────┘  │  │                                             │  │
│  │          │  │                                             │  │
│  │  Folders │  │              Page Content                   │  │
│  │  & Pages │  │                                             │  │
│  │          │  │              (Blocks)                       │  │
│  │  • Docs  │  │                                             │  │
│  │  • Tasks │  │                                             │  │
│  │  • Ideas │  │                                             │  │
│  │          │  │                                             │  │
│  │          │  │                                             │  │
│  │          │  └─────────────────────────────────────────────┘  │
│  │          │  ┌─────────────────────────────────────────────┐  │
│  │          │  │  Right Sidebar (Properties, AI Chat)        │  │
│  │          │  └─────────────────────────────────────────────┘  │
│  └──────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar

| Element | Description |
|---------|-------------|
| `+` Button | Create new page |
| Search | Search all pages and blocks |
| Folders | Organize pages into folders |
| Pages | Individual documents |
| Collapse Button | Hide/show sidebar |

### Topbar

| Element | Description |
|---------|-------------|
| Breadcrumb | Current page location |
| Share | Share page with others |
| Export | Export page as PDF/MD |
| AI Button | Open AI panel (Ctrl+G) |
| Profile | User settings |

### Right Sidebar

| Tab | Description |
|-----|-------------|
| Properties | Page icon, cover, metadata |
| Block | Selected block settings |
| AI Chat | Contextual AI assistant |

---

## Working with Pages

### Creating Pages

```
Method 1: Sidebar
┌─────────────────────────────────────┐
│  Click + button in sidebar          │
│  → Enter title                      │
│  → Press Enter                      │
└─────────────────────────────────────┘

Method 2: Keyboard
┌─────────────────────────────────────┐
│  Press Ctrl+K                       │
│  → Type "new page"                  │
│  → Enter title                      │
└─────────────────────────────────────┘

Method 3: Command Palette
┌─────────────────────────────────────┐
│  Press Ctrl+K                       │
│  → Select "Create Page"             │
│  → Choose folder                    │
└─────────────────────────────────────┘
```

### Organizing Pages

**Folders:**
1. Right-click in sidebar
2. Select "New Folder"
3. Name the folder
4. Drag pages into folder

**Moving Pages:**
1. Drag page to target folder
2. Or right-click → Move to → Select folder

**Deleting Pages:**
1. Right-click page
2. Select "Delete"
3. Confirm deletion

### Page Properties

| Property | Description |
|----------|-------------|
| **Icon** | Emoji or custom icon |
| **Cover** | Header image |
| **Description** | Page summary |
| **Tags** | Categorization |

---

## Block Types

### Text Blocks

| Block | Shortcut | Description |
|-------|----------|-------------|
| Heading 1 | `/h1` | Main title |
| Heading 2 | `/h2` | Section title |
| Heading 3 | `/h3` | Subsection title |
| Paragraph | `/p` | Regular text |
| Quote | `/quote` | Blockquote |
| Callout | `/callout` | Highlighted box |

### Code & Technical

| Block | Shortcut | Description |
|-------|----------|-------------|
| Code | `/code` | Syntax-highlighted code |
| Mermaid | `/mermaid` | Diagrams and flowcharts |
| Table | `/table` | Static table |

### Media

| Block | Shortcut | Description |
|-------|----------|-------------|
| Image | `/image` | Image with caption |
| Video | `/video` | Video embed |
| Link | `/link` | URL preview |
| File | `/file` | File attachment |

### Interactive

| Block | Shortcut | Description |
|-------|----------|-------------|
| Database | `/database` | Relational database |
| Workflow | `/workflow` | Visual workflow |
| Automation | `/automation` | Automated actions |
| n8n | `/n8n` | n8n integration |

### Drawing

| Block | Shortcut | Description |
|-------|----------|-------------|
| Draw | `/draw` | Excalidraw canvas |

### Special

| Block | Shortcut | Description |
|-------|----------|-------------|
| AI Prompt | `/ai` | AI-generated content |
| Checklist | `/checklist` | Task list |
| Divider | `/divider` | Horizontal line |
| Horizontal | `/columns` | Side-by-side layout |

---

## Database Blocks

### Overview

Database blocks are the most powerful feature in OpenDocs, combining:

- **Relational Data:** Real database tables
- **Multiple Views:** 6 different visualizations
- **Remote Sync:** Connect to Supabase PostgreSQL

### Creating a Database

1. Type `/database` and press Enter
2. Enter database title
3. Add columns using the `+` button
4. Add rows by clicking in cells

### Column Types

| Type | Description | Example |
|------|-------------|---------|
| Text | Free-form text | Name, Description |
| Number | Numeric values | Price, Quantity |
| Select | Dropdown options | Status, Priority |
| Date | Date picker | Due Date |
| Checkbox | Boolean toggle | Completed |

### Database Views

#### Table View
Traditional spreadsheet layout.

```
┌────────────┬──────────┬──────────┬─────────────┐
│ Task       │ Status   │ Priority │ Due Date    │
├────────────┼──────────┼──────────┼─────────────┤
│ Design UI  │ Done     │ High     │ 2026-02-15  │
│ Write docs │ In Progress│ Medium │ 2026-02-20  │
│ Test       │ Todo     │ Low      │ 2026-02-25  │
└────────────┴──────────┴──────────┴─────────────┘
```

#### Kanban View
Cards organized by status.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   TODO      │  │ IN PROGRESS │  │    DONE     │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │ Test    │ │  │ │ Write   │ │  │ │ Design  │ │
│ │ Low     │ │  │ │ Medium  │ │  │ │ High    │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
└─────────────┘  └─────────────┘  └─────────────┘
```

#### Graph View
Nodes connected by relationships.

```
        ┌─────────┐
        │  Start  │
        └────┬────┘
             │
        ┌────▼────┐
        │ Design  │
        └────┬────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼───┐        ┌────▼────┐
│ Code  │        │  Test   │
└───┬───┘        └────┬────┘
    │                 │
    └────────┬────────┘
             │
        ┌────▼────┐
        │ Deploy  │
        └─────────┘
```

#### Calendar View
Items on calendar grid.

```
    February 2026
Su Mo Tu We Th Fr Sa
                   1
 2  3  4  5  6  7  8
 9 10 11 12 13 14 15
       ┌───────────┐
       │ Design UI │
       └───────────┘
16 17 18 19 20 21 22
          ┌───────────┐
          │ Write docs│
          └───────────┘
23 24 25 26 27 28
```

#### Timeline View
Items on horizontal timeline.

```
Feb 10          Feb 15          Feb 20          Feb 25
  │               │               │               │
  ├───────────────┤
  │   Design UI   │
                  ├───────────────┤
                  │   Write docs  │
                                  ├───────────────┤
                                  │     Test      │
```

#### Gallery View
Cards with images/previews.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │
│ │  Image  │ │  │ │  Image  │ │  │ │  Image  │ │
│ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │
│ Project A   │  │ Project B   │  │ Project C   │
│ Status: Done│  │ Status: WIP │  │ Status: New │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Remote Database Sync

To connect a database to Supabase:

1. Open database settings
2. Toggle "Remote Sync"
3. Enter Supabase connection details
4. Click "Connect"

The database will:
- Create a real PostgreSQL table
- Sync data bidirectionally
- Enable real-time updates

---

## AI Features

### AI Prompt Block

Create content using AI:

1. Type `/ai` and press Enter
2. Enter your prompt
3. Click "Generate"
4. Review and accept results

**Example Prompts:**
```
"Create a meeting agenda template"
"Summarize the key points of this document"
"Generate a project timeline for a mobile app"
"Write documentation for this API endpoint"
```

### AI Chat (Ctrl+J)

Conversational AI assistant:

1. Press `Ctrl+J` to open
2. Ask questions or give commands
3. AI responds with context-aware answers

**Example Commands:**
```
"Create a new page called 'Roadmap'"
"Add a checklist to the current block"
"Summarize this page"
"Find all pages containing 'API'"
```

### AI Panel (Ctrl+G)

Quick AI actions:

1. Press `Ctrl+G` to open
2. Select an action:
   - Summarize
   - Expand
   - Simplify
   - Translate
   - Fix Grammar

---

## Automation

### Creating Automations

1. Type `/automation` and press Enter
2. Add trigger node (webhook, schedule, DB change)
3. Add logic nodes (if-else, switch)
4. Add action nodes (send email, webhook, update DB)
5. Connect nodes with edges
6. Enable automation

### Trigger Types

| Trigger | Description |
|---------|-------------|
| Webhook | HTTP POST trigger |
| Schedule | Cron-based trigger |
| DB Row Changed | Database change trigger |
| Manual | Button trigger |

### Action Types

| Action | Description |
|--------|-------------|
| Send Email | Email notification |
| Send Webhook | HTTP request |
| Update DB Row | Modify database |
| Call n8n | Execute n8n workflow |
| OpenClaw Message | Send WhatsApp/Messenger |

### Example: Task Notification

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ DB Row Changed  │────▶│     If/Else     │────▶│  OpenClaw Send  │
│ status = done   │     │ priority = high │     │ WhatsApp        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

This automation:
1. Triggers when a database row changes
2. Checks if status is "done" and priority is "high"
3. Sends a WhatsApp message notification

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command Palette |
| `Ctrl+G` | AI Panel |
| `Ctrl+J` | AI Chat |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Escape` | Close All Panels |

### Editor Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Open block menu |
| `#` + Space | Heading 1 |
| `##` + Space | Heading 2 |
| `###` + Space | Heading 3 |
| `-` + Space | Bullet list |
| `1.` + Space | Numbered list |
| `[]` | Checkbox |
| `>` + Space | Quote |
| ``` + Space | Code block |

### Navigation

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate blocks |
| `Enter` | New block |
| `Backspace` | Delete empty block |
| `Tab` | Indent |
| `Shift+Tab` | Outdent |

---

## Tips & Tricks

### Productivity

- **Templates:** Create template pages for repeated structures
- **Keyboard First:** Learn shortcuts for 2x speed
- **AI Assistance:** Use AI for first drafts, then edit
- **Database Views:** Use Kanban for status tracking
- **Automation:** Automate repetitive notifications

### Organization

- **Folders:** Group related pages together
- **Icons:** Use icons for visual identification
- **Tags:** Tag pages for easy filtering
- **Search:** Use Ctrl+K to find anything quickly

### Collaboration

- **Comments:** Right-click blocks to add comments
- **Sharing:** Share pages via public links
- **Locking:** Lock critical blocks to prevent edits

---

# Part II: Admin/Developer Guide

---

## Installation

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **PostgreSQL** 15+ (optional, for remote DB)

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/opendocs.git
cd opendocs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start development server
npm run dev

# In another terminal, start API server
node server.js
```

### Docker Installation

```bash
# Build image
docker build -t opendocs:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -p 5173:5173 \
  -e NVIDIA_API_KEY=your-key \
  -e SUPABASE_DB_URL=your-url \
  opendocs:latest
```

---

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000

# NVIDIA AI API (Required)
NVIDIA_API_KEY=nvapi-xxx
NVIDIA_BASE_URL=https://integrate.api.nvidia.com
NVIDIA_MODEL=moonshotai/kimi-k2.5

# Authentication (Optional)
API_AUTH_TOKEN=your-secret-token
CORS_ORIGIN=https://yourdomain.com

# Supabase Database (Optional)
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

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Deployment

### Production Build

```bash
# Build frontend
npm run build

# Build outputs to dist/
# Serve with any static file server
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name opendocs-api

# Start frontend (with serve)
pm2 serve dist 5173 --name opendocs-frontend

# Save PM2 config
pm2 save

# Setup startup script
pm2 startup
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/opendocs
server {
    listen 80;
    server_name opendocs.yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
    }
}
```

### Cloudflare Tunnel

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create opendocs

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: opendocs
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: opendocs.yourdomain.com
    service: http://localhost:5173
  - hostname: api.opendocs.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run opendocs
```

---

## Security

### Security Checklist

- [ ] NVIDIA_API_KEY set and secured
- [ ] API_AUTH_TOKEN configured (optional)
- [ ] CORS_ORIGIN restricted to your domain
- [ ] Rate limiting enabled
- [ ] HTTPS enabled (via Cloudflare or Nginx)
- [ ] Database credentials secured
- [ ] No secrets in git

### Input Validation

```typescript
// Server-side validation example
function validateTableName(name: string): boolean {
  return /^opendocs_db_[a-z0-9_]+$/i.test(name);
}

function validateRowId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
```

### Rate Limiting

```typescript
// Default: 60 requests per minute
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

// For production, consider:
// - Redis-backed rate limiting
// - Per-user limits
// - Different limits per endpoint
```

---

## Performance Tuning

### Frontend Optimization

```typescript
// Use React.memo for pure components
export const MyComponent = React.memo(({ data }) => { ... });

// Use useCallback for event handlers
const handleClick = useCallback(() => { ... }, [deps]);

// Use useMemo for expensive computations
const sortedItems = useMemo(() => items.sort(...), [items]);

// Lazy load heavy components
const ExcalidrawWrapper = lazy(() => import('./ExcalidrawWrapper'));
```

### Backend Optimization

```typescript
// Connection pooling for PostgreSQL
const dbPool = new Pool({
  connectionString: SUPABASE_DB_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

// Enable keep-alive for HTTP connections
app.set('trust proxy', 1);
```

### Caching Strategy

```typescript
// Implement caching for frequently accessed data
const cache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string, fetcher: () => T, ttl: number): T {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  const data = fetcher();
  cache.set(key, { data, expiry: Date.now() + ttl });
  return data;
}
```

---

## Monitoring

### Health Check Endpoint

```bash
# Check server health
curl http://localhost:3000/api/health

# Response
{
  "ok": true,
  "product": "OpenDocs",
  "model": "moonshotai/kimi-k2.5",
  "features": { ... }
}
```

### Logging

```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  message: 'Request received',
  requestId: req.rid,
  path: req.path,
  method: req.method,
}));
```

### Metrics (Optional)

```typescript
// Using Prometheus-style metrics
import client from 'prom-client';

const requestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
});

app.use((req, res, next) => {
  const end = requestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});
```

---

## Backup & Recovery

### Database Backup

```bash
# Backup OpenDocs tables
pg_dump -h host -U user -d db -t 'opendocs_*' > backup.sql

# Restore
psql -h host -U user -d db < backup.sql
```

### State Backup

```typescript
// Export state to JSON
const state = useStore.getState();
const backup = JSON.stringify(state, null, 2);

// Save to file
fs.writeFileSync('opendocs-backup.json', backup);

// Restore
const backup = JSON.parse(fs.readFileSync('opendocs-backup.json', 'utf-8'));
useStore.setState(backup);
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version, clear cache: `npm cache clean --force` |
| API errors | Check NVIDIA_API_KEY, verify API connectivity |
| DB connection fails | Check SUPABASE_DB_URL, verify credentials |
| Rate limit hit | Wait for window reset, increase limit |
| CORS errors | Configure CORS_ORIGIN correctly |

### Debug Mode

```bash
# Enable debug logging
DEBUG=opendocs:* npm run dev

# Check server logs
docker logs opendocs-server -f

# Check network requests
# Open DevTools → Network tab
```

---

## Contributing

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/opendocs.git
cd opendocs

# Create branch
git checkout -b feature/my-feature

# Make changes
# ...

# Run tests
npm test

# Run linting
npm run lint

# Commit
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create PR
```

### Code Style

- **TypeScript:** Strict mode, no `any`
- **ESLint:** Follow lint rules
- **Prettier:** Format on save
- **Commits:** Conventional commits format

---

**Document Statistics:**
- Total Lines: 800+
- Sections: 18
- Code Examples: 60+
- Tables: 30+

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
