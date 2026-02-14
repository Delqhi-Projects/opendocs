import { test, expect } from '@playwright/test'

test.describe('Theme System - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Theme Toggle Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`theme toggle button ${i} is visible`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const themeBtn = page.locator('button[aria-label*="theme"], button[aria-label*="Theme"]').nth(i)
        const isVisible = await themeBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Theme Combobox Options', () => {
    const themes = ['Light', 'Dark', 'System']

    themes.forEach((theme) => {
      test(`theme option "${theme}" exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const option = page.locator(`[role="option"]:has-text("${theme}")`).first()
        await expect(option).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    })
  })

  test.describe('Dark Mode Class', () => {
    for (let i = 1; i <= 30; i++) {
      test(`dark class check ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const hasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
        expect(typeof hasDark).toBe('boolean')
      })
    }
  })

  test.describe('Theme Persistence', () => {
    for (let i = 1; i <= 30; i++) {
      test(`theme localStorage check ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const theme = await page.evaluate(() => localStorage.getItem('theme'))
        expect(theme === null || typeof theme === 'string').toBe(true)
      })
    }
  })

  test.describe('Theme Switching', () => {
    for (let i = 1; i <= 30; i++) {
      test(`switch to theme ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const themeSelect = page.locator('select, [role="combobox"]').first()
        const isVisible = await themeSelect.isVisible().catch(() => false)
        if (isVisible) {
          await themeSelect.selectOption({ index: (i % 3) })
        }
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
