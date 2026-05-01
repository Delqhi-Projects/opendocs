# SIN-Solver AGENTS.md

**Project:** SIN-Solver - Enterprise AI Automation Platform
**Location:** /Users/jeremy/dev/SIN-Solver
**Last Updated:** 2026-02-12

---

## 🏗️ Architecture Overview

SIN-Solver follows the **"Das Haus" (The House)** architecture pattern - a centralized, room-based container system with clear separation of concerns.

### Core Principle: SINGLE SOURCE OF TRUTH

- **ONE** docker-compose.yml (the main one in project root)
- **NO** scattered docker-compose files in subdirectories
- **CONSISTENT** naming: `Zimmer-XX-Descriptive-Name`
- **CLEAN** network: 172.26.0.0/16 (haus-netzwerk)

---

## 📋 Container Naming Convention (MANDATORY)

All containers MUST follow this pattern:

```
Zimmer-XX-Descriptive-Name
```

**Examples:**

- ✅ `Zimmer-01-n8n-Manager`
- ✅ `Zimmer-Speicher-Redis`
- ✅ `Zimmer-Archiv-Postgres`
- ❌ `captcha-worker` (old, non-compliant)
- ❌ `redis` (too generic)

---

## 🌐 Network Configuration

**Network:** `haus-netzwerk`
**Subnet:** `172.26.0.0/16` (avoided 172.20.0.0/16 conflict with delqhi-network)

### IP Assignments (Fixed):

| Container                     | IP          | Purpose          |
| ----------------------------- | ----------- | ---------------- |
| Zimmer-Speicher-Redis         | 172.26.0.10 | Cache & Sessions |
| Zimmer-Archiv-Postgres        | 172.26.0.11 | Primary Database |
| Zimmer-10-Postgres-Bibliothek | 172.26.0.12 | Knowledge Base   |
| Zimmer-05-Steel-Tarnkappe     | 172.26.0.20 | Stealth Browser  |
| Zimmer-01-n8n-Manager         | 172.26.0.30 | Workflow Engine  |

---

## 🔧 Best Practices (February 2026)

### 1. Container Management

```bash
# Start core infrastructure
docker-compose up -d zimmer-speicher-redis zimmer-archiv-postgres

# Start specific service
docker-compose up -d zimmer-01-n8n-manager

# View logs
docker-compose logs -f zimmer-archiv-postgres

# Clean up dead containers
docker container prune -f
```

### 2. Network Troubleshooting

If you see: `Pool overlaps with other one on this address space`

```bash
# Check existing networks
docker network ls
docker network inspect <name> | grep Subnet

# Solution: Use different subnet in docker-compose.yml
# Already fixed: Changed from 172.20.0.0/16 to 172.26.0.0/16
```

### 3. Volume Management

When facing "RDB format version" or permission errors:

```bash
# Remove and recreate volumes (WARNING: Data loss!)
docker volume rm sin-solver_redis_data sin-solver_postgres_data
docker volume create sin-solver_redis_data
docker volume create sin-solver_postgres_data
```

### 4. Health Check Protocol

Always verify containers after start:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected: At minimum these should be healthy/running:
# - Zimmer-Speicher-Redis (healthy)
# - Zimmer-Archiv-Postgres (healthy)
# - Zimmer-01-n8n-Manager (running)
```

---

## 🚀 Quick Start for New Agents

### Step 1: Verify Infrastructure

```bash
cd /Users/jeremy/dev/SIN-Solver
docker-compose ps
```

### Step 2: Start Core Services

```bash
docker-compose up -d zimmer-speicher-redis zimmer-archiv-postgres zimmer-01-n8n-manager
```

### Step 3: Verify Health

```bash
docker ps | grep -i zimmer
```

### Step 4: Access Services

- Redis: `redis-cli -p 6379 ping` → Should return `PONG`
- Postgres: `psql -h localhost -p 5432 -U ceo_admin -d sin_solver_production`
- n8n: http://localhost:5678

---

## 📝 Development Guidelines

### DO:

- ✅ Use main docker-compose.yml only
- ✅ Name containers with Zimmer-XX pattern
- ✅ Check lastchanges.md before making changes
- ✅ Document all subnet/network changes
- ✅ Clean up dead containers regularly

### DON'T:

- ❌ Create new docker-compose.yml files in subdirectories
- ❌ Use generic container names
- ❌ Delete volumes without checking contents
- ❌ Start containers without verifying network conflicts
- ❌ Leave dead containers running (wastes resources)

---

## 🔍 Common Issues & Solutions

### Issue: "Pool overlaps with other one on this address space"

**Cause:** Subnet conflict with existing Docker network
**Solution:** Change subnet in docker-compose.yml (already fixed to 172.26.0.0/16)

### Issue: Redis "Can't handle RDB format version 12"

**Cause:** Version mismatch between Redis image and data volume
**Solution:** Recreate volume (see Volume Management above)

### Issue: Postgres permission errors

**Cause:** Existing data directory owned by different user
**Solution:** Recreate volume or fix permissions in container

### Issue: Container starts but immediately exits

**Cause:** Health check failing or dependency not ready
**Solution:** Check logs with `docker logs <container-name>`

---

## 📚 Reference

### Project Structure

```
/Users/jeremy/dev/SIN-Solver/
├── docker-compose.yml          ← MAIN CONFIGURATION
├── lastchanges.md              ← Session logs (this file)
├── AGENTS.md                   ← This file
├── README.md                   ← Project documentation
├── services/                   ← Service implementations
│   ├── zimmer-11-dashboard/
│   ├── zimmer-13-api-coordinator/
│   └── ...
└── Docker/                     ← Docker configurations
    ├── agents/                 ← Agent containers
    ├── rooms/                  ← Infrastructure
    └── builders/               ← Build configurations
```

### Related Documentation

- Main README: `/Users/jeremy/dev/SIN-Solver/README.md`
- Last Changes: `/Users/jeremy/dev/SIN-Solver/lastchanges.md`
- Architecture: See docker-compose.yml header comments

---

## 🎯 Success Criteria

A healthy SIN-Solver installation should have:

- [ ] 8+ containers running (minimum core services)
- [ ] Zimmer-Speicher-Redis showing "healthy"
- [ ] Zimmer-Archiv-Postgres showing "healthy"
- [ ] Zimmer-01-n8n-Manager accessible on port 5678
- [ ] No dead/exited containers (`docker ps -a` should show only running)
- [ ] Clean network without conflicts

---

**Maintained by:** CEO-Level Agent Swarm
**Compliance:** Best Practices February 2026
**Status:** ACTIVE
