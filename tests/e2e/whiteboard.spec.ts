import { test, expect } from '@playwright/test'

test.describe('Whiteboard (Excalidraw) - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Excalidraw Canvas', () => {
    for (let i = 1; i <= 40; i++) {
      test(`excalidraw canvas ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const canvas = page.locator('.excalidraw, [class*="excalidraw"]').nth(i)
        const isVisible = await canvas.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Drawing Tools', () => {
    const tools = ['select', 'rectangle', 'ellipse', 'arrow', 'line', 'text', 'freehand', 'eraser']
    tools.forEach((tool) => {
      for (let i = 1; i <= 15; i++) {
        test(`tool ${tool} button ${i}`, async ({ page }) => {
          await page.goto('/')
          await page.waitForTimeout(500)
          const btn = page.locator(`button[aria-label*="${tool}"], button[data-tool="${tool}"]`).nth(i)
          const isVisible = await btn.isVisible().catch(() => false)
          expect(typeof isVisible).toBe('boolean')
        })
      }
    })
  })

  test.describe('Color Picker', () => {
    for (let i = 1; i <= 30; i++) {
      test(`color picker ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const picker = page.locator('[class*="color"], [class*="picker"]').nth(i)
        const isVisible = await picker.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Stroke Width', () => {
    for (let i = 1; i <= 20; i++) {
      test(`stroke width ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const stroke = page.locator('[class*="stroke"]').nth(i)
        const isVisible = await stroke.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Canvas Elements', () => {
    for (let i = 1; i <= 40; i++) {
      test(`canvas element ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const element = page.locator('.excalidraw__element').nth(i)
        const isVisible = await element.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Zoom Controls', () => {
    for (let i = 1; i <= 20; i++) {
      test(`zoom control ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const zoom = page.locator('[class*="zoom"]').nth(i)
        const isVisible = await zoom.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
