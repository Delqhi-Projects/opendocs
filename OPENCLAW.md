# OpenDocs — OPENCLAW.md

> **Best Practices Feb 2026:** Integration via OpenClaw (Open Source Auth/Integration Bridge).

## Vision
We do not use proprietary provider APIs directly in the frontend. Everything flows through **OpenClaw**. This enables:
1.  **Unified Auth:** A single connection to OpenClaw unlocks Meta (WhatsApp/Instagram), LinkedIn, and more.
2.  **Security:** Credentials never leave your local infrastructure.
3.  **AI Control:** The OpenDocs Agent can trigger actions in third-party apps via the OpenClaw bridge.

## Setup (Local Container)
1. Start your local OpenClaw container (Docker).
2. Generate an `OPENCLAW_TOKEN`.
3. Add the URL and Token to your **server** `.env` (Express ENV), not the browser.

## Implementation Roadmap
### Phase 1: Bridge Setup
- [x] ✅ Implemented server-side proxy: `POST /api/integrations/openclaw/send` (token injected server-side)
- [x] ✅ Frontend uses OpenDocs proxy (no OpenClaw token in browser)

### Phase 2: AI Actions
- [x] ✅ Command type: `integration.openclaw.send`
- [x] ✅ Agent executor can call OpenClaw via proxy

### Phase 3: n8n Sync
- [ ] Use OpenClaw as the auth gateway for n8n webhook triggers (planned)

## Environment Variables (server)
- `OPENCLAW_BASE_URL`: e.g., `http://localhost:8080`
- `OPENCLAW_TOKEN`: your secure bridge token (kept server-side)
