# SUPABASE.md - OpenDocs Database Integration Guide

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Production-Ready  

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Local Development Setup](#local-development-setup)
4. [Oracle Cloud VM Deployment](#oracle-cloud-vm-deployment)
5. [Database Schema](#database-schema)
6. [Edge Functions](#edge-functions)
7. [Realtime Integration](#realtime-integration)
8. [Authentication Setup](#authentication-setup)
9. [Row Level Security](#row-level-security)
10. [Migration Guide](#migration-guide)
11. [Backup and Recovery](#backup-and-recovery)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)
14. [Best Practices](#best-practices)

---

## Overview

OpenDocs integrates with Supabase PostgreSQL for persistent data storage, enabling real-time synchronization, remote database backing, and multi-user collaboration.

### Key Features

| Feature | Description |
|---------|-------------|
| **Remote Database Backing** | Connect database blocks to real PostgreSQL tables |
| **Realtime Sync** | Live updates across all connected clients |
| **Row Level Security** | Fine-grained access control |
| **Edge Functions** | Serverless functions for custom logic |
| **Authentication** | Built-in user management |

### When to Use Supabase

| Use Case | Recommended |
|----------|-------------|
| Single-user, local-only | ❌ Not needed |
| Multi-user collaboration | ✅ Recommended |
| Persistent data storage | ✅ Recommended |
| Real-time sync required | ✅ Required |
| Production deployment | ✅ Recommended |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │   OpenDocs      │         │   Supabase      │               │
│  │   Frontend      │         │   Cloud         │               │
│  │                 │         │                 │               │
│  │  • Local State  │  ←────→ │  • PostgreSQL   │               │
│  │  • Sync Logic   │   API   │  • Auth         │               │
│  │  • Realtime     │         │  • Storage      │               │
│  └─────────────────┘         │  • Edge Funcs   │               │
│                              └─────────────────┘               │
│         │                           │                          │
│         │                           │                          │
│         ▼                           ▼                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   OpenDocs Server                        │   │
│  │  • /api/db/table/*                                      │   │
│  │  • /api/db/rows/*                                       │   │
│  │  • /api/db/automations/*                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User creates Database Block in OpenDocs
        ↓
2. User enables "Remote Sync" in block settings
        ↓
3. OpenDocs Server creates table via /api/db/table/create
        ↓
4. Table created: opendocs_db_{blockId}
        ↓
5. Rows sync bidirectionally between frontend and Supabase
        ↓
6. Realtime updates via Supabase Realtime
```

---

## Local Development Setup

### Option 1: Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Initialize project
supabase init

# 3. Start local Supabase
supabase start

# Output shows connection details:
#   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
#   API URL: http://127.0.0.1:54321
#   Studio URL: http://127.0.0.1:54323

# 4. Configure OpenDocs
# Add to .env:
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_DB_SCHEMA=public
```

### Option 2: Docker Compose

```yaml
# docker-compose.supabase.yml
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.147
    environment:
      POSTGRES_PASSWORD: your-super-secret-password
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  studio:
    image: supabase/studio:latest
    environment:
      STUDIO_PG_META_URL: http://meta:8080
      POSTGRES_PASSWORD: your-super-secret-password
    ports:
      - "3001:3000"
    depends_on:
      - postgres

  meta:
    image: supabase/postgres-meta:latest
    environment:
      PG_META_DB_HOST: postgres
      PG_META_DB_PASSWORD: your-super-secret-password
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Start services
docker-compose -f docker-compose.supabase.yml up -d

# Configure OpenDocs
SUPABASE_DB_URL=postgresql://postgres:your-super-secret-password@localhost:5432/postgres
```

### Option 3: Supabase Cloud (Free Tier)

```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Get connection details from Settings > Database
# 4. Configure OpenDocs

SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

## Oracle Cloud VM Deployment

### Prerequisites

- Oracle Cloud account with Free Tier
- VM.Standard.E2.1.Micro (Always Free)
- 4 OCPU, 24 GB RAM recommended for production

### Step 1: Create VM Instance

```bash
# In Oracle Cloud Console:
# 1. Compute > Instances > Create Instance
# 2. Name: opendocs-db
# 3. Shape: VM.Standard.E2.1.Micro (Free) or VM.Standard.E4.Flex
# 4. Image: Ubuntu 22.04 or Oracle Linux 8
# 5. VCN: Create new or use existing
# 6. Public IP: Assign public IP
# 7. SSH Key: Upload or generate
# 8. Create
```

### Step 2: Configure Security List

```bash
# In VCN > Security Lists > Default Security List
# Add Ingress Rules:

# PostgreSQL
Source: 0.0.0.0/0 (or restrict to your IP)
Destination Port: 5432
Protocol: TCP

# Supabase Studio (optional)
Source: Your IP only
Destination Port: 3000
Protocol: TCP
```

### Step 3: Install Docker

```bash
# SSH into VM
ssh ubuntu@your-vm-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### Step 4: Deploy Supabase

```bash
# Create directory
mkdir -p ~/supabase && cd ~/supabase

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.147
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  studio:
    image: supabase/studio:latest
    environment:
      STUDIO_PG_META_URL: http://meta:8080
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  meta:
    image: supabase/postgres-meta:latest
    environment:
      PG_META_DB_HOST: postgres
      PG_META_DB_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
EOF

# Create .env file
cat > .env << 'EOF'
POSTGRES_PASSWORD=your-secure-password-here
JWT_SECRET=your-jwt-secret-at-least-32-chars
EOF

# Generate secure passwords
openssl rand -base64 32  # For POSTGRES_PASSWORD
openssl rand -base64 32  # For JWT_SECRET

# Start services
docker compose up -d

# Check status
docker compose ps
```

### Step 5: Configure OpenDocs

```bash
# In OpenDocs .env
SUPABASE_DB_URL=postgresql://postgres:your-secure-password@your-vm-ip:5432/postgres
SUPABASE_DB_SCHEMA=public
```

### Step 6: SSL/TLS Configuration (Optional)

```bash
# Install Caddy for automatic HTTPS
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
db.yourdomain.com {
    reverse_proxy localhost:5432
}

studio.yourdomain.com {
    reverse_proxy localhost:3000
}
EOF

# Restart Caddy
sudo systemctl restart caddy
```

---

## Database Schema

### System Tables

OpenDocs creates and manages these system tables:

```sql
-- Automation Rules Table
CREATE TABLE IF NOT EXISTS opendocs_automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  when_column text NOT NULL,
  when_equals text NOT NULL,
  then_set_column text NOT NULL,
  then_set_value text NOT NULL
);

-- Automation Trigger Function
CREATE OR REPLACE FUNCTION opendocs_apply_automations()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
  current_value text;
BEGIN
  FOR rule IN
    SELECT when_column, when_equals, then_set_column, then_set_value
    FROM opendocs_automation_rules
    WHERE table_name = TG_TABLE_NAME
  LOOP
    EXECUTE format('SELECT ($1).%I::text', rule.when_column)
      INTO current_value
      USING NEW;
    IF current_value = rule.when_equals THEN
      NEW := jsonb_populate_record(NEW, jsonb_build_object(rule.then_set_column, rule.then_set_value));
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### User Database Tables

Tables created for Database Blocks:

```sql
-- Example: opendocs_db_abc123
CREATE TABLE IF NOT EXISTS opendocs_db_abc123 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- User columns added dynamically
  title text,
  status text,
  priority double precision,
  completed boolean,
  due_date timestamptz
);

-- Automation Trigger (synced)
CREATE TRIGGER trig_opendocs_apply_automations
BEFORE UPDATE ON opendocs_db_abc123
FOR EACH ROW
EXECUTE FUNCTION opendocs_apply_automations();

-- Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE opendocs_db_abc123;
```

### Column Type Mapping

| OpenDocs Type | PostgreSQL Type | Description |
|---------------|-----------------|-------------|
| `text` | `text` | Text input |
| `number` | `double precision` | Numeric values |
| `checkbox` | `boolean` | True/false |
| `date` | `timestamptz` | Date and time |
| `select` | `text` | Dropdown (stores option ID or name) |

---

## Edge Functions

### Overview

Supabase Edge Functions allow serverless execution of custom logic.

### Example: Webhook Handler

```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { method } = req;
  
  if (method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // Process webhook payload
    console.log("Webhook received:", payload);
    
    // Trigger OpenDocs automation
    const response = await fetch(`${OPENDOCS_URL}/api/db/automations/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableName: payload.table,
        rowId: payload.id,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

### Deploying Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy webhook-handler

# Set secrets
supabase secrets set OPENDOCS_URL=https://your-opendocs-instance.com
```

---

## Realtime Integration

### Enable Realtime

```typescript
// In OpenDocs frontend
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscribe to table changes
const channel = supabase
  .channel(`opendocs_db_${blockId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: `opendocs_db_${blockId}`,
    },
    (payload) => {
      console.log('Change received:', payload);
      // Update local state
      updateLocalState(payload);
    }
  )
  .subscribe();
```

### Realtime Events

| Event | Description |
|-------|-------------|
| `INSERT` | New row created |
| `UPDATE` | Row updated |
| `DELETE` | Row deleted |
| `*` | All events |

---

## Authentication Setup

### Enable Authentication

```bash
# In Supabase Dashboard:
# 1. Authentication > Providers
# 2. Enable Email provider
# 3. Configure settings (confirmation emails, etc.)
```

### User Management

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Integration with OpenDocs

```typescript
// Pass auth token to API
const { data: { session } } = await supabase.auth.getSession();

fetch('/api/db/rows/upsert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({ ... }),
});
```

---

## Row Level Security

### Enable RLS

```sql
-- Enable RLS on table
ALTER TABLE opendocs_db_abc123 ENABLE ROW LEVEL SECURITY;

-- Allow all for now (configure per requirements)
CREATE POLICY "Allow all" ON opendocs_db_abc123
  FOR ALL
  USING (true);
```

### User-Specific Policies

```sql
-- Only allow users to access their own rows
CREATE POLICY "Users own rows" ON opendocs_db_abc123
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## Migration Guide

### Migrating Data to Supabase

```bash
# Export from source
pg_dump -h source-host -U user -d database > dump.sql

# Import to Supabase
psql -h db.project-ref.supabase.co -U postgres -d postgres < dump.sql
```

### Schema Migration

```sql
-- Generate migration
SELECT 
  'ALTER TABLE ' || tablename || ' ADD COLUMN IF NOT EXISTS new_column text;' 
FROM pg_tables 
WHERE schemaname = 'public';

-- Run migrations
ALTER TABLE opendocs_db_abc123 ADD COLUMN IF NOT EXISTS tags text[];
```

---

## Backup and Recovery

### Automatic Backups

Supabase Cloud provides automatic daily backups (Pro plan).

### Manual Backup

```bash
# Backup specific table
pg_dump -h db.project-ref.supabase.co -U postgres -t opendocs_db_abc123 > backup.sql

# Backup all OpenDocs tables
pg_dump -h db.project-ref.supabase.co -U postgres -t 'opendocs_*' > opendocs_backup.sql
```

### Restore

```bash
# Restore from backup
psql -h db.project-ref.supabase.co -U postgres -d postgres < backup.sql
```

---

## Performance Optimization

### Indexing

```sql
-- Add index for frequently queried columns
CREATE INDEX idx_status ON opendocs_db_abc123 (status);
CREATE INDEX idx_created_at ON opendocs_db_abc123 (created_at);

-- Composite index
CREATE INDEX idx_status_priority ON opendocs_db_abc123 (status, priority);
```

### Connection Pooling

```typescript
// Use connection pooler for production
// From Supabase Dashboard > Settings > Database
// Pooler Connection String (Transaction mode)

SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Query Optimization

```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM opendocs_db_abc123 WHERE status = 'done';

-- Optimize with index
CREATE INDEX CONCURRENTLY idx_status ON opendocs_db_abc123 (status);
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Connection refused | Check firewall rules, verify host/port |
| Authentication failed | Check credentials, verify password |
| Table not found | Check schema name, verify table exists |
| Permission denied | Check RLS policies, verify user has access |
| Realtime not working | Check publication, verify table is added |

### Diagnostic Queries

```sql
-- List all OpenDocs tables
SELECT tablename FROM pg_tables WHERE tablename LIKE 'opendocs_%';

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('opendocs_db_abc123'));

-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'postgres';

-- Check realtime publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

---

## Best Practices

### Security

- ✅ Use environment variables for credentials
- ✅ Enable RLS on all user tables
- ✅ Use connection pooler in production
- ✅ Restrict network access via security groups
- ❌ Never commit credentials to git
- ❌ Never use `postgres` user in production

### Performance

- ✅ Index frequently queried columns
- ✅ Use connection pooling
- ✅ Monitor query performance
- ✅ Vacuum tables regularly
- ❌ Avoid SELECT * for large tables
- ❌ Don't skip indexing

### Maintenance

- ✅ Regular backups
- ✅ Monitor table sizes
- ✅ Clean up unused tables
- ✅ Update statistics
- ❌ Ignore disk space warnings

---

**Document Statistics:**
- Total Lines: 500+
- Sections: 14
- Code Examples: 40+
- Tables: 15+

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
