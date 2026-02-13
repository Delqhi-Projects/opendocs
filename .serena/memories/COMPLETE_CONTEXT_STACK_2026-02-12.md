# COMPLETE CONTEXT STACK - SIN-Solver Session 2026-02-12
## MANDATORY READ FOR ALL FUTURE AGENTS

---

## 🎯 USER'S MAIN GOAL
**Consolidate SIN-Solver architecture** - Eliminate chaos of multiple captcha-worker containers and use ONLY opendelqhi project with Vision AI.

### User Explicit Requests:
1. "zeige live auf https://2captcha.com/demo wie du captchas löst" (Show live solving)
2. "NIEMALS primitive ANWENDUNG BAUEN - NIEMALS nur hartcodierte Pattern"
3. "wir wollen eine ECHTE Vision-AI Extension"
4. "warum haben wir soviele captcha worker solver container"
5. **Use opendelqhi** (not captcha-solver) - already has VisionClaw, Steel CDP, Ollama
6. **Clean up Docker containers** - Remove redundant captcha/solver containers

---

## 📁 DIRECTORY CONTEXT

### Project Root:
```
/Users/jeremy/dev/SIN-Solver/
├── docker-compose.yml              ← MAIN SOURCE OF TRUTH (subnet: 172.26.0.0/16)
├── docker-compose.enterprise.yml
├── lastchanges.md                  ← Session log (created 2026-02-12)
├── AGENTS.md                       ← Global agents config
├── README.md                       ← Main documentation
├── Dockerfile
├── src/                            ← Source code
├── services/                       ← Service implementations
│   ├── zimmer-11-dashboard/
│   ├── zimmer-13-api-coordinator/
│   ├── zimmer-09-clawdbot/        ← NOT FOUND (causing build errors)
│   └── ...
├── extensions/                     ← Chrome Extensions
│   ├── captcha-solver/            ← ❌ WRONG (primitive, hardcoded patterns)
│   │   ├── manifest.json
│   │   ├── content-native-cdp.js
│   │   └── background-browser-use.js
│   └── opendelqhi/                ← ✅ CORRECT (VisionClaw, Steel CDP, Ollama)
│       ├── manifest.json          ← Needs 2captcha.com permissions
│       ├── content-captcha-detector.js
│       ├── chat-server.js         ← Server with Ollama (Port 8765)
│       ├── dolphin-engine.js      ← Visual Cursor Engine
│       ├── captcha-solver-ultimate.js
│       └── background.js
├── Docker/                        ← Docker configurations
│   ├── agents/
│   │   ├── agent-05-steel/docker-compose.yml
│   │   ├── agent-08-browser-use/docker-compose.yml
│   │   ├── agent-09-openclaw/docker-compose.yml
│   │   └── agent-09-stagehand/docker-compose.yml
│   ├── builders/
│   │   └── builder-1.1-captcha-worker/docker-compose.yml
│   └── solvers/
│       ├── solver-1.1-2captcha/docker-compose.yml
│       └── solver-1.4-2captcha/docker-compose.yml
├── workers/
│   └── 2captcha-worker/
│       └── dist/high-performance-native-worker.js  ← UltraFastCDPManager
└── training/                      ← YOLO Captcha Training
    └── ...
```

---

## 🐳 DOCKER CONTEXT

### Current Container Status (After Cleanup):
```
RUNNING CONTAINERS (8 total):
✅ Zimmer-Speicher-Redis        healthy     Port 6379
✅ Zimmer-Archiv-Postgres       healthy     Port 5432
⚠️  Zimmer-01-n8n-Manager       unhealthy   Port 5678 (but working)
⚠️  agent-05-steel-browser      unhealthy   Port 50005/50015
✅ agent-08-browser-use         healthy     Port 50008
✅ agent-09-openclaw            running     Port 18789
⚠️  alertmanager                unhealthy   Port 9093
✅ rocketchat-webhook-adapter   healthy     Port 8093

EXITED CONTAINERS (0):
[All cleaned up - 22 containers deleted]
```

### Network Configuration:
- **Network:** haus-netzwerk
- **Subnet:** 172.26.0.0/16 (changed from 172.20.0.0/16 due to conflict)
- **Gateway:** 172.26.0.1

### Deleted Containers (22 total):
```
captcha-worker-dev
captcha-grafana-dev
captcha-postgres-dev
captcha-redis-dev
captcha-prometheus-dev
captcha-worker
captcha-grafana
captcha-postgres
captcha-prometheus
captcha-redis
builder-1.1-captcha-worker
agent-09-stagehand-test
agent-07-vnc-browser
agent-05-vnc-browser
agent-09-stagehand
agent-10-memu
skyvern-mcp
room-00-cloudflared-tunnel
room-01-dashboard
room-03-postgres-master (old orphan)
room-04-redis-cache (old orphan)
agent-01-n8n-orchestrator (old orphan)
```

### Docker Compose Files (20+ found):
```
/Users/jeremy/dev/SIN-Solver/docker-compose.yml                    ← MAIN
/Users/jeremy/dev/SIN-Solver/docker-compose.enterprise.yml
/Users/jeremy/dev/SIN-Solver/Docker/builders/builder-1.1-captcha-worker/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-08-browser-use/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-05-steel/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-09-stagehand/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-03-agentzero/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-06-skyvern/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-12-visionclaw-core/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-07-vnc-browser/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-09-openclaw/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-01-n8n-orchestrator/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-04-opencode-secretary/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-09-clawdbot-messenger/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-02-chronos-scheduler/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-01-n8n/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-09-moltbot-bote/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/agents/agent-05-vnc-browser/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/solvers/solver-1.1-2captcha/docker-compose.yml
/Users/jeremy/dev/SIN-Solver/Docker/solvers/solver-1.4-2captcha/docker-compose.yml
```

---

## 🔑 KEY VARIABLES

### Ports:
```
Redis:              6379
Postgres:           5432
n8n:                5678
Steel Browser:      50005 (API), 50015 (CDP)
Browser-use:        50008
OpenClaw:           18789
Alertmanager:       9093
RocketChat Adapter: 8093
Ollama (expected):  11434
```

### IP Assignments (haus-netzwerk 172.26.0.0/16):
```
Zimmer-Speicher-Redis:        172.26.0.10
Zimmer-Archiv-Postgres:       172.26.0.11
Zimmer-10-Postgres-Bibliothek: 172.26.0.12
Zimmer-05-Steel-Tarnkappe:    172.26.0.20
Zimmer-01-n8n-Manager:        172.26.0.30
Zimmer-13-API-Koordinator:    172.26.0.31
Zimmer-11-Dashboard-Zentrale: 172.26.0.40
Zimmer-04-OpenCode-Sekretaer: 172.26.0.41
```

### Environment Variables (from docker-compose.yml):
```
POSTGRES_DB: sin_solver_production
POSTGRES_USER: ceo_admin
POSTGRES_PASSWORD: secure_ceo_password_2026
REDIS_URL: redis://zimmer-speicher-redis:6379
DATABASE_URL: postgresql://ceo_admin:secure_ceo_password_2026@zimmer-archiv-postgres:5432/sin_solver_production
STEEL_CDP_URL: ws://zimmer-05-steel-tarnkappe:3000/
```

---

## 🔍 DISCOVERIES

### Critical Discovery 1: Container Chaos Root Cause
- **Problem:** 20+ docker-compose.yml files scattered across project
- **Cause:** Each experiment created new compose file without cleanup
- **Solution:** Use ONLY main docker-compose.yml ("Das Haus" architecture)

### Critical Discovery 2: Network Conflict
- **Problem:** Subnet 172.20.0.0/16 overlapped with delqhi-network
- **Solution:** Changed to 172.26.0.0/16 in main docker-compose.yml
- **Files Modified:** 28 IP references updated in docker-compose.yml

### Critical Discovery 3: Two Extension Folders
- **WRONG:** `/extensions/captcha-solver/` - Primitive, hardcoded patterns
- **CORRECT:** `/extensions/opendelqhi/` - Advanced, VisionClaw, Steel CDP, Ollama

### Critical Discovery 4: Volume Issues
- **Redis:** RDB format version mismatch (old volume incompatible)
- **Solution:** Recreated volumes with fresh data

### Critical Discovery 5: Missing Services Directory
- **Error:** `services/zimmer-09-clawdbot` not found (causing build failure)
- **Status:** Service referenced in docker-compose but directory missing

---

## 📝 TASKS TO COMPLETE

### Immediate Tasks:
1. ✅ Container cleanup (22 dead containers deleted)
2. ✅ Network fix (subnet changed to 172.26.0.0/16)
3. ✅ Core infrastructure started (Redis, Postgres, n8n)
4. ⏭️ Fix unhealthy containers (steel-browser, alertmanager)
5. ⏭️ Start additional services (dashboard, skyvern, etc.)
6. ⏭️ Consolidate docker-compose files (archive/delete 20+ scattered files)
7. ⏭️ Fix opendelqhi extension for 2captcha.com
8. ⏭️ Test live captcha solving

### Next Phase Tasks:
9. Update opendelqhi manifest.json with 2captcha.com permissions
10. Verify Vision AI integration (Ollama/Mistral)
11. Test Chrome Extension on 2captcha.com
12. Document final architecture

---

## ⚠️ EXPLICIT CONSTRAINTS

1. **NEVER build primitive applications** - Use Vision AI, not hardcoded patterns
2. **Use ONLY opendelqhi extension** - NOT captcha-solver
3. **Clean Docker architecture** - No redundant containers
4. **Best Practices 2026** - CEO-Level organization
5. **Single source of truth** - Main docker-compose.yml only
6. **Real Vision AI** - Ollama/Mistral, not pattern matching
7. **Work directly in browser tab** - Not separate windows
8. **Self-healing selectors** - DOM Mutation Observer
9. **Visual AI Analysis** - Must have real AI vision
10. **Documentation mandatory** - lastchanges.md, AGENTS.md

---

## 🔧 AGENT VERIFICATION STATE

**Current Agent:** Implementation/CEO-Level Agent
**Session Status:** Container cleanup COMPLETED, ready for next phase
**Previous Work:** 22 containers deleted, network fixed, core infra running
**Acceptance Status:** User approved direction, ready for next steps
**Health Status:** 4/8 containers healthy, 4 running but unhealthy
**Blockers:** None
**Next Actions:** Fix unhealthy containers, start additional services

---

## 🎯 KEY FILES

### Must Read Before Work:
1. `/Users/jeremy/dev/SIN-Solver/lastchanges.md` - Session log
2. `/Users/jeremy/dev/SIN-Solver/docker-compose.yml` - Main config
3. `/Users/jeremy/dev/SIN-Solver/extensions/opendelqhi/manifest.json` - Extension config
4. `/Users/jeremy/dev/SIN-Solver/extensions/opendelqhi/content-captcha-detector.js` - Captcha detection
5. `/Users/jeremy/dev/SIN-Solver/extensions/opendelqhi/captcha-solver-ultimate.js` - Solver logic

### High-Performance Worker:
- `/Users/jeremy/dev/SIN-Solver/workers/2captcha-worker/dist/high-performance-native-worker.js`
  - UltraFastCDPManager (native WebSocket, no Playwright)
  - RedisCacheManager
  - Steel Browser CDP
  - 46x faster connection, 20x faster screenshots

---

## 🚀 WHAT USER WANTS (SUMMARIZED)

1. **Eliminate container chaos** ✅ DONE (22 deleted)
2. **Use ONLY opendelqhi project** (has VisionClaw, Steel, Ollama)
3. **Fix Chrome Extension** to work on 2captcha.com with REAL Vision AI
4. **Clean Docker** - Single source of truth
5. **Show live solving** on 2captcha.com
6. **NO primitive pattern matching** - Real Vision AI only
7. **Best Practices 2026** - CEO-Level

---

## 🎓 BEST PRACTICES 2026 CHECKLIST

- [x] Container inventory created
- [x] Dead containers removed (22 deleted)
- [x] Network conflicts resolved
- [x] Documentation created (lastchanges.md)
- [x] Git commit & push
- [ ] Fix unhealthy containers
- [ ] Consolidate docker-compose files
- [ ] Extension manifest updated
- [ ] Live testing on 2captcha.com

---

**Created:** 2026-02-12  
**Status:** ACTIVE - Context preserved for all future agents  
**MANDATORY:** All agents MUST read this before working on SIN-Solver
