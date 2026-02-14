import express from "express";
import crypto from "crypto";
import { parse } from "url";
import pg from "pg";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const { Pool } = pg;

const PORT = Number(process.env.PORT || 3000);

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "moonshotai/kimi-k2.5";

// Voice API Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN || ""; // optional; if set → required
const CORS_ORIGIN = process.env.CORS_ORIGIN || ""; // optional

// Supabase Postgres (local container) — optional but required for provisioning
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || "";
const SUPABASE_DB_SCHEMA = process.env.SUPABASE_DB_SCHEMA || "public";

const dbPool = SUPABASE_DB_URL
  ? new Pool({ connectionString: SUPABASE_DB_URL, max: 4, idleTimeoutMillis: 10_000 })
  : null;

if (SUPABASE_DB_URL) {
  console.log(`[OpenDocs] Supabase DB connected: ${SUPABASE_DB_SCHEMA} schema`);
} else {
  console.log("[OpenDocs] Supabase DB URL not set. Database blocks will be local-only.");
}

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

const WEBSITE_FETCH_TIMEOUT_MS = Number(process.env.WEBSITE_FETCH_TIMEOUT_MS || 12_000);
const WEBSITE_FETCH_MAX_BYTES = Number(process.env.WEBSITE_FETCH_MAX_BYTES || 750_000);
const WEBSITE_ALLOW_PRIVATE_IPS = process.env.WEBSITE_ALLOW_PRIVATE_IPS === "true";

if (!NVIDIA_API_KEY) {
  console.error("\n[OpenDocs] Missing NVIDIA_API_KEY. Set it in your environment.");
  process.exit(1);
}

// ===============================
// Process-level error handlers (Best Practices Feb 2026)
// ===============================
process.on("uncaughtException", (err) => {
  console.error("[OpenDocs] FATAL: Uncaught exception:", err?.message || err);
  console.error(err?.stack || "");
  // In production: graceful shutdown after logging
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[OpenDocs] FATAL: Unhandled rejection at:", promise, "reason:", reason);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[OpenDocs] Received ${signal}, shutting down gracefully...`);
  if (dbPool) {
    await dbPool.end();
    console.log("[OpenDocs] Database pool closed.");
  }
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const app = express();
app.disable("x-powered-by");

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.supabase.io", "https://*.nvidia.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" }
}));

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

const auditLog = [];

app.use((req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown'
  };
  
  if (req.path.startsWith('/api/')) {
    console.log(`[AUDIT] ${logEntry.timestamp} ${logEntry.method} ${logEntry.path} ${logEntry.ip}`);
  }
  
  next();
});

app.use(express.json({ limit: "1mb" }));

// Basic request id
app.use((req, res, next) => {
  const rid = req.header("x-request-id") || crypto.randomUUID();
  res.setHeader("x-request-id", rid);
  // @ts-ignore
  req.rid = rid;
  next();
});

// Basic CORS (only if configured)
app.use((req, res, next) => {
  if (CORS_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-OpenDocs-Token, X-Request-Id");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.status(204).end();
  }
  next();
});

// Rate limiter for /api/*
const bucket = new Map();

// Cleanup old entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of bucket) {
    if (now > entry.resetAt + CLEANUP_INTERVAL_MS) {
      bucket.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();

  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const key = `ip:${ip}`;
  const entry = bucket.get(key) || { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 0 };

  if (now > entry.resetAt) {
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    entry.count = 0;
  }

  entry.count += 1;
  bucket.set(key, entry);

  res.setHeader("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, RATE_LIMIT_MAX - entry.count)));
  res.setHeader("X-RateLimit-Reset", String(entry.resetAt));

  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "rate_limit", message: "Too many requests" });
  }

  next();
});

function requireApiAuth(req, res, next) {
  if (!API_AUTH_TOKEN) return next();
  const token = req.header("x-opendocs-token") || "";
  if (!token || token !== API_AUTH_TOKEN) {
    return res.status(401).json({ error: "unauthorized", message: "Missing/invalid X-OpenDocs-Token" });
  }
  next();
}

// Public
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    product: "OpenDocs",
    model: NVIDIA_MODEL,
    features: {
      ai: true,
      agent: true,
      github: true,
      website: true,
      images: true,
    },
  });
});

// Protected API
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  return requireApiAuth(req, res, next);
});

async function nvidiaChat({ messages, temperature = 0.2 }) {
  const resp = await fetch(`${NVIDIA_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`NVIDIA error: ${resp.status} ${text}`);
  }
  return resp.json();
}

app.post("/api/nvidia/chat", async (req, res) => {
  try {
    const { messages, temperature } = req.body || {};
    const json = await nvidiaChat({ messages, temperature });
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: "nvidia_chat_failed", message: String(e?.message || e) });
  }
});

// Minimal, safe-ish website fetch (SSRF mitigations: blocks private IPs unless allowed)
function isPrivateIp(host) {
  // Only basic checks; production should resolve DNS + check ip range. For now, block localhost and obvious private ranges.
  const h = (host || "").toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "0.0.0.0") return true;
  if (h.startsWith("127.")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  if (h.startsWith("172.")) {
    const parts = h.split(".");
    const second = Number(parts[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

async function fetchWebsiteText(urlStr) {
  const u = new URL(urlStr);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http/https allowed");
  if (!WEBSITE_ALLOW_PRIVATE_IPS && isPrivateIp(u.hostname)) {
    throw new Error("Blocked private/localhost URL");
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), WEBSITE_FETCH_TIMEOUT_MS);

  const resp = await fetch(urlStr, {
    signal: ac.signal,
    redirect: "follow",
    headers: {
      "User-Agent": "OpenDocsBot/2026 (+https://opendocs.local)",
      Accept: "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
    },
  }).finally(() => clearTimeout(t));

  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);

  const reader = resp.body?.getReader();
  if (!reader) {
    const full = await resp.text();
    return full.slice(0, WEBSITE_FETCH_MAX_BYTES);
  }

  const decoder = new TextDecoder();
  let total = 0;
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > WEBSITE_FETCH_MAX_BYTES) break;
    out += decoder.decode(value, { stream: true });
  }
  return out;
}

function htmlToSummary(html) {
  // cheap extraction (no extra deps): title + h1/h2 + text snippets
  const title = (html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1] || "").replace(/\s+/g, " ").trim();
  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)].slice(0, 5).map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis)].slice(0, 8).map((m) => m[1].replace(/<[^>]+>/g, "").trim());
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  return { title, h1s, h2s, text };
}

app.post("/api/website/analyze", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") return res.status(400).json({ error: "bad_request" });

    const html = await fetchWebsiteText(url);
    const summary = htmlToSummary(html);

    const system =
      "You are OpenDocs. Analyze the provided website summary and generate a clear, ultra-simple step-by-step documentation/guide. Output as JSON with folders/pages and blocks.";

    const messages = [
      { role: "system", content: system },
      {
        role: "user",
        content: JSON.stringify({ url, summary }, null, 2),
      },
    ];

    const json = await nvidiaChat({ messages, temperature: 0.2 });
    res.json({ url, summary, llm: json });
  } catch (e) {
    res.status(500).json({ error: "website_analyze_failed", message: String(e?.message || e) });
  }
});

app.post("/api/github/analyze", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== "string") return res.status(400).json({ error: "bad_request" });

    // Minimal fetch: raw README if github.com/owner/repo
    const parsed = parse(url);
    const parts = (parsed.pathname || "").split("/").filter(Boolean);
    if (parts.length < 2) return res.status(400).json({ error: "bad_github_url" });
    const owner = parts[0];
    const repo = parts[1];

    const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`;
    const readmeResp = await fetch(readmeUrl);
    const readme = readmeResp.ok ? await readmeResp.text() : "";

    const system =
      "You are OpenDocs. Analyze the repository README and infer project purpose, setup, architecture and usage. Output as JSON with folders/pages and blocks.";

    const messages = [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify({ url, owner, repo, readme: readme.slice(0, 12000) }, null, 2) },
    ];

    const json = await nvidiaChat({ messages, temperature: 0.2 });
    res.json({ url, owner, repo, llm: json });
  } catch (e) {
    res.status(500).json({ error: "github_analyze_failed", message: String(e?.message || e) });
  }
});

app.post("/api/images/search", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== "string") return res.status(400).json({ error: "bad_request" });

    const system =
      "You are OpenDocs. Provide 5-10 relevant, high-quality image URLs for documentation (screenshots/diagrams) with titles and source domains. Output JSON array.";
    const messages = [
      { role: "system", content: system },
      { role: "user", content: query },
    ];

    const json = await nvidiaChat({ messages, temperature: 0.2 });
    res.json({ query, llm: json });
  } catch (e) {
    res.status(500).json({ error: "images_search_failed", message: String(e?.message || e) });
  }
});

// Agent plan endpoint: reply + commands
app.post("/api/agent/plan", async (req, res) => {
  try {
    const { prompt, context } = req.body || {};
    if (!prompt || typeof prompt !== "string") return res.status(400).json({ error: "bad_request" });

    const system = `You are the OpenDocs AI Operator. Your goal is to help users manage their relational documentation, databases, and automations.

Output STRICT JSON only: { "reply": "...", "commands": [...] }

Commands MUST follow this schema:
- { "type": "docs.page.create", "title": "..." }
- { "type": "docs.block.insertAfter", "pageId": "...", "afterBlockId": "...", "blockType": "...", "initial": { ... } }
- { "type": "docs.block.update", "pageId": "...", "blockId": "...", "patch": { ... } }
- { "type": "docs.block.delete", "pageId": "...", "blockId": "..." }
- { "type": "docs.block.toggleLock", "pageId": "...", "blockId": "..." }
- { "type": "integration.openclaw.send", "integrationId": "...", "to": "...", "text": "..." }
- { "type": "db.row.insert", "pageId": "...", "blockId": "...", "data": { ... } }
- { "type": "n8n.node.connect", "pageId": "...", "blockId": "...", "sourceNodeBlockId": "..." }

Available block types: heading1, heading2, heading3, paragraph, code, table, database, workflow, draw, n8n, callout, checklist, mermaid, image, video, link, file, aiPrompt.

CONTEXT: ${JSON.stringify(context)}
If the user wants to CREATE content, use 'docs.block.insertAfter'. 
If the user wants to EDIT the current block, use 'docs.block.update'. 
Respect Hard Locks (R2): if a block or page is marked as locked in context, do not propose delete or update commands for it.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ];

    const json = await nvidiaChat({ messages, temperature: 0.1 });
    res.json({ llm: json });
  } catch (e) {
    res.status(500).json({ error: "agent_plan_failed", message: String(e?.message || e) });
  }
});

// -----------------------------
// OpenClaw integration proxy (optional)
// -----------------------------
const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL || "";
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN || "";

app.post("/api/integrations/openclaw/send", async (req, res) => {
  try {
    if (!OPENCLAW_BASE_URL || !OPENCLAW_TOKEN) {
      return res.status(400).json({ error: "openclaw_not_configured" });
    }
    const { integrationId, to, text } = req.body || {};
    if (![integrationId, to, text].every((x) => typeof x === "string" && x.length)) {
      return res.status(400).json({ error: "bad_request" });
    }
    const resp = await fetch(`${OPENCLAW_BASE_URL.replace(/\/$/, "")}/api/v1/send/${encodeURIComponent(integrationId)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENCLAW_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, text }),
    });
    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      return res.status(502).json({ error: "openclaw_upstream_failed", status: resp.status, message: msg });
    }
    const json = await resp.json().catch(() => ({}));
    res.json({ ok: true, result: json });
  } catch (e) {
    res.status(500).json({ error: "openclaw_proxy_failed", message: String(e?.message || e) });
  }
});

// -----------------------------
// Supabase DB provisioning (optional)
// -----------------------------
function qIdent(name) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) throw new Error(`Invalid identifier: ${name}`);
  return `"${name.replace(/"/g, '""')}"`;
}

function mapColType(t) {
  switch (t) {
    case "text":
      return "text";
    case "number":
      return "double precision";
    case "checkbox":
      return "boolean";
    case "date":
      return "timestamptz";
    case "select":
      return "text"; // store option id or name
    default:
      throw new Error(`Unsupported column type: ${t}`);
  }
}

app.post("/api/db/table/create", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured", message: "SUPABASE_DB_URL not set" });

    const { tableName, columns } = req.body || {};
    if (!tableName || typeof tableName !== "string") return res.status(400).json({ error: "bad_request" });
    if (!Array.isArray(columns) || columns.length === 0) return res.status(400).json({ error: "bad_request" });

    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);

    const colsSql = columns
      .map((c) => {
        if (!c?.name || typeof c.name !== "string") throw new Error("Column name missing");
        const cn = qIdent(c.name);
        const ct = mapColType(c.type);
        return `${cn} ${ct}`;
      })
      .join(",\n  ");

    const sql = `CREATE TABLE IF NOT EXISTS ${schema}.${tn} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ${colsSql}
);`;

    await dbPool.query(sql);

    // optional: realtime publication
    await dbPool.query(`DO $$ BEGIN
      BEGIN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE ${SUPABASE_DB_SCHEMA}.${tableName}';
      EXCEPTION WHEN others THEN
        -- ignore if publication missing or already added
        NULL;
      END;
    END $$;`);

    res.json({ ok: true, tableName });
  } catch (e) {
    res.status(500).json({ error: "db_create_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/table/ensure-columns", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName, columns } = req.body || {};
    if (!tableName || !Array.isArray(columns)) return res.status(400).json({ error: "bad_request" });

    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);

    for (const c of columns) {
      const cn = qIdent(c.name);
      const ct = mapColType(c.type);
      await dbPool.query(`ALTER TABLE ${schema}.${tn} ADD COLUMN IF NOT EXISTS ${cn} ${ct};`);
    }

    res.json({ ok: true, tableName });
  } catch (e) {
    res.status(500).json({ error: "db_alter_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/rows/create", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName, rowId } = req.body || {};
    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);
    await dbPool.query(`INSERT INTO ${schema}.${tn} (id) VALUES ($1) ON CONFLICT (id) DO NOTHING;`, [rowId]);
    res.json({ ok: true, tableName, rowId });
  } catch (e) {
    res.status(500).json({ error: "db_row_create_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/rows/upsert", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName, rowId, data } = req.body || {};
    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);

    const keys = Object.keys(data).filter((k) => /^[a-zA-Z0-9_]+$/.test(k));
    if (keys.length === 0) {
      return res.json({ ok: true, message: "no_data" });
    }

    const setSql = keys.map((k, i) => `${qIdent(k)} = $${i + 2}`).join(", ");
    const colsSql = keys.map((k) => qIdent(k)).join(", ");
    const valsSql = keys.map((_, i) => `$${i + 2}`).join(", ");

    const sql = `
      INSERT INTO ${schema}.${tn} (id, ${colsSql}, updated_at)
      VALUES ($1, ${valsSql}, now())
      ON CONFLICT (id) DO UPDATE SET
        ${setSql},
        updated_at = now();
    `;

    await dbPool.query(sql, [rowId, ...keys.map((k) => data[k])]);
    res.json({ ok: true, tableName, rowId });
  } catch (e) {
    res.status(500).json({ error: "db_row_upsert_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/rows/delete", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName, rowId } = req.body || {};
    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);
    await dbPool.query(`DELETE FROM ${schema}.${tn} WHERE id = $1;`, [rowId]);
    res.json({ ok: true, tableName, rowId });
  } catch (e) {
    res.status(500).json({ error: "db_row_delete_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/table/drop", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured", message: "SUPABASE_DB_URL not set" });

    const { tableName } = req.body || {};
    if (!tableName || typeof tableName !== "string") return res.status(400).json({ error: "bad_request" });

    const tn = qIdent(tableName);
    const schema = qIdent(SUPABASE_DB_SCHEMA);

    await dbPool.query(`DROP TABLE IF EXISTS ${schema}.${tn} CASCADE;`);
    res.json({ ok: true, tableName });
  } catch (e) {
    res.status(500).json({ error: "db_drop_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/automations/install", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured", message: "SUPABASE_DB_URL not set" });

    // Minimal rules table for if/then automations
    const schema = qIdent(SUPABASE_DB_SCHEMA);
    await dbPool.query(`CREATE TABLE IF NOT EXISTS ${schema}.opendocs_automation_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz NOT NULL DEFAULT now(),
      table_name text NOT NULL,
      when_column text NOT NULL,
      when_equals text NOT NULL,
      then_set_column text NOT NULL,
      then_set_value text NOT NULL
    );`);

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "automations_install_failed", message: String(e?.message || e) });
  }
});

app.post("/api/db/automations/rules/create", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured", message: "SUPABASE_DB_URL not set" });

    const { tableName, whenColumn, whenEquals, thenSetColumn, thenSetValue } = req.body || {};
    if (![tableName, whenColumn, whenEquals, thenSetColumn].every((x) => typeof x === "string" && x.length)) {
      return res.status(400).json({ error: "bad_request" });
    }

    const schema = qIdent(SUPABASE_DB_SCHEMA);
    const r = await dbPool.query(
      `INSERT INTO ${schema}.opendocs_automation_rules(table_name, when_column, when_equals, then_set_column, then_set_value)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id;`,
      [tableName, whenColumn, whenEquals, thenSetColumn, String(thenSetValue ?? "")]
    );

    res.json({ ok: true, id: r.rows[0]?.id });
  } catch (e) {
    res.status(500).json({ error: "automation_rule_create_failed", message: String(e?.message || e) });
  }
});

/**
 * Sync Automations: Installs a real Postgres trigger on the table to execute rules instantly.
 * Best Practices Feb 2026: generic trigger, safe dynamic column access, allowlist.
 */
app.post("/api/db/automations/rules/sync", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName } = req.body || {};
    if (!tableName || typeof tableName !== "string") return res.status(400).json({ error: "bad_request" });
    if (!/^opendocs_db_[a-z0-9_]+$/i.test(tableName)) {
      return res.status(400).json({ error: "bad_request", message: "table_not_allowed" });
    }

    const schema = qIdent(SUPABASE_DB_SCHEMA);
    const safeTable = qIdent(tableName);

    await dbPool.query(`
      CREATE OR REPLACE FUNCTION ${schema}.opendocs_apply_automations()
      RETURNS TRIGGER AS $$
      DECLARE
        rule RECORD;
        current_value text;
      BEGIN
        FOR rule IN
          SELECT when_column, when_equals, then_set_column, then_set_value
          FROM ${schema}.opendocs_automation_rules
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
    `);

    await dbPool.query(`DROP TRIGGER IF EXISTS trig_opendocs_apply_automations ON ${schema}.${safeTable};`);
    await dbPool.query(`
      CREATE TRIGGER trig_opendocs_apply_automations
      BEFORE UPDATE ON ${schema}.${safeTable}
      FOR EACH ROW
      EXECUTE FUNCTION ${schema}.opendocs_apply_automations();
    `);

    res.json({ ok: true, trigger: "trig_opendocs_apply_automations" });
  } catch (e) {
    res.status(500).json({ error: "automation_sync_failed", message: String(e?.message || e) });
  }
});

// Automation Trigger: Executes rules for a specific row
app.post("/api/db/automations/trigger", async (req, res) => {
  try {
    if (!dbPool) return res.status(400).json({ error: "db_not_configured" });
    const { tableName, rowId } = req.body || {};
    if (!tableName || !rowId) return res.status(400).json({ error: "bad_request" });

    const schema = qIdent(SUPABASE_DB_SCHEMA);
    const safeTable = qIdent(tableName);

    // 1. Find matching rules
    const rulesRes = await dbPool.query(
      `SELECT * FROM ${schema}.opendocs_automation_rules WHERE table_name = $1`,
      [tableName]
    );

    if (rulesRes.rows.length === 0) return res.json({ ok: true, executed: 0 });

    // 2. Fetch the current row data
    const rowRes = await dbPool.query(
      `SELECT * FROM ${schema}.${safeTable} WHERE id = $1`,
      [rowId]
    );
    const row = rowRes.rows[0];
    if (!row) return res.status(404).json({ error: "row_not_found" });

    let count = 0;
    for (const rule of rulesRes.rows) {
      const currentValue = String(row[rule.when_column]);
      if (currentValue === rule.when_equals) {
        // 3. Execute the "Then" action
        await dbPool.query(
          `UPDATE ${schema}.${safeTable} SET ${qIdent(rule.then_set_column)} = $1, updated_at = now() WHERE id = $2`,
          [rule.then_set_value, rowId]
        );
        count++;
      }
    }

    res.json({ ok: true, executed: count });
  } catch (e) {
    res.status(500).json({ error: "automation_trigger_failed", message: String(e?.message || e) });
  }
});

// -----------------------------
// n8n integration proxy (optional)
// -----------------------------
const N8N_BASE_URL = process.env.N8N_BASE_URL || "";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

async function n8nRequest(path, init = {}) {
  if (!N8N_BASE_URL || !N8N_API_KEY) {
    throw new Error("n8n_not_configured");
  }
  const url = `${N8N_BASE_URL.replace(/\/$/, "")}${path}`;
  const resp = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-N8N-API-KEY": N8N_API_KEY,
      ...(init.headers || {}),
    },
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => "");
    throw new Error(`n8n_upstream_failed: ${resp.status} ${msg}`);
  }
  return resp.json();
}

async function getWorkflow(workflowId) {
  return await n8nRequest(`/api/v1/workflows/${encodeURIComponent(workflowId)}`, { method: "GET" });
}

async function updateWorkflow(workflowId, payload) {
  return await n8nRequest(`/api/v1/workflows/${encodeURIComponent(workflowId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

app.post("/api/n8n/nodes", async (_req, res) => {
  try {
    const data = await n8nRequest("/api/v1/nodes", { method: "GET" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "n8n_nodes_failed", message: String(e?.message || e) });
  }
});

app.post("/api/n8n/workflows/create", async (req, res) => {
  try {
    const { title } = req.body || {};
    if (!title || typeof title !== "string") return res.status(400).json({ error: "bad_request" });
    const payload = {
      name: title,
      nodes: [],
      connections: {},
      settings: {},
      active: false,
    };
    const data = await n8nRequest("/api/v1/workflows", { method: "POST", body: JSON.stringify(payload) });
    res.json({ ok: true, id: data.id });
  } catch (e) {
    res.status(500).json({ error: "n8n_workflow_create_failed", message: String(e?.message || e) });
  }
});

app.post("/api/n8n/nodes/update", async (req, res) => {
  try {
    const { workflowId, nodeId, config } = req.body || {};
    if (!workflowId || !config || !config.nodeType) return res.status(400).json({ error: "bad_request" });

    const wf = await getWorkflow(workflowId);
    const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
    const connections = wf.connections || {};

    let node = nodes.find((n) => n.id === nodeId || n.name === nodeId);
    if (!node) {
      node = {
        id: nodeId || `node-${Date.now()}`,
        name: config.name || `Node ${nodes.length + 1}`,
        type: config.nodeType,
        typeVersion: 1,
        position: [200 + nodes.length * 40, 200 + nodes.length * 20],
        parameters: config.parameters || {},
        disabled: !!config.disabled,
      };
      nodes.push(node);
    } else {
      node.name = config.name || node.name;
      node.type = config.nodeType || node.type;
      node.parameters = config.parameters || node.parameters || {};
      node.disabled = !!config.disabled;
    }

    await updateWorkflow(workflowId, { ...wf, nodes, connections });
    res.json({ ok: true, nodeId: node.id || node.name });
  } catch (e) {
    res.status(500).json({ error: "n8n_node_update_failed", message: String(e?.message || e) });
  }
});

app.post("/api/n8n/nodes/connect", async (req, res) => {
  try {
    const { workflowId, sourceNodeId, targetNodeId } = req.body || {};
    if (!workflowId || !sourceNodeId || !targetNodeId) return res.status(400).json({ error: "bad_request" });

    const wf = await getWorkflow(workflowId);
    const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
    const connections = wf.connections || {};

    const source = nodes.find((n) => n.id === sourceNodeId || n.name === sourceNodeId);
    const target = nodes.find((n) => n.id === targetNodeId || n.name === targetNodeId);
    if (!source || !target) return res.status(400).json({ error: "node_not_found" });

    const srcName = source.name;
    const tgtName = target.name;
    connections[srcName] = connections[srcName] || { main: [] };
    connections[srcName].main = connections[srcName].main || [];
    connections[srcName].main[0] = connections[srcName].main[0] || [];
    connections[srcName].main[0].push({ node: tgtName, type: "main", index: 0 });

    await updateWorkflow(workflowId, { ...wf, nodes, connections });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "n8n_connect_failed", message: String(e?.message || e) });
  }
});

app.post("/api/n8n/nodes/toggle", async (req, res) => {
  try {
    const { workflowId, nodeId, disabled } = req.body || {};
    if (!workflowId || !nodeId || typeof disabled !== "boolean") return res.status(400).json({ error: "bad_request" });

    const wf = await getWorkflow(workflowId);
    const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
    const connections = wf.connections || {};

    const node = nodes.find((n) => n.id === nodeId || n.name === nodeId);
    if (!node) return res.status(400).json({ error: "node_not_found" });
    node.disabled = disabled;

    await updateWorkflow(workflowId, { ...wf, nodes, connections });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "n8n_toggle_failed", message: String(e?.message || e) });
  }
});

app.post("/api/n8n/workflows/execute", async (req, res) => {
  try {
    const { workflowId } = req.body || {};
    if (!workflowId) return res.status(400).json({ error: "bad_request" });
    const data = await n8nRequest(`/api/v1/workflows/${encodeURIComponent(workflowId)}/execute`, { method: "POST" });
    res.json({ ok: true, executionId: data.executionId });
  } catch (e) {
    res.status(500).json({ error: "n8n_execute_failed", message: String(e?.message || e) });
  }
});

// Voice API Endpoints

app.post("/api/v1/voice/transcribe", async (req, res) => {
  try {
    const { audio, language = "en", model = "base" } = req.body || {};
    if (!audio || typeof audio !== "string") {
      return res.status(400).json({ error: "bad_request", message: "Audio data required" });
    }

    if (!OPENAI_API_KEY) {
      return res.status(400).json({ error: "voice_not_configured", message: "OPENAI_API_KEY not set" });
    }

    const audioBuffer = Buffer.from(audio, "base64");

    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), "audio.webm");
    formData.append("model", model === "base" ? "whisper-1" : model);
    formData.append("language", language);
    formData.append("response_format", "verbose_json");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`OpenAI Whisper error: ${resp.status} ${text}`);
    }

    const result = await resp.json();

    res.json({
      text: result.text || "",
      confidence: 0.9,
      language: result.language || language,
      duration: result.duration || 0,
    });
  } catch (e) {
    res.status(500).json({ error: "transcription_failed", message: String(e?.message || e) });
  }
});

app.post("/api/v1/voice/synthesize", async (req, res) => {
  try {
    const { text, voice = "en-US-AriaNeural", outputFormat = "mp3" } = req.body || {};
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "bad_request", message: "Text required" });
    }

    if (ELEVENLABS_API_KEY) {
      const voiceId = voice.includes("-") ? voice : "21m00Tcm4TlvDq8ikWAM";
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text.slice(0, 5000),
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      });

      if (!resp.ok) {
        const textErr = await resp.text().catch(() => "");
        throw new Error(`ElevenLabs error: ${resp.status} ${textErr}`);
      }

      const audioBuffer = await resp.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");
      const audioUrl = `data:audio/${outputFormat};base64,${audioBase64}`;

      const estimatedDuration = Math.ceil(text.length / 15);

      res.json({
        audioUrl,
        duration: estimatedDuration,
        voice: voiceId,
        provider: "elevenlabs",
      });
    } else {
      const ttsUrl = new URL("https://tts.githubusercontent.com/tts");
      ttsUrl.searchParams.set("text", text.slice(0, 500));
      ttsUrl.searchParams.set("voice", voice);

      const resp = await fetch(ttsUrl.toString());
      if (!resp.ok) {
        throw new Error(`TTS service error: ${resp.status}`);
      }

      const audioBuffer = await resp.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString("base64");
      const audioUrl = `data:audio/${outputFormat};base64,${audioBase64}`;

      const estimatedDuration = Math.ceil(text.length / 15);

      res.json({
        audioUrl,
        duration: estimatedDuration,
        voice,
        provider: "edge-tts",
      });
    }
  } catch (e) {
    res.status(500).json({ error: "synthesis_failed", message: String(e?.message || e) });
  }
});

app.listen(PORT, () => {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                      🚀 OpenDocs Server                      ║");
  console.log(`║  URL:         http://localhost:${PORT}${" ".repeat(Math.max(1, 33 - String(PORT).length))}║`);
  console.log(`║  Model:       ${NVIDIA_MODEL}${" ".repeat(Math.max(1, 44 - NVIDIA_MODEL.length))}║`);
  console.log("║  API:         /api/* (auth optional via API_AUTH_TOKEN)       ║");
  console.log("║  Endpoints:   /api/nvidia/chat | /api/agent/plan              ║");
  console.log("║              /api/github/analyze | /api/website/analyze       ║");
  console.log("║              /api/db/table/* | /api/db/automations/*          ║");
  console.log("║              /api/v1/voice/transcribe | /api/v1/voice/synthesize║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
});
