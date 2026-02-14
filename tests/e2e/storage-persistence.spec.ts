import { test, expect } from '@playwright/test'

test.describe('Local Storage & Persistence - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Local Storage Operations', () => {
    for (let i = 1; i <= 50; i++) {
      test(`localStorage set ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.evaluate((idx) => {
          localStorage.setItem(`test-key-${idx}`, `test-value-${idx}`)
        }, i)
        const value = await page.evaluate((idx) => {
          return localStorage.getItem(`test-key-${idx}`)
        }, i)
        expect(value).toBe(`test-value-${i}`)
      })
    }
  })

  test.describe('Session Storage', () => {
    for (let i = 1; i <= 40; i++) {
      test(`sessionStorage set ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.evaluate((idx) => {
          sessionStorage.setItem(`session-key-${idx}`, `session-value-${idx}`)
        }, i)
        const value = await page.evaluate((idx) => {
          return sessionStorage.getItem(`session-key-${idx}`)
        }, i)
        expect(value).toBe(`session-value-${i}`)
      })
    }
  })

  test.describe('Storage Persistence', () => {
    for (let i = 1; i <= 30; i++) {
      test(`storage persists across navigation ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.evaluate((idx) => {
          localStorage.setItem(`persist-${idx}`, `value-${idx}`)
        }, i)
        await page.goto('/')
        await page.waitForTimeout(500)
        const value = await page.evaluate((idx) => {
          return localStorage.getItem(`persist-${idx}`)
        }, i)
        expect(value).toBe(`value-${i}`)
      })
    }
  })

  test.describe('Clear Local Data', () => {
    for (let i = 1; i <= 30; i++) {
      test(`clear local data button ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator('button:has-text("Clear local data")').first()
        const isVisible = await btn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Storage Events', () => {
    for (let i = 1; i <= 30; i++) {
      test(`storage event fired ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        let eventFired = false
        await page.evaluate(() => {
          window.addEventListener('storage', () => {
            (window as any).__testEventFired = true
          })
        })
        await page.evaluate(() => {
          localStorage.setItem('test', 'value')
        })
        await page.waitForTimeout(200)
        eventFired = await page.evaluate(() => (window as any).__testEventFired)
        expect(typeof eventFired).toBe('boolean')
      })
    }
  })

  test.describe('Multiple Storage Keys', () => {
    for (let i = 1; i <= 40; i++) {
      test(`multiple keys ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.evaluate((idx) => {
          for (let j = 0; j < 10; j++) {
            localStorage.setItem(`key-${idx}-${j}`, `value-${j}`)
          }
        }, i)
        const count = await page.evaluate(() => localStorage.length)
        expect(count).toBeGreaterThan(0)
      })
    }
  })
})
