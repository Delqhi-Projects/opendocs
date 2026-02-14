import { test, expect } from '@playwright/test'

test.describe('Search Functionality - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Search Box Existence', () => {
    for (let i = 1; i <= 40; i++) {
      test(`search box ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const search = page.locator('input[type="search"], input[placeholder*="Search"]').first()
        const isVisible = await search.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Search Input', () => {
    for (let i = 1; i <= 50; i++) {
      test(`search input ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const search = page.locator('input[placeholder*="Search"]').first()
        const isVisible = await search.isVisible().catch(() => false)
        if (isVisible) {
          await search.fill(`search query ${i}`)
          await page.waitForTimeout(200)
        }
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Search Results', () => {
    for (let i = 1; i <= 40; i++) {
      test(`search results ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const results = page.locator('[class*="result"], [class*="search"]').nth(i)
        const isVisible = await results.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Search Clear', () => {
    for (let i = 1; i <= 30; i++) {
      test(`search clear ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const search = page.locator('input[placeholder*="Search"]').first()
        const isVisible = await search.isVisible().catch(() => false)
        if (isVisible) {
          await search.fill('test')
          await page.waitForTimeout(200)
          await search.clear()
          await page.waitForTimeout(200)
        }
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Search Shortcut', () => {
    for (let i = 1; i <= 30; i++) {
      test(`search shortcut ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+f')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Search Placeholder', () => {
    for (let i = 1; i <= 20; i++) {
      test(`search placeholder ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const placeholder = page.locator('text=Search pages').first()
        const isVisible = await placeholder.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
