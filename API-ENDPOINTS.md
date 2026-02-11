# OpenDocs — API-ENDPOINTS.md

> Best Practices Feb 2026: version your APIs, document auth, rate limits, and request/response schemas.

## Auth & Headers
- **Rate Limit:** applies to all `/api/*` (see server env `RATE_LIMIT_*`).
- **Auth (recommended):** if `API_AUTH_TOKEN` is set on the server, all endpoints except `/api/health` require:
  - `X-OpenDocs-Token: <token>`
- **Request ID (observability):** client may send `X-Request-Id`; server returns `X-Request-Id`.

## Health
### `GET /api/health`
Public.

## LLM
### `POST /api/nvidia/chat`
Proxy to NVIDIA `v1/chat/completions`.

### `POST /api/agent/plan`
Returns an LLM response containing a JSON plan (reply + allowlisted commands).

## Analysis
### `POST /api/github/analyze`
Input: `{ url: string }`

### `POST /api/website/analyze`
Input: `{ url: string }`

### `POST /api/images/search`
Input: `{ query: string }`

## Supabase Postgres Provisioning (Database blocks)
> Requires `SUPABASE_DB_URL`.

### `POST /api/db/table/create`
Create a table for an OpenDocs Database block.
Input:
```json
{ "tableName": "opendocs_db_<page>_<block>", "columns": [{"name":"name","type":"text"}] }
```

### `POST /api/db/table/drop`
Drop the provisioned table.
Input: `{ "tableName": "..." }`

### `POST /api/db/table/ensure-columns`
Idempotent schema migration for newly added properties.
Input:
```json
{ "tableName": "...", "columns": [{"name":"status","type":"select"}] }
```

### `POST /api/db/rows/create`
Reserve a row id.
Input: `{ "tableName": "...", "rowId": "uuid" }`

### `POST /api/db/rows/upsert`
Upsert row data.
Input:
```json
{ "tableName": "...", "rowId": "uuid", "data": {"name":"A","status":"opt_1"} }
```

### `POST /api/db/rows/delete`
Delete a row.
Input: `{ "tableName": "...", "rowId": "uuid" }`

## Automations (If/Then) — v1
> **Status:** Implemented (v1). Rules can be executed via `trigger` and triggers can be installed via `rules/sync`.

## n8n Integration (Workflow Nodes)
> **Status:** Implemented (server proxy + UI block).

### `POST /api/n8n/nodes`
Lists available n8n node modules.

### `POST /api/n8n/workflows/create`
Creates a workflow in n8n.

### `POST /api/n8n/nodes/update`
Creates/updates a node in an n8n workflow.

### `POST /api/n8n/nodes/connect`
Connects two nodes in a workflow.

### `POST /api/n8n/nodes/toggle`
Enables/disables a node.

### `POST /api/db/automations/install`
Installs the rules table `opendocs_automation_rules`.

### `POST /api/db/automations/rules/create`
Creates a rule row.
Input:
```json
{ "tableName": "opendocs_db_*", "whenColumn": "status", "whenEquals": "Done", "thenSetColumn": "closed_at", "thenSetValue": "2026-02-09T00:00:00Z" }
```

### `POST /api/db/automations/rules/sync`
Installs/updates a Postgres trigger for the given table so rules run server-side on updates.
Input:
```json
{ "tableName": "opendocs_db_<page>_<block>" }
```

### `POST /api/db/automations/trigger`
Executes rules for a single row (explicit execution path; useful for manual runs / debugging).
Input:
```json
{ "tableName": "opendocs_db_<page>_<block>", "rowId": "uuid" }
```
