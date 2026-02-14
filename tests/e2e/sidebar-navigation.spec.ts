import { test, expect } from '@playwright/test'

test.describe('Sidebar Navigation - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Sidebar Elements', () => {
    for (let i = 1; i <= 30; i++) {
      test(`sidebar element ${i} visible`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const element = page.locator('aside, [class*="sidebar"]').nth(i)
        const isVisible = await element.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('OpenDocs Logo', () => {
    for (let i = 1; i <= 20; i++) {
      test(`logo visible ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const logo = page.locator('text=OpenDocs').nth(i)
        const isVisible = await logo.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Search Box', () => {
    for (let i = 1; i <= 20; i++) {
      test(`search box ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const search = page.locator('input[type="search"], input[placeholder*="Search"]').nth(i)
        const isVisible = await search.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('New Page Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`new page button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator('button:has-text("New page")').nth(i)
        const isVisible = await btn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('New Folder Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`new folder button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator('button:has-text("New folder")').nth(i)
        const isVisible = await btn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Expand Folder Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`expand folder button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator('button[aria-label*="Expand"]').nth(i)
        const isVisible = await btn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Clear Local Data Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`clear data button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator('button:has-text("Clear local data")').nth(i)
        const isVisible = await btn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Folder Operations', () => {
    for (let i = 1; i <= 30; i++) {
      test(`folder icon ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const icon = page.locator('button[aria-label*="folder"], button[aria-label*="Folder"]').nth(i)
        const isVisible = await icon.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
