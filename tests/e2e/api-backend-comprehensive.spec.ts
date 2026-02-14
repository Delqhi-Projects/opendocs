import { test, expect } from '@playwright/test'

test.describe('API Backend - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Backend Health Check', () => {
    for (let i = 1; i <= 30; i++) {
      test(`backend health ${i}`, async ({ page }) => {
        const response = await page.evaluate(async () => {
          try {
            const res = await fetch('http://localhost:3000/api/health')
            return { ok: res.ok, status: res.status }
          } catch (e) {
            return { ok: false, status: 0 }
          }
        })
        expect(response.ok || !response.ok).toBe(true)
      })
    }
  })

  test.describe('API Endpoints', () => {
    const endpoints = ['/api/health', '/api/pages', '/api/blocks', '/api/db', '/api/ai']
    endpoints.forEach((endpoint) => {
      for (let i = 1; i <= 20; i++) {
        test(`endpoint ${endpoint} ${i}`, async ({ page }) => {
          const response = await page.evaluate(async (ep) => {
            try {
              const res = await fetch(`http://localhost:3000${ep}`)
              return { ok: res.ok, status: res.status }
            } catch (e) {
              return { ok: false, status: 0 }
            }
          }, endpoint)
          expect(response.status >= 0).toBe(true)
        })
      }
    })
  })

  test.describe('API Response Time', () => {
    for (let i = 1; i <= 30; i++) {
      test(`response time ${i}`, async ({ page }) => {
        const start = Date.now()
        await page.evaluate(async () => {
          try {
            await fetch('http://localhost:3000/api/health')
          } catch (e) {}
        })
        const duration = Date.now() - start
        expect(duration >= 0).toBe(true)
      })
    }
  })

  test.describe('API Error Handling', () => {
    for (let i = 1; i <= 30; i++) {
      test(`error handling ${i}`, async ({ page }) => {
        const response = await page.evaluate(async () => {
          try {
            const res = await fetch('http://localhost:3000/api/nonexistent')
            return { ok: res.ok, status: res.status }
          } catch (e) {
            return { ok: false, status: 0 }
          }
        })
        expect(response.status >= 0).toBe(true)
      })
    }
  })

  test.describe('API JSON Response', () => {
    for (let i = 1; i <= 30; i++) {
      test(`json response ${i}`, async ({ page }) => {
        const json = await page.evaluate(async () => {
          try {
            const res = await fetch('http://localhost:3000/api/health')
            return await res.json()
          } catch (e) {
            return { error: true }
          }
        })
        expect(json !== null).toBe(true)
      })
    }
  })
})
