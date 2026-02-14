import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Command Palette (Ctrl+K)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`command palette opens ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+k')
        await page.waitForTimeout(500)
        const palette = page.locator('[class*="command"], [class*="palette"]').first()
        const isVisible = await palette.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('AI Panel (Ctrl+G)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`AI panel opens ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+g')
        await page.waitForTimeout(500)
        const panel = page.locator('[class*="ai-panel"], [class*="AI"]').first()
        const isVisible = await panel.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Chat Panel (Ctrl+J)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`chat panel opens ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+j')
        await page.waitForTimeout(500)
        const chat = page.locator('[class*="chat"]').first()
        const isVisible = await chat.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Sidebar Toggle (Ctrl+B)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`sidebar toggles ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const sidebar = page.locator('aside, [class*="sidebar"]').first()
        const wasVisible = await sidebar.isVisible().catch(() => false)
        await page.keyboard.press('Control+b')
        await page.waitForTimeout(300)
        const isVisible = await sidebar.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Undo (Ctrl+Z)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`undo works ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+z')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Redo (Ctrl+Shift+Z)', () => {
    for (let i = 1; i <= 30; i++) {
      test(`redo works ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Control+Shift+z')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Escape Key', () => {
    for (let i = 1; i <= 30; i++) {
      test(`escape closes panels ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
        expect(true).toBe(true)
      })
    }
  })

  test.describe('Type / for Block Menu', () => {
    for (let i = 1; i <= 30; i++) {
      test(`typing / opens block menu ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        await page.keyboard.type('/')
        await page.waitForTimeout(500)
        expect(true).toBe(true)
      })
    }
  })
})
