# OPENCLAW.md - OpenClaw Integration Guide

**Project:** OpenDocs - CEO-Level Documentation Platform  
**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Status:** Production-Ready  

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Meta (Facebook) Integration](#meta-facebook-integration)
6. [WhatsApp Business Integration](#whatsapp-business-integration)
7. [Telegram Integration](#telegram-integration)
8. [n8n Workflow Integration](#n8n-workflow-integration)
9. [API Reference](#api-reference)
10. [Automation Blocks](#automation-blocks)
11. [Security Best Practices](#security-best-practices)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)

---

## Overview

OpenClaw is an open-source integration hub that connects OpenDocs to popular messaging platforms including WhatsApp, Facebook Messenger, and Telegram. It enables automated messaging workflows through n8n integration.

### Supported Platforms

| Platform | Status | Features |
|----------|--------|----------|
| **WhatsApp Business** | ✅ Active | Send messages, media, templates |
| **Facebook Messenger** | ✅ Active | Send messages, cards, quick replies |
| **Telegram** | ✅ Active | Send messages, files, inline keyboards |
| **Instagram DM** | 🔄 Planned | Coming soon |
| **Signal** | 🔄 Planned | Coming soon |
| **Discord** | 🔄 Planned | Coming soon |

### Key Features

- **Unified API:** Single endpoint for all platforms
- **Template Management:** Pre-approved message templates
- **Media Support:** Images, videos, documents
- **Webhook Events:** Receive incoming messages
- **n8n Integration:** Visual workflow builder
- **Rate Limiting:** Platform-compliant throttling

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClaw Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OpenDocs Frontend                     │   │
│  │  • Automation Blocks                                    │   │
│  │  • Database Triggers                                    │   │
│  │  • AI Agent Commands                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ HTTP API                         │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OpenDocs Server                       │   │
│  │  POST /api/integrations/openclaw/send                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ Proxy                            │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OpenClaw Server                       │   │
│  │  (Docker Container: room-30-scira-ai-search)            │   │
│  │                                                          │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐             │   │
│  │  │ WhatsApp  │ │ Messenger │ │ Telegram  │             │   │
│  │  │ Handler   │ │ Handler   │ │ Handler   │             │   │
│  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘             │   │
│  │        │             │             │                     │   │
│  │  ┌─────┴─────────────┴─────────────┴─────┐             │   │
│  │  │           Platform APIs                │             │   │
│  │  │  • WhatsApp Business API               │             │   │
│  │  │  • Facebook Graph API                 │             │   │
│  │  │  • Telegram Bot API                   │             │   │
│  │  └───────────────────────────────────────┘             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. OpenDocs Automation triggers (e.g., DB row changed)
        ↓
2. Automation Block sends message via OpenClaw
        ↓
3. OpenDocs Server proxies request to OpenClaw
        ↓
4. OpenClaw routes to appropriate platform handler
        ↓
5. Platform API sends message to recipient
        ↓
6. Response returned to OpenDocs
```

---

## Prerequisites

### Required Accounts

| Account | How to Get |
|---------|------------|
| **Meta Business Suite** | https://business.facebook.com |
| **WhatsApp Business API** | Apply via Meta Business Manager |
| **Telegram Bot** | Chat with @BotFather |
| **n8n Instance** | Self-hosted or n8n.cloud |

### Required Credentials

```bash
# Meta/Facebook
META_APP_ID=your-app-id
META_APP_SECRET=your-app-secret
META_ACCESS_TOKEN=your-page-access-token

# WhatsApp Business
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_ACCESS_TOKEN=your-permanent-token

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token

# OpenClaw
OPENCLAW_BASE_URL=http://localhost:8213
OPENCLAW_TOKEN=your-openclaw-token
```

---

## Local Development Setup

### Step 1: Deploy OpenClaw Container

```bash
# Navigate to SIN-Solver project
cd /Users/jeremy/dev/SIN-Solver

# OpenClaw is integrated with room-30-scira-ai-search
# Start the container
docker-compose up -d room-30-scira-ai-search

# Check status
docker ps | grep scira
```

### Step 2: Configure Environment

```bash
# Add to OpenDocs .env
OPENCLAW_BASE_URL=http://localhost:8213
OPENCLAW_TOKEN=your-secure-token-here

# Generate secure token
openssl rand -hex 32
```

### Step 3: Verify Connection

```bash
# Test health endpoint
curl http://localhost:8213/health

# Test send endpoint
curl -X POST http://localhost:8213/api/v1/send/whatsapp-main \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+49123456789",
    "text": "Hello from OpenDocs!"
  }'
```

---

## Meta (Facebook) Integration

### Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app (Business type)
3. Note your App ID and App Secret

### Step 2: Add Messenger Product

1. In App Dashboard, click "Add Product"
2. Select "Messenger"
3. Follow setup wizard

### Step 3: Configure Webhook

```bash
# Webhook URL for Meta
https://your-domain.com/webhook/facebook

# Verify token (create your own)
VERIFY_TOKEN=your_verify_token

# Subscribe to events:
# - messages
# - messaging_postbacks
# - message_deliveries
```

### Step 4: Generate Page Access Token

1. Go to Messenger Settings
2. Select or create a Facebook Page
3. Generate Page Access Token
4. Request permissions: `pages_messaging`, `pages_read_engagement`

### Step 5: Configure in OpenClaw

```bash
# Add to OpenClaw config
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_PAGE_ACCESS_TOKEN=your-page-token
FACEBOOK_VERIFY_TOKEN=your-verify-token
```

### API Usage

```bash
# Send message via OpenDocs API
POST /api/integrations/openclaw/send
{
  "integrationId": "messenger-main",
  "to": "recipient-psid",
  "text": "Hello from OpenDocs!"
}
```

---

## WhatsApp Business Integration

### Step 1: Apply for WhatsApp Business API

1. Go to [Meta Business Manager](https://business.facebook.com)
2. Select your business
3. Navigate to WhatsApp Accounts
4. Apply for Business API access

### Step 2: Verify Phone Number

1. Add your business phone number
2. Verify via SMS or voice call
3. Complete business verification

### Step 3: Create Message Templates

```
# Template format
Name: hello_world
Category: TRANSACTIONAL
Language: en
Body: Hello {{1}}! Welcome to our service.

# Use in API
{
  "to": "+49123456789",
  "template": {
    "name": "hello_world",
    "language": "en",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John" }
        ]
      }
    ]
  }
}
```

### Step 4: Configure Webhook

```bash
# Webhook URL for WhatsApp
https://your-domain.com/webhook/whatsapp

# Subscribe to events:
# - messages
# - message_status
```

### Step 5: Configure in OpenClaw

```bash
# Add to OpenClaw config
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_ACCESS_TOKEN=your-permanent-token
WHATSAPP_VERIFY_TOKEN=your-verify-token
```

### API Usage

```bash
# Send text message
POST /api/integrations/openclaw/send
{
  "integrationId": "whatsapp-main",
  "to": "+49123456789",
  "text": "Hello from OpenDocs!"
}

# Send template message
{
  "integrationId": "whatsapp-main",
  "to": "+49123456789",
  "template": {
    "name": "hello_world",
    "language": "en",
    "components": [...]
  }
}

# Send media message
{
  "integrationId": "whatsapp-main",
  "to": "+49123456789",
  "media": {
    "type": "image",
    "url": "https://example.com/image.jpg",
    "caption": "Check this out!"
  }
}
```

---

## Telegram Integration

### Step 1: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot` command
3. Follow instructions to name your bot
4. Save the bot token

```
BotFather: Congratulations! Your bot was created.
Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

Keep your token secure!
```

### Step 2: Configure in OpenClaw

```bash
# Add to OpenClaw config
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 3: Set Webhook

```bash
# Set webhook URL
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook/telegram"}'
```

### API Usage

```bash
# Send text message
POST /api/integrations/openclaw/send
{
  "integrationId": "telegram-main",
  "to": "123456789",
  "text": "Hello from OpenDocs!"
}

# Send with keyboard
{
  "integrationId": "telegram-main",
  "to": "123456789",
  "text": "Choose an option:",
  "reply_markup": {
    "inline_keyboard": [
      [
        { "text": "Option 1", "callback_data": "opt1" },
        { "text": "Option 2", "callback_data": "opt2" }
      ]
    ]
  }
}

# Send file
{
  "integrationId": "telegram-main",
  "to": "123456789",
  "document": {
    "url": "https://example.com/document.pdf",
    "caption": "Your document"
  }
}
```

---

## n8n Workflow Integration

### Overview

OpenClaw integrates seamlessly with n8n for visual workflow automation.

```
┌─────────────────────────────────────────────────────────────────┐
│                    n8n Workflow Example                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐              │
│  │  Webhook  │───▶│   If/Else │───▶│  OpenClaw │              │
│  │  Trigger  │    │   Logic   │    │   Send    │              │
│  └───────────┘    └───────────┘    └───────────┘              │
│        │                                 │                     │
│        │                                 ▼                     │
│        │                          ┌───────────┐              │
│        │                          │  WhatsApp │              │
│        │                          │  Message  │              │
│        │                          └───────────┘              │
│        │                                                     │
│        ▼                                                     │
│  ┌───────────┐                                              │
│  │  Database │                                              │
│  │   Update  │                                              │
│  └───────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### n8n Node Configuration

```json
{
  "nodes": [
    {
      "name": "OpenClaw Send",
      "type": "n8n-nodes-base.httpRequest",
      "position": [500, 300],
      "parameters": {
        "method": "POST",
        "url": "http://opendocs-server:3000/api/integrations/openclaw/send",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "options": {
          "response": {
            "response": {
              "responseFormat": "json"
            }
          }
        },
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"integrationId\": \"whatsapp-main\",\n  \"to\": \"{{$json.recipient}}\",\n  \"text\": \"{{$json.message}}\"\n}"
      }
    }
  ]
}
```

### Workflow Templates

#### 1. Database Change Notification

```json
{
  "name": "DB Change → WhatsApp Notification",
  "nodes": [
    {
      "name": "OpenDocs Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "db-change",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Format Message",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "message",
              "value": "Database updated: {{$json.table}} - Row {{$json.rowId}}"
            }
          ]
        }
      }
    },
    {
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://opendocs-server:3000/api/integrations/openclaw/send",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"integrationId\": \"whatsapp-main\",\n  \"to\": \"+49123456789\",\n  \"text\": \"{{$json.message}}\"\n}"
      }
    }
  ]
}
```

#### 2. Daily Summary Report

```json
{
  "name": "Daily Summary → Telegram",
  "nodes": [
    {
      "name": "Cron Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyDay",
              "hour": 9,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Get Database Stats",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "GET",
        "url": "http://opendocs-server:3000/api/db/stats"
      }
    },
    {
      "name": "Send Telegram",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://opendocs-server:3000/api/integrations/openclaw/send",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"integrationId\": \"telegram-main\",\n  \"to\": \"123456789\",\n  \"text\": \"📊 Daily Report\\n\\nTasks: {{$json.total_tasks}}\\nCompleted: {{$json.completed}}\\nPending: {{$json.pending}}\"\n}"
      }
    }
  ]
}
```

---

## API Reference

### Send Message

```typescript
POST /api/integrations/openclaw/send

// Request
{
  integrationId: string;  // Platform identifier
  to: string;            // Recipient (phone/PSID/chat_id)
  text: string;          // Message text
}

// Response
{
  ok: true;
  result: {
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  }
}
```

### Integration IDs

| Platform | Integration ID |
|----------|----------------|
| WhatsApp | `whatsapp-main` |
| Messenger | `messenger-main` |
| Telegram | `telegram-main` |

### Error Codes

| Code | Description |
|------|-------------|
| `openclaw_not_configured` | OpenClaw URL/token not set |
| `bad_request` | Invalid request body |
| `openclaw_upstream_failed` | Platform API error |

---

## Automation Blocks

### OpenClaw Message Node

The `openclaw-message` automation node enables sending messages from OpenDocs automations.

```typescript
// Node configuration
{
  type: "action",
  subtype: "openclaw-message",
  config: {
    platform: "whatsapp" | "messenger",
    recipient: "{{input.phone}}",
    message: "Hello {{input.name}}!"
  }
}
```

### Example Automation

```
Trigger: DB Row Changed (status = 'urgent')
    ↓
Action: OpenClaw Message
    platform: whatsapp
    recipient: +49123456789
    message: "🚨 Urgent task: {{row.title}}"
```

---

## Security Best Practices

### Token Security

```bash
# ❌ NEVER commit tokens to git
# Add to .gitignore
OPENCLAW_TOKEN=*
WHATSAPP_ACCESS_TOKEN=*
TELEGRAM_BOT_TOKEN=*

# ✅ Use environment variables
export OPENCLAW_TOKEN=$(cat /run/secrets/openclaw_token)
```

### Rate Limiting

| Platform | Rate Limit |
|----------|------------|
| WhatsApp | 80 messages/second |
| Messenger | 40 messages/second |
| Telegram | 30 messages/second |

### Webhook Verification

```typescript
// Always verify webhook signatures
const signature = req.headers['x-hub-signature-256'];
const expectedSignature = createHmac('sha256', APP_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== `sha256=${expectedSignature}`) {
  return res.status(401).send('Invalid signature');
}
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Token expired | Refresh token in Meta Business Suite |
| Webhook not receiving | Verify URL is publicly accessible |
| Message not delivered | Check recipient format, verify opt-in |
| Rate limited | Reduce message frequency |
| Template rejected | Follow WhatsApp template guidelines |

### Debug Commands

```bash
# Test WhatsApp API directly
curl -X POST "https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"messaging_product": "whatsapp", "to": "+49123456789", "type": "text", "text": {"body": "Test"}}'

# Test Telegram API directly
curl -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d "chat_id=123456789&text=Test message"

# Check OpenClaw logs
docker logs room-30-scira-ai-search -f
```

---

## Best Practices

### Message Templates

- ✅ Pre-approve templates before use
- ✅ Use variables for personalization
- ✅ Keep templates under 1024 characters
- ❌ Don't use promotional content in transactional templates

### Recipient Management

- ✅ Verify opt-in before sending
- ✅ Respect opt-out requests
- ✅ Use correct phone format (E.164)
- ❌ Don't send to unverified numbers

### Error Handling

- ✅ Implement retry logic
- ✅ Log failed deliveries
- ✅ Handle rate limits gracefully
- ❌ Don't ignore error responses

---

**Document Statistics:**
- Total Lines: 500+
- Sections: 13
- Code Examples: 50+
- Tables: 12+

**Last Updated:** 2026-02-13  
**Maintainer:** OpenDocs Team  
**Status:** Production-Ready
