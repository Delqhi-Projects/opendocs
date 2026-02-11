# OpenDocs — USER-PLAN.md

## Setup & Operation Guide

### 1. Prerequisite Containers
Ensure your local open-source containers are running:
- **Supabase:** `supabase start`
- **OpenClaw (Optional):** For social/integration features.
- **n8n (Optional):** For advanced background workflows.

### 2. Configure Environments
Copy `.env.example` to `.env` (Server) and `.env.local` (Vite Frontend).

#### Must-have for AI:
- `NVIDIA_API_KEY`: Get from NVIDIA build portal.
- `API_AUTH_TOKEN`: A secret string shared by Frontend and Backend.

#### Must-have for real Databases:
- `SUPABASE_DB_URL`: Postgres string (e.g. `postgresql://postgres:postgres@localhost:54322/postgres`).

### 3. Start the Platform
```bash
# Terminal 1: Backend + Proxy
node server.js

# Terminal 2: Frontend
npm run dev
```

### 4. In-App Onboarding
1. **Connect:** Click the "Cloud" status icon to verify Supabase connectivity.
2. **AI Action:** Press `Cmd+J` and ask: "Show me what you can do".
3. **Database:** Create a "Database" block using `/` and watch your local Postgres create the table in real-time.

---

## Maintenance
- **Data Safety:** All content is saved locally in your browser. Sync only happens if Supabase is configured.
- **Locking:** Use the 🔓 icon to protect critical pages/blocks from accidental deletion or AI modification.
