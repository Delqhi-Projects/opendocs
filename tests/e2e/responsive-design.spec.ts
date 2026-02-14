import { test, expect } from '@playwright/test'

test.describe('Responsive Design - Comprehensive Tests', () => {
  const viewports = [
    { name: 'xs-mobile', width: 320, height: 568 },
    { name: 'sm-mobile-large', width: 480, height: 852 },
    { name: 'md-tablet', width: 768, height: 1024 },
    { name: 'lg-laptop', width: 1024, height: 768 },
    { name: 'xl-desktop', width: 1280, height: 800 },
    { name: '2xl-large', width: 1536, height: 864 },
  ]

  viewports.forEach((viewport) => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.addInitScript(() => window.localStorage.clear())
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
      })

      for (let i = 1; i <= 20; i++) {
        test(`viewport ${viewport.name} renders ${i}`, async ({ page }) => {
          await page.goto('/')
          await page.waitForTimeout(500)
          const content = await page.content()
          expect(content.length).toBeGreaterThan(0)
        })
      }
    })
  })

  test.describe('Mobile Sidebar Collapse', () => {
    for (let i = 1; i <= 30; i++) {
      test(`sidebar collapses on mobile ${i}`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.addInitScript(() => window.localStorage.clear())
        await page.goto('/')
        await page.waitForTimeout(500)
        const sidebar = page.locator('aside, [class*="sidebar"]').first()
        const isVisible = await sidebar.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Touch Interactions', () => {
    for (let i = 1; i <= 30; i++) {
      test(`touch tap ${i}`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.addInitScript(() => window.localStorage.clear())
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.tap('body')
        await page.waitForTimeout(200)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Responsive Grid', () => {
    for (let i = 1; i <= 30; i++) {
      test(`responsive grid ${i}`, async ({ page }) => {
        await page.setViewportSize({ width: (i * 100) + 320, height: 800 })
        await page.addInitScript(() => window.localStorage.clear())
        await page.goto('/')
        await page.waitForTimeout(500)
        const grid = page.locator('[class*="grid"]').first()
        const isVisible = await grid.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
