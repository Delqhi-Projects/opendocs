# OpenDocs Deployment & Production Hardening Guide

**Version:** 1.0.0  
**Last Updated:** 2026-02-12  
**Status:** Production Ready

---

## Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Configuration](#2-environment-configuration)
3. [Security Hardening](#3-security-hardening)
4. [Performance Optimization](#4-performance-optimization)
5. [Monitoring & Observability](#5-monitoring--observability)
6. [Backup & Recovery](#6-backup--recovery)
7. [Scaling Strategies](#7-scaling-strategies)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Pre-Deployment Checklist

### 1.1 Code Quality

```bash
# Run all tests
npm test

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build production bundle
npm run build

# Verify build output
npm run preview
```

### 1.2 Database Readiness

```bash
# Run migrations
npm run db:migrate

# Verify schema
npm run db:verify

# Seed test data (optional)
npm run db:seed

# Backup current state
npm run db:backup
```

---

## 2. Environment Configuration

### 2.1 Production Environment Variables

```bash
# .env.production

# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.opendocs.example.com
WS_URL=wss://api.opendocs.example.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/opendocs?sslmode=require

# Authentication
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Security
CORS_ORIGIN=https://opendocs.example.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Encryption
ENCRYPTION_KEY=your-32-char-encryption-key
ENCRYPTION_ALGORITHM=aes-256-gcm

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NEW_RELIC_LICENSE_KEY=xxx

# AI Services
NVIDIA_API_KEY=your-nvidia-api-key
OPENAI_API_KEY=your-openai-api-key
```

---

## 3. Security Hardening

### 3.1 HTTP Security Headers

```typescript
import helmet from 'helmet'

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.openai.com', 'https://api.nvidia.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
})
```

### 3.2 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: 60,
  },
})

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many login attempts. Please try again in an hour.',
  },
})
```

### 3.3 Input Validation

```typescript
import { z } from 'zod'

export const documentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.any().optional(),
  parentId: z.string().uuid().optional(),
  isLocked: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})
```

---

## 4. Performance Optimization

### 4.1 Database Optimization

```sql
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_parent_id ON documents(parent_id);
CREATE INDEX idx_blocks_document_id ON blocks(document_id);
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_automations_enabled ON automations(enabled);
```

### 4.2 Frontend Optimization

```typescript
// Implement lazy loading
const Document = lazy(() => import('./pages/Document'))
const Automations = lazy(() => import('./pages/Automations'))

// Image optimization
export function useOptimizedImage(url: string) {
  const cloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/w_400,c_limit,f_auto,q_auto/${url}`
  
  return {
    src: cloudinaryUrl,
    srcSet: `
      ${cloudinaryUrl.replace('w_400', 'w_400')} 400w,
      ${cloudinaryUrl.replace('w_400', 'w_800')} 800w,
      ${cloudinaryUrl.replace('w_400', 'w_1200')} 1200w
    `,
  }
}
```

---

## 5. Monitoring & Observability

### 5.1 Logging Configuration

```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})
```

### 5.2 Health Checks

```typescript
export async function healthCheck(req: Request, res: Response) {
  const checks = {
    database: false,
    redis: false,
  }
  
  try {
    await db.query('SELECT 1')
    checks.database = true
  } catch {
    checks.database = false
  }
  
  const isHealthy = Object.values(checks).every(Boolean)
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: { ...checks, uptime: process.uptime() },
  })
}
```

### 5.3 Metrics Collection

```typescript
import client from 'prom-client'

const registry = new client.Registry()

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [registry],
})

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
})
```

---

## 6. Backup & Recovery

### 6.1 Database Backup Script

```bash
#!/bin/bash
# scripts/backup-db.sh

set -e

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/opendocs_${DATE}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
  echo "Backup created: ${BACKUP_FILE}"
  
  # Upload to cloud storage
  aws s3 cp "${BACKUP_FILE}" "s3://opendocs-backups/postgres/"
  
  # Keep last 7 local backups
  ls -t "${BACKUP_DIR}"/*.sql.gz | tail -n +8 | xargs rm -f
  
  echo "Backup completed"
else
  echo "ERROR: Backup failed"
  exit 1
fi
```

### 6.2 Point-in-Time Recovery

```bash
#!/bin/bash
# scripts/restore-db.sh

set -e

BACKUP_FILE=$1

if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: restore-db.sh <backup_file>"
  exit 1
fi

echo "Restoring from backup..."
gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"

echo "Restoration completed"
```

---

## 7. Scaling Strategies

### 7.1 Horizontal Scaling

```yaml
services:
  opendocs-api:
    image: opendocs/api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 7.2 CDN Configuration

```yaml
routes:
  - cache: true
  - pattern: "/assets/*"
    cache_level: " Cache Everything"
  - pattern: "/api/*"
    cache_level: " Origin-Error if failed"
  - pattern: "/*"
    cache_level: " Cacheable"
    polish: "on"
    minify:
      js: true
      css: true
      html: true
```

### 7.3 Auto-Scaling Policy

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: opendocs-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: opendocs-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 8. Troubleshooting

### 8.1 Common Issues

```yaml
Troubleshooting:
  high_cpu:
    symptoms:
      - High CPU usage on API servers
      - Slow response times
    causes:
      - Infinite loops in automation
      - Large document queries
    solutions:
      - Check automation logs
      - Review slow query logs
  
  database_connection_errors:
    symptoms:
      - "Connection refused" errors
    causes:
      - Connection pool exhausted
      - Database server down
    solutions:
      - Increase pool size
      - Check database health
  
  authentication_failures:
    symptoms:
      - 401 Unauthorized errors
    causes:
      - JWT secret mismatch
      - Expired tokens
    solutions:
      - Verify JWT_SECRET
      - Check token expiry
```

### 8.2 Log Analysis

```bash
# Search for errors
tail -n 1000 logs/combined.log | \
  jq 'select(.level == "error" or .level == "warn")'

# Monitor live logs
tail -f logs/combined.log | jq 'select(.level == "error")'
```

---

## 9. Post-Deployment Verification

### 9.1 Smoke Tests

```typescript
test.describe('Post-Deployment Smoke Tests', () => {
  test('API health endpoint returns 200', async ({ request }) => {
    const response = await request.get('/health')
    expect(response.status()).toBe(200)
    
    const body = await response.json()
    expect(body.status).toBe('healthy')
  })

  test('Database connection is working', async ({ request }) => {
    const response = await request.get('/health/detailed')
    expect(response.status()).toBe(200)
    expect(response.json().checks.database.healthy).toBe(true)
  })

  test('Can create and retrieve document', async ({ request }) => {
    const doc = await request.post('/api/documents', {
      data: { title: 'Smoke Test' },
    })
    expect(doc.status()).toBe(201)
  })
})
```

### 9.2 Monitoring Checklist

```yaml
Immediate Checks:
  - [ ] Health check returns 200
  - [ ] No error rate increase
  - [ ] Database pool healthy
  - [ ] Response times < 500ms (p95)

1 Hour Later:
  - [ ] No memory leaks
  - [ ] CPU stable
  - [ ] No auth failures spike

24 Hours Later:
  - [ ] All backups completed
  - [ ] No data issues
  - [ ] Performance within SLA
```

---

## 10. Rollback Procedures

### 10.1 Quick Rollback

```bash
# Docker rollback
docker pull opendocs/api:previous-version
docker tag opendocs/api:previous-version opendocs/api:latest
docker-compose up -d

# Kubernetes rollback
kubectl rollout undo deployment/opendocs-api
kubectl rollout status deployment/opendocs-api
```

### 10.2 Database Rollback

```bash
# If migration needs rollback
npm run db:migrate:down

# Or restore from backup
./scripts/restore-db.sh /backups/opendocs_pre_migration.sql.gz
```

---

## Support & Documentation

- **Documentation:** docs/USER-GUIDE.md
- **API Reference:** API-ENDPOINTS.md
- **Architecture:** ARCHITECTURE.md
- **GitHub Issues:** Report problems here

---

**© 2026 OpenDocs Project - Production Edition**
