# OpenDocs — SUPABASE.md

OpenDocs supports **optional Supabase integration** in two distinct layers:

1.  **Frontend Sync (Supabase JS):** User auth and realtime document synchronization (Vite environment variables).
2.  **Server-side Provisioning (Postgres):** Automatic creation of real database tables when you insert a "Database" block in a document (Express environment variables).

---

## 🟢 Database Views & Workflows (Best Practices 2026)

OpenDocs uses **Object-Based Whiteboarding**. Every node in a Workflow block and every row in a Database block is a structured record in your Supabase Postgres.

### 1. Unified Data Layer
- **Table View:** Standard relational data entry.
- **Kanban View:** Drag-and-drop status management.
- **Workflow View:** Visual mapping of dependencies and logic flows.

All these views operate on the same provisioned table (e.g., `opendocs_db_xyz`).

---

## 1. Direct Postgres Provisioning (Database Blocks)

When you insert a **Database** block, OpenDocs automatically provisions a real table in your Supabase Postgres database. This allows you to treat documentation tables as real, queryable data structures.

### Requirements
The following environment variables must be set on the **Express server**:
- `SUPABASE_DB_URL`: The direct Postgres connection string (e.g., `postgresql://postgres:password@localhost:54322/postgres`).
- `SUPABASE_DB_SCHEMA`: The target schema (default: `public`).

### How it Works
1.  **Table Creation:** When a Database block is created, OpenDocs generates a deterministic, unique table name: `opendocs_db_<pageId>_<blockId>`. It then executes a `CREATE TABLE` command.
2.  **Schema Evolution:** Adding a property in the UI triggers an `ALTER TABLE ... ADD COLUMN` in the background.
3.  **Data Sync:** Adding or editing rows in the document triggers `INSERT` or `UPSERT` commands to the provisioned table.
4.  **Cleanup:** Deleting the Database block drops the corresponding table from Postgres (best-effort).

---

## 2. Automations (If/Then Rules)

OpenDocs includes an automation engine powered by **Postgres triggers + metadata rules**.

### Status
- ✅ **Implemented (v1):** rules table + rule creation + trigger install (`/api/db/automations/rules/sync`) + explicit run (`/api/db/automations/trigger`).
- ⬜ **Planned:** richer rule builder UI, typed operators (>, <, contains), audit log table, Edge Functions for long-running jobs.

### Setup
1. Call `POST /api/db/automations/install` once per Supabase instance.
2. Create rules with `POST /api/db/automations/rules/create`.
3. Install triggers per table with `POST /api/db/automations/rules/sync`.

### Execution model (v1)
- Trigger: **BEFORE UPDATE** on the provisioned table.
- Rules are matched by `table_name`.
- When condition matches (simple `=` for now), the trigger sets the configured column value.

### Best Practices 2026 notes
- Keep rules deterministic + idempotent.
- Use a dedicated schema or prefix allowlist (`opendocs_db_*`).
- Prefer Edge Functions for external side effects (emails/WhatsApp), and keep DB triggers for pure data updates.

---

## 3. Local Supabase Container

OpenDocs is designed to work with the **Supabase Open Source CLI/Docker** setup.

### Integration Steps
1.  Start your local Supabase: `supabase start`.
2.  Copy the connection details into your `.env` file.
3.  OpenDocs will automatically detect the configuration and enable the "Remote DB" badge on your database blocks.

---

## 4. API Reference for DB Ops

See `API-ENDPOINTS.md` for details on:
- `POST /api/db/table/create`
- `POST /api/db/table/drop`
- `POST /api/db/rows/upsert`
- `POST /api/db/automations/install`
