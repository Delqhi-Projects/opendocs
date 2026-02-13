# API-ENDPOINTS.md - OpenDocs REST API Reference

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Base URL:** `http://localhost:3000/api`  

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Health Endpoints](#health-endpoints)
5. [AI Endpoints](#ai-endpoints)
6. [Agent Endpoints](#agent-endpoints)
7. [Database Endpoints](#database-endpoints)
8. [Automation Endpoints](#automation-endpoints)
9. [n8n Integration Endpoints](#n8n-integration-endpoints)
10. [OpenClaw Integration Endpoints](#openclaw-integration-endpoints)
11. [Website Analysis Endpoints](#website-analysis-endpoints)
12. [GitHub Analysis Endpoints](#github-analysis-endpoints)
13. [Image Search Endpoints](#image-search-endpoints)
14. [Error Handling](#error-handling)
15. [Best Practices](#best-practices)

---

## Overview

OpenDocs provides a comprehensive REST API for managing documentation, databases, automations, and AI-powered features.

### API Design Principles

- **RESTful:** Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON-Only:** All requests and responses use JSON
- **Stateless:** No server-side session state
- **Versioned:** Future versions will use `/api/v2/` prefix

### Request/Response Format

```typescript
// Request Headers
Content-Type: application/json
X-OpenDocs-Token: <token>  // Optional, if API_AUTH_TOKEN is set
X-Request-Id: <uuid>       // Optional, for tracing

// Response Format
{
  "ok": true,
  "data": { ... }
}

// Error Response
{
  "error": "error_code",
  "message": "Human-readable error description"
}
```

---

## Authentication

### Token Authentication (Optional)

If `API_AUTH_TOKEN` is configured, all `/api/*` endpoints (except `/api/health`) require authentication.

```bash
# Set token in environment
API_AUTH_TOKEN=your-secret-token

# Include in requests
curl -H "X-OpenDocs-Token: your-secret-token" http://localhost:3000/api/nvidia/chat
```

### Security Headers

| Header | Description |
|--------|-------------|
| `X-OpenDocs-Token` | API authentication token |
| `X-Request-Id` | Request correlation ID |

---

## Rate Limiting

### Rate Limit Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Remaining requests in window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

### Rate Limit Response

```json
// HTTP 429 Too Many Requests
{
  "error": "rate_limit",
  "message": "Too many requests"
}
```

### Configuration

```bash
RATE_LIMIT_WINDOW_MS=60000  # 1 minute window
RATE_LIMIT_MAX=60           # 60 requests per window
```

---

## Health Endpoints

### GET /api/health

Returns server health status.

**Response:**
```json
{
  "ok": true,
  "product": "OpenDocs",
  "model": "moonshotai/kimi-k2.5",
  "features": {
    "ai": true,
    "agent": true,
    "github": true,
    "website": true,
    "images": true
  }
}
```

---

## AI Endpoints

### POST /api/nvidia/chat

Send a chat completion request to NVIDIA AI.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.2
}
```

**Response:**
```json
{
  "id": "chat-xxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 10,
    "total_tokens": 30
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | array | Yes | Array of message objects |
| `temperature` | number | No | Sampling temperature (0-1), default 0.2 |

---

## Agent Endpoints

### POST /api/agent/plan

Generate AI-driven commands for OpenDocs operations.

**Request:**
```json
{
  "prompt": "Create a new page called 'Project Roadmap' with a heading and checklist",
  "context": {
    "currentPageId": "page-123",
    "selectedBlockId": "block-456",
    "pages": { ... },
    "blocks": { ... }
  }
}
```

**Response:**
```json
{
  "llm": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "{ \"reply\": \"...\", \"commands\": [...] }"
        }
      }
    ]
  }
}
```

**Available Commands:**

| Command | Description | Parameters |
|---------|-------------|------------|
| `docs.page.create` | Create new page | `title` |
| `docs.block.insertAfter` | Insert block | `pageId`, `afterBlockId`, `blockType`, `initial` |
| `docs.block.update` | Update block | `pageId`, `blockId`, `patch` |
| `docs.block.delete` | Delete block | `pageId`, `blockId` |
| `docs.block.toggleLock` | Toggle lock | `pageId`, `blockId` |
| `integration.openclaw.send` | Send message | `integrationId`, `to`, `text` |
| `db.row.insert` | Insert row | `pageId`, `blockId`, `data` |
| `n8n.node.connect` | Connect nodes | `pageId`, `blockId`, `sourceNodeBlockId` |

**Example Commands:**

```json
// Create page
{ "type": "docs.page.create", "title": "New Page" }

// Insert heading
{
  "type": "docs.block.insertAfter",
  "pageId": "page-123",
  "afterBlockId": null,
  "blockType": "heading1",
  "initial": { "text": "Welcome" }
}

// Insert checklist
{
  "type": "docs.block.insertAfter",
  "pageId": "page-123",
  "afterBlockId": "block-456",
  "blockType": "checklist",
  "initial": {
    "items": [
      { "id": "item-1", "text": "Task 1", "checked": false },
      { "id": "item-2", "text": "Task 2", "checked": false }
    ]
  }
}

// Update paragraph
{
  "type": "docs.block.update",
  "pageId": "page-123",
  "blockId": "block-789",
  "patch": { "text": "Updated content" }
}

// Delete block
{
  "type": "docs.block.delete",
  "pageId": "page-123",
  "blockId": "block-789"
}

// Toggle lock
{
  "type": "docs.block.toggleLock",
  "pageId": "page-123",
  "blockId": "block-456"
}

// Insert database row
{
  "type": "db.row.insert",
  "pageId": "page-123",
  "blockId": "db-block-1",
  "data": { "name": "John", "status": "active" }
}

// Connect n8n nodes
{
  "type": "n8n.node.connect",
  "pageId": "page-123",
  "blockId": "n8n-block-1",
  "sourceNodeBlockId": "n8n-block-2"
}
```

---

## Database Endpoints

### POST /api/db/table/create

Create a new Supabase table for a database block.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "columns": [
    { "name": "title", "type": "text" },
    { "name": "status", "type": "select" },
    { "name": "priority", "type": "number" },
    { "name": "completed", "type": "checkbox" },
    { "name": "due_date", "type": "date" }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123"
}
```

**Error Responses:**
```json
// DB not configured
{ "error": "db_not_configured", "message": "SUPABASE_DB_URL not set" }

// Invalid request
{ "error": "bad_request" }
```

### POST /api/db/table/ensure-columns

Add missing columns to an existing table.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "columns": [
    { "name": "new_column", "type": "text" }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123"
}
```

### POST /api/db/rows/create

Create a new row with ID only.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

### POST /api/db/rows/upsert

Insert or update a row with data.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123",
  "data": {
    "title": "Updated Title",
    "status": "done",
    "priority": 1,
    "completed": true
  }
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

### POST /api/db/rows/delete

Delete a row from table.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

### POST /api/db/table/drop

Drop a table (CASCADE).

**Request:**
```json
{
  "tableName": "opendocs_db_abc123"
}
```

**Response:**
```json
{
  "ok": true,
  "tableName": "opendocs_db_abc123"
}
```

---

## Automation Endpoints

### POST /api/db/automations/install

Create the automation rules table.

**Response:**
```json
{
  "ok": true
}
```

### POST /api/db/automations/rules/create

Create a new automation rule.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "whenColumn": "status",
  "whenEquals": "done",
  "thenSetColumn": "completed",
  "thenSetValue": "true"
}
```

**Response:**
```json
{
  "ok": true,
  "id": "rule-uuid-123"
}
```

### POST /api/db/automations/rules/sync

Install Postgres trigger for instant rule execution.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123"
}
```

**Response:**
```json
{
  "ok": true,
  "trigger": "trig_opendocs_apply_automations"
}
```

### POST /api/db/automations/trigger

Manually trigger automation rules for a row.

**Request:**
```json
{
  "tableName": "opendocs_db_abc123",
  "rowId": "row-uuid-123"
}
```

**Response:**
```json
{
  "ok": true,
  "executed": 2
}
```

---

## n8n Integration Endpoints

### POST /api/n8n/nodes

List available n8n node types.

**Response:**
```json
{
  "data": [
    { "name": "Webhook", "type": "n8n-nodes-base.webhook" },
    { "name": "HTTP Request", "type": "n8n-nodes-base.httpRequest" }
  ]
}
```

### POST /api/n8n/workflows/create

Create a new n8n workflow.

**Request:**
```json
{
  "title": "My Workflow"
}
```

**Response:**
```json
{
  "ok": true,
  "id": "workflow-123"
}
```

### POST /api/n8n/nodes/update

Add or update a node in a workflow.

**Request:**
```json
{
  "workflowId": "workflow-123",
  "nodeId": "node-456",
  "config": {
    "nodeType": "n8n-nodes-base.webhook",
    "name": "Webhook Trigger",
    "parameters": {
      "httpMethod": "POST",
      "path": "my-webhook"
    },
    "disabled": false
  }
}
```

**Response:**
```json
{
  "ok": true,
  "nodeId": "node-456"
}
```

### POST /api/n8n/nodes/connect

Connect two nodes in a workflow.

**Request:**
```json
{
  "workflowId": "workflow-123",
  "sourceNodeId": "node-456",
  "targetNodeId": "node-789"
}
```

**Response:**
```json
{
  "ok": true
}
```

### POST /api/n8n/nodes/toggle

Enable or disable a node.

**Request:**
```json
{
  "workflowId": "workflow-123",
  "nodeId": "node-456",
  "disabled": true
}
```

**Response:**
```json
{
  "ok": true
}
```

### POST /api/n8n/workflows/execute

Execute a workflow.

**Request:**
```json
{
  "workflowId": "workflow-123"
}
```

**Response:**
```json
{
  "ok": true,
  "executionId": "execution-123"
}
```

---

## OpenClaw Integration Endpoints

### POST /api/integrations/openclaw/send

Send a message via OpenClaw (WhatsApp/Messenger).

**Request:**
```json
{
  "integrationId": "whatsapp-main",
  "to": "+49123456789",
  "text": "Hello from OpenDocs!"
}
```

**Response:**
```json
{
  "ok": true,
  "result": {
    "messageId": "msg-123",
    "status": "sent"
  }
}
```

**Error Responses:**
```json
// OpenClaw not configured
{ "error": "openclaw_not_configured" }

// Invalid request
{ "error": "bad_request" }

// Upstream error
{ "error": "openclaw_upstream_failed", "status": 500, "message": "..." }
```

---

## Website Analysis Endpoints

### POST /api/website/analyze

Fetch and analyze a website.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "summary": {
    "title": "Example Domain",
    "h1s": ["Example Domain"],
    "h2s": ["More information"],
    "text": "This domain is for use in illustrative examples..."
  },
  "llm": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "{ \"folders\": [...], \"pages\": [...] }"
        }
      }
    ]
  }
}
```

**Error Responses:**
```json
// Bad request
{ "error": "bad_request" }

// Analysis failed
{ "error": "website_analyze_failed", "message": "..." }
```

---

## GitHub Analysis Endpoints

### POST /api/github/analyze

Analyze a GitHub repository.

**Request:**
```json
{
  "url": "https://github.com/owner/repo"
}
```

**Response:**
```json
{
  "url": "https://github.com/owner/repo",
  "owner": "owner",
  "repo": "repo",
  "llm": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "{ \"folders\": [...], \"pages\": [...] }"
        }
      }
    ]
  }
}
```

---

## Image Search Endpoints

### POST /api/images/search

Search for relevant images.

**Request:**
```json
{
  "query": "database schema diagram"
}
```

**Response:**
```json
{
  "query": "database schema diagram",
  "llm": {
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "[{ \"url\": \"...\", \"title\": \"...\", \"source\": \"...\" }]"
        }
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "error_code",
  "message": "Human-readable error description"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `bad_request` | 400 | Invalid request body |
| `unauthorized` | 401 | Missing/invalid token |
| `rate_limit` | 429 | Too many requests |
| `nvidia_chat_failed` | 500 | NVIDIA API error |
| `agent_plan_failed` | 500 | Agent plan generation failed |
| `db_not_configured` | 400 | Supabase DB not configured |
| `db_create_failed` | 500 | Table creation failed |
| `db_alter_failed` | 500 | Table alteration failed |
| `db_row_create_failed` | 500 | Row creation failed |
| `db_row_upsert_failed` | 500 | Row upsert failed |
| `db_row_delete_failed` | 500 | Row deletion failed |
| `db_drop_failed` | 500 | Table drop failed |
| `automation_install_failed` | 500 | Automation install failed |
| `automation_rule_create_failed` | 500 | Rule creation failed |
| `automation_sync_failed` | 500 | Trigger sync failed |
| `automation_trigger_failed` | 500 | Trigger execution failed |
| `n8n_not_configured` | - | n8n not configured |
| `n8n_nodes_failed` | 500 | Node list failed |
| `n8n_workflow_create_failed` | 500 | Workflow creation failed |
| `n8n_node_update_failed` | 500 | Node update failed |
| `n8n_connect_failed` | 500 | Node connection failed |
| `n8n_toggle_failed` | 500 | Node toggle failed |
| `n8n_execute_failed` | 500 | Workflow execution failed |
| `openclaw_not_configured` | 400 | OpenClaw not configured |
| `openclaw_proxy_failed` | 500 | OpenClaw proxy failed |
| `website_analyze_failed` | 500 | Website analysis failed |
| `github_analyze_failed` | 500 | GitHub analysis failed |
| `images_search_failed` | 500 | Image search failed |

---

## Best Practices

### Request Patterns

```typescript
// Always include Content-Type
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-OpenDocs-Token': token,  // If configured
  },
  body: JSON.stringify(data),
});
```

### Error Handling

```typescript
try {
  const response = await fetch('/api/endpoint', { ... });
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', data.error, data.message);
    return;
  }
  
  // Success handling
  console.log('Result:', data);
} catch (error) {
  console.error('Network error:', error);
}
```

### Rate Limiting

```typescript
// Check rate limit headers
const remaining = response.headers.get('X-RateLimit-Remaining');
if (remaining && parseInt(remaining) < 10) {
  console.warn('Approaching rate limit');
}
```

---

**Document Statistics:**
- Total Lines: 450+
- Sections: 15
- Endpoints: 20+
- Code Examples: 30+

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
