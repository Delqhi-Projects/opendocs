# SIN-Solver Critical Flows - Implementation Guide

**Version:** 1.0  
**Created:** 2026-02-14  
**Status:** Production Ready

---

## Table of Contents

1. [Captcha Solving Flow](#1-captcha-solving-flow)
2. [Voice Processing Flow](#2-voice-processing-flow)
3. [Earnings Calculation Flow](#3-earnings-calculation-flow)
4. [Supabase Real-time Sync](#4-supabase-real-time-sync)
5. [VisionClaw Autonomous Loop](#5-visionclaw-autonomous-loop)

---

## 1. Captcha Solving Flow

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Captcha      │    │ Captcha Worker  │    │ Steel Browser   │
│ Vision AI    │───▶│ (Orchestrator)  │───▶│ (CDP Session)   │
│ (Mistral)    │    │ Port: 8019      │    │ Port: 50015     │
└──────────────┘    └─────────────────┘    └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ Earnings Service│
                    │ (Wallet Update) │
                    └─────────────────┘
```

### Components

| Component      | Location                             | Port     | Description                        |
| -------------- | ------------------------------------ | -------- | ---------------------------------- |
| Captcha Vision | `services/solver-19-captcha-solver/` | Internal | Mistral Pixtral for image analysis |
| Captcha Worker | `workers/2captcha-worker/`           | 8019     | Main orchestrator                  |
| Steel Browser  | `agent-05-steel-browser/`            | 50015    | CDP WebSocket for browser control  |

### Flow Steps

1. **Detection**: Captcha detected on target website via Steel Browser
2. **Capture**: Screenshot of captcha element via CDP
3. **Vision Analysis**: Send to Mistral Pixtral for text extraction
4. **Solution**: Return solution to Steel Browser
5. **Submission**: Fill captcha field and submit
6. **Verification**: Check if captcha solved successfully
7. **Earnings**: Update wallet with earnings

### API Endpoints

```typescript
// POST /api/v1/captcha/solve
interface CaptchaSolveRequest {
  url: string;
  captchaType: "text" | "image" | "slider" | "hcaptcha" | "recaptcha";
  elementSelector?: string;
}

interface CaptchaSolveResponse {
  success: boolean;
  solution?: string;
  confidence: number;
  solveTimeMs: number;
  earnings?: {
    amount: number;
    currency: string;
  };
}
```

### n8n Workflow

```json
{
  "name": "Captcha Solving Flow",
  "nodes": [
    {
      "name": "Steel Browser Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "captcha-trigger"
      }
    },
    {
      "name": "Capture Captcha",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Capture captcha via Steel Browser CDP"
      }
    },
    {
      "name": "Mistral Vision",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.mistral.ai/v1/chat/completions",
        "body": {
          "model": "pixtral-12b-2409",
          "messages": [
            {
              "role": "user",
              "content": [
                { "type": "image_url", "image_url": "{{$json.captchaImage}}" }
              ]
            }
          ]
        }
      }
    },
    {
      "name": "Submit Solution",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Submit solution via Steel Browser CDP"
      }
    },
    {
      "name": "Update Earnings",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "earnings",
        "values": { "amount": "{{$json.earnings}}" }
      }
    }
  ]
}
```

---

## 2. Voice Processing Flow

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Voice Upload │    │ Transcription   │    │ TTS Engine      │
│ (REST API)   │───▶│ (Whisper)      │───▶│ (Edge TTS)     │
│ Port: 8080   │    │ Port: 8010     │    │ Port: 8020      │
└──────────────┘    └─────────────────┘    └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ Audio Output    │
                    │ (File/Stream)   │
                    └─────────────────┘
```

### Components

| Component     | Location                | Port | Description              |
| ------------- | ----------------------- | ---- | ------------------------ |
| Voice Upload  | `services/voice-api/`   | 8080 | REST API for file upload |
| Transcription | `services/whisper-api/` | 8010 | FastAPI with Whisper     |
| TTS Engine    | `services/edge-tts/`    | 8020 | Microsoft Edge TTS       |

### Flow Steps

1. **Upload**: User uploads audio file via REST API
2. **Validation**: Check file format (mp3, wav, ogg, webm)
3. **Transcription**: Send to Whisper for speech-to-text
4. **Processing**: Optional NLP processing of transcript
5. **TTS Generation**: Convert response to speech via Edge TTS
6. **Output**: Return audio file or stream URL

### API Endpoints

```typescript
// POST /api/v1/voice/transcribe
interface TranscribeRequest {
  audio: File;
  language?: string;
  model?: "base" | "small" | "medium" | "large";
}

interface TranscribeResponse {
  text: string;
  confidence: number;
  duration: number;
  language: string;
}

// POST /api/v1/voice/synthesize
interface SynthesizeRequest {
  text: string;
  voice: string;
  language?: string;
  outputFormat?: "mp3" | "wav" | "ogg";
}

interface SynthesizeResponse {
  audioUrl: string;
  duration: number;
  voice: string;
}
```

### n8n Workflow

```json
{
  "name": "Voice Processing Flow",
  "nodes": [
    {
      "name": "Voice Upload Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "voice-upload"
      }
    },
    {
      "name": "Validate Audio",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Validate audio format and size"
      }
    },
    {
      "name": "Transcribe",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:8010/v1/audio/transcriptions",
        "body": {
          "model": "base",
          "language": "{{$json.language}}"
        }
      }
    },
    {
      "name": "Process Text",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Optional: NLP processing"
      }
    },
    {
      "name": "Synthesize",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:8020/v1/synthesize",
        "body": {
          "text": "{{$json.processedText}}",
          "voice": "{{$json.voice}}"
        }
      }
    },
    {
      "name": "Return Audio",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "responseBody": "{{$json.audioUrl}}"
      }
    }
  ]
}
```

---

## 3. Earnings Calculation Flow

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Worker       │    │ Earnings        │    │ Wallet          │
│ Results      │───▶│ Service         │───▶│ Service         │
│ (JSON)       │    │ (Calculator)    │    │ (PostgreSQL)    │
└──────────────┘    └─────────────────┘    └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ Supabase        │
                    │ Real-time       │
                    └─────────────────┘
```

### Components

| Component        | Location                                                    | Description                              |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------- |
| Worker Results   | `workers/*/results/`                                        | JSON results from captcha/survey workers |
| Earnings Service | `extensions/opendelqhi/server/services/earnings-service.js` | Calculate and track earnings             |
| Wallet Service   | `services/wallet-api/`                                      | PostgreSQL wallet management             |

### Flow Steps

1. **Task Completion**: Worker completes task (captcha solved, survey finished)
2. **Result Submission**: Worker sends result to earnings API
3. **Validation**: Verify task completion and calculate earnings
4. **Wallet Update**: Update user wallet with earned amount
5. **Real-time Sync**: Push update to Supabase for real-time UI
6. **Notification**: Send notification to user (optional)

### Database Schema

```sql
-- Earnings table
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source VARCHAR(50) NOT NULL, -- 'captcha', 'survey', 'referral'
  task_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'paid'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  pending_balance DECIMAL(10, 2) DEFAULT 0.00,
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  total_paid DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// POST /api/v1/earnings/record
interface RecordEarningsRequest {
  userId: string;
  amount: number;
  currency: string;
  source: "captcha" | "survey" | "referral";
  taskId: string;
  metadata?: Record<string, any>;
}

interface RecordEarningsResponse {
  success: boolean;
  earningsId: string;
  newBalance: number;
  transactionId: string;
}

// GET /api/v1/wallet/:userId
interface WalletResponse {
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  transactions: Transaction[];
}
```

### n8n Workflow

```json
{
  "name": "Earnings Calculation Flow",
  "nodes": [
    {
      "name": "Worker Result Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "worker-result"
      }
    },
    {
      "name": "Validate Result",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Validate task completion and calculate earnings"
      }
    },
    {
      "name": "Record Earnings",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "earnings",
        "values": {
          "user_id": "{{$json.userId}}",
          "amount": "{{$json.amount}}",
          "source": "{{$json.source}}",
          "task_id": "{{$json.taskId}}"
        }
      }
    },
    {
      "name": "Update Wallet",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "wallets",
        "update": {
          "balance": "{{$json.newBalance}}",
          "total_earned": "{{$json.totalEarned}}"
        }
      }
    },
    {
      "name": "Supabase Sync",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://{{$env.SUPABASE_URL}}/rest/v1/rpc/notify_earnings_update",
        "headers": {
          "apikey": "{{$env.SUPABASE_KEY}}"
        }
      }
    },
    {
      "name": "Notify User",
      "type": "n8n-nodes-base.telegram",
      "parameters": {
        "operation": "sendMessage",
        "chatId": "{{$json.userTelegramId}}",
        "text": "🎉 You earned ${{$json.amount}}!"
      }
    }
  ]
}
```

---

## 4. Supabase Real-time Sync

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Local DB     │    │ Table Sync      │    │ Supabase        │
│ (Postgres)   │───▶│ (pg-trigger)    │───▶│ Real-time       │
│ Port: 5432   │    │                 │    │ (WebSocket)     │
└──────────────┘    └─────────────────┘    └─────────────────┘
                           │
                           ▼
                    ┌─────────────────┐
                    │ Edge Functions  │
                    │ (Serverless)    │
                    └─────────────────┘
```

### Components

| Component      | Location                   | Description                           |
| -------------- | -------------------------- | ------------------------------------- |
| Local Postgres | `room-03-archiv-postgres/` | Primary database                      |
| Table Sync     | `services/table-sync/`     | pg_trgm triggers for change detection |
| Supabase       | Cloud                      | Real-time WebSocket + Edge Functions  |

### Flow Steps

1. **Change Detection**: INSERT/UPDATE/DELETE triggers on local Postgres
2. **Event Creation**: Trigger creates event in `sync_events` table
3. **Edge Function**: Supabase Edge Function processes event
4. **Real-time Broadcast**: WebSocket sends update to connected clients
5. **Client Update**: UI updates automatically via Supabase client

### Database Schema

```sql
-- Sync events table
CREATE TABLE sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Trigger function
CREATE OR REPLACE FUNCTION sync_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO sync_events (table_name, record_id, operation, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to earnings table
CREATE TRIGGER earnings_sync_trigger
AFTER INSERT OR UPDATE OR DELETE ON earnings
FOR EACH ROW EXECUTE FUNCTION sync_trigger();
```

### Supabase Edge Function

```typescript
// supabase/functions/sync-earnings/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_KEY")!,
);

serve(async (req) => {
  const { table, record_id, operation, data } = await req.json();

  // Broadcast to all connected clients
  const channel = supabase.channel(`sync:${table}`);
  await channel.send({
    type: "postgres_changes",
    event: operation,
    schema: "public",
    table: table,
    record: data,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Client Integration

```typescript
// Frontend subscription
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

supabase
  .channel("custom-insert-channel")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "earnings",
      filter: "user_id=eq." + userId,
    },
    (payload) => {
      console.log("New earnings:", payload.new);
      updateEarningsDisplay(payload.new);
    },
  )
  .subscribe();
```

---

## 5. VisionClaw Autonomous Loop

### Architecture

```
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ VisionClaw   │    │ Automation      │    │ Steel Browser   │
│ Gateway      │◀──▶│ Engine          │◀──▶│ (CDP Session)   │
│ Port: 18790  │    │ (n8n/AutoGPT)   │    │ Port: 50015     │
└──────────────┘    └─────────────────┘    └─────────────────┘
         │                   │
         ▼                   ▼
┌──────────────┐    ┌─────────────────┐
│ Task Queue   │    │ Result Store    │
│ (Redis)      │    │ (Postgres)      │
└──────────────┘    └─────────────────┘
```

### Components

| Component          | Location                      | Port  | Description               |
| ------------------ | ----------------------------- | ----- | ------------------------- |
| VisionClaw Gateway | `gateway/`                    | 18790 | Main API gateway          |
| Automation Engine  | `services/automation-engine/` | 8085  | n8n workflow orchestrator |
| Steel Browser      | `agent-05-steel-browser/`     | 50015 | CDP browser control       |
| Task Queue         | `room-04-redis/`              | 6379  | Redis for async tasks     |

### Flow Steps

1. **Task Definition**: User or system defines automation task
2. **Task Queue**: Task added to Redis queue
3. **Automation Engine**: n8n picks up task, determines required actions
4. **Browser Control**: Steel Browser executes actions via CDP
5. **Vision Analysis**: Each step verified with Mistral Vision
6. **Result Storage**: Results saved to Postgres
7. **Notification**: User notified of completion
8. **Loop**: If more steps, return to step 3

### Task Definition Schema

```typescript
interface AutomationTask {
  id: string;
  type:
    | "web_automation"
    | "data_extraction"
    | "form_filling"
    | "account_creation";
  url: string;
  steps: AutomationStep[];
  options: {
    maxIterations: number;
    timeout: number;
    retryOnFailure: boolean;
    screenshotEachStep: boolean;
  };
  status: "pending" | "running" | "completed" | "failed";
}

interface AutomationStep {
  id: string;
  action:
    | "navigate"
    | "click"
    | "type"
    | "select"
    | "extract"
    | "wait"
    | "screenshot";
  selector?: string;
  value?: string;
  verifyWithVision?: boolean;
  onSuccess?: string; // next step id
  onFailure?: "retry" | "skip" | "abort";
}
```

### API Endpoints

```typescript
// POST /api/v1/automation/start
interface StartAutomationRequest {
  task: AutomationTask;
}

interface StartAutomationResponse {
  taskId: string;
  status: "queued" | "running";
  estimatedDuration: number;
}

// GET /api/v1/automation/:taskId/status
interface AutomationStatusResponse {
  taskId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep?: number;
  totalSteps: number;
  screenshots?: string[];
  results?: Record<string, any>;
  error?: string;
}

// POST /api/v1/automation/:taskId/stop
interface StopAutomationRequest {
  taskId: string;
  saveState: boolean;
}
```

### n8n Workflow

```json
{
  "name": "VisionClaw Autonomous Loop",
  "nodes": [
    {
      "name": "Task Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "automation-start"
      }
    },
    {
      "name": "Parse Task",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Parse task definition and extract steps"
      }
    },
    {
      "name": "Get Next Step",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Get next step from task.steps based on currentStep"
      }
    },
    {
      "name": "Execute Step",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:50015/v1/cdp/execute",
        "body": {
          "action": "{{$json.action}}",
          "selector": "{{$json.selector}}",
          "value": "{{$json.value}}"
        }
      }
    },
    {
      "name": "Vision Verification",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.mistral.ai/v1/chat/completions",
        "body": {
          "model": "pixtral-12b-2409",
          "messages": [
            {
              "role": "user",
              "content": [
                { "type": "image_url", "image_url": "{{$json.screenshot}}" }
              ]
            }
          ]
        }
      }
    },
    {
      "name": "Store Result",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "automation_tasks",
        "update": {
          "current_step": "{{$json.nextStep}}",
          "last_result": "{{$json.result}}"
        }
      }
    },
    {
      "name": "Check Completion",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "bool1": "{{$json.completed}}",
          "operator": "equal",
          "bool2": true
        }
      }
    },
    {
      "name": "Loop Over Items",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1
      }
    }
  ]
}
```

---

## Integration Points

### Environment Variables

```bash
# Captcha Solving
MISTRAL_API_KEY=lteNYoXTsKUz6oYLGEHdxs1OTLTAkaw4
STEEL_BROWSER_URL=ws://localhost:50015

# Voice Processing
WHISPER_API_URL=http://localhost:8010
EDGE_TTS_URL=http://localhost:8020

# Earnings
POSTGRES_URL=postgresql://ceo_admin:secure_pass@localhost:5432/sin_solver
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key

# VisionClaw
REDIS_URL=redis://localhost:6379
AUTOMATION_ENGINE_URL=http://localhost:8085
```

### Health Checks

```bash
# Captcha Worker
curl http://localhost:8019/health

# Voice API
curl http://localhost:8080/health

# Earnings Service
curl http://localhost:8081/health

# Supabase
curl https://xxx.supabase.co/health

# VisionClaw Gateway
curl http://localhost:18790/health
```

---

## Testing

### Unit Tests

```bash
# Test captcha flow
npm test -- --grep "captcha"

# Test voice flow
npm test -- --grep "voice"

# Test earnings flow
npm test -- --grep "earnings"
```

### Integration Tests

```bash
# Run full flow tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

---

## Monitoring

### Grafana Dashboards

- Captcha Solving: `/monitoring/grafana/dashboards/captcha-dashboard.json`
- Earnings: `/monitoring/grafana/dashboards/earnings-dashboard.json`
- Voice: `/monitoring/grafana/dashboards/voice-dashboard.json`

### Metrics

| Metric                  | Description                 | Alert Threshold |
| ----------------------- | --------------------------- | --------------- |
| captcha_solve_time      | Time to solve captcha       | > 10s           |
| voice_transcribe_time   | Time to transcribe audio    | > 30s           |
| earnings_total          | Total earnings today        | < $0 (negative) |
| automation_success_rate | % of successful automations | < 80%           |

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-14  
**Next Review:** 2026-02-21
