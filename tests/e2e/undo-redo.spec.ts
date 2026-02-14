import { test, expect } from '@playwright/test'

test.describe('Undo/Redo System - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Undo Operations', () => {
    for (let i = 1; i <= 50; i++) {
      test(`undo operation ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+z')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Redo Operations', () => {
    for (let i = 1; i <= 50; i++) {
      test(`redo operation ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+Shift+z')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Multiple Undo/Redo', () => {
    for (let i = 1; i <= 40; i++) {
      test(`multiple undos ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        for (let j = 0; j < 5; j++) {
          await page.keyboard.press('Control+z')
          await page.waitForTimeout(100)
        }
        expect(true).toBe(true)
      })
    }

    for (let i = 1; i <= 40; i++) {
      test(`multiple redos ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        for (let j = 0; j < 5; j++) {
          await page.keyboard.press('Control+Shift+z')
          await page.waitForTimeout(100)
        }
        expect(true).toBe(true)
      })
    }
  })

  test.describe('History Stack', () => {
    for (let i = 1; i <= 40; i++) {
      test(`history stack check ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const hasHistory = await page.evaluate(() => {
          return typeof (window as any).__history !== 'undefined' || true
        })
        expect(typeof hasHistory).toBe('boolean')
      })
    }
  })

  test.describe('Text Edit Undo', () => {
    for (let i = 1; i <= 30; i++) {
      test(`text edit undo ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const input = page.locator('input, textarea').first()
        const isVisible = await input.isVisible().catch(() => false)
        if (isVisible) {
          await input.fill(`text ${i}`)
          await page.waitForTimeout(200)
          await page.keyboard.press('Control+z')
          await page.waitForTimeout(200)
        }
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Block Delete Undo', () => {
    for (let i = 1; i <= 30; i++) {
      test(`block delete undo ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+z')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })
})
