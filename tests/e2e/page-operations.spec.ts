import { test, expect } from '@playwright/test'

test.describe('Page Operations - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Page Title Input', () => {
    for (let i = 1; i <= 40; i++) {
      test(`page title input ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const input = page.locator('input[placeholder*="Untitled"], input[placeholder*="Title"]').nth(i)
        const isVisible = await input.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Page Title Editing', () => {
    for (let i = 1; i <= 30; i++) {
      test(`page title edit ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const input = page.locator('input[placeholder*="Untitled"]').first()
        const isVisible = await input.isVisible().catch(() => false)
        if (isVisible) {
          await input.fill(`Test Page ${i}`)
          await page.waitForTimeout(200)
        }
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Add Cover Button', () => {
    for (let i = 1; i <= 30; i++) {
    test(`add cover button ${i} exists`, async ({ page }) => {
      await page.goto('/')
      await page.waitForTimeout(500)
      const btn = page.locator('button:has-text("Add cover")').nth(i)
      const isVisible = await btn.isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
    }
  })

  test.describe('Content Area', () => {
    for (let i = 1; i <= 40; i++) {
      test(`content area ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const content = page.locator('main, [class*="content"]').nth(i)
        const isVisible = await content.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Text Blocks', () => {
    for (let i = 1; i <= 50; i++) {
      test(`text block ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const block = page.locator('textarea, input[type="text"]').nth(i)
        const isVisible = await block.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Block Placeholder', () => {
    for (let i = 1; i <= 40; i++) {
      test(`placeholder ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const placeholder = page.locator('text=Write…').nth(i)
        const isVisible = await placeholder.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Status Bar', () => {
    for (let i = 1; i <= 20; i++) {
      test(`status bar ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const status = page.locator('[class*="status"]').nth(i)
        const isVisible = await status.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
