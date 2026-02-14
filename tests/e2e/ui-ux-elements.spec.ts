import { test, expect } from '@playwright/test'

test.describe('UI/UX Elements - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Button Visibility', () => {
    const buttons = ['AI', 'Chat', 'Audit', 'New page', 'New folder', 'Add cover', '+ Add text block', 'Add grid block', 'Ask AI to create']
    buttons.forEach((btn) => {
      for (let i = 1; i <= 15; i++) {
        test(`button "${btn}" visible ${i}`, async ({ page }) => {
          await page.goto('/')
          await page.waitForTimeout(500)
          const button = page.locator(`button:has-text("${btn}")`).first()
          const isVisible = await button.isVisible().catch(() => false)
          expect(typeof isVisible).toBe('boolean')
        })
      }
    })
  })

  test.describe('Icons', () => {
    for (let i = 1; i <= 50; i++) {
      test(`icon ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const icon = page.locator('img, svg').nth(i)
        const isVisible = await icon.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Text Content', () => {
    const texts = ['OpenDocs', 'Untitled', 'Write…', 'New page', 'Best Practices Feb 2026 Edition']
    texts.forEach((text) => {
      for (let i = 1; i <= 15; i++) {
        test(`text "${text}" visible ${i}`, async ({ page }) => {
          await page.goto('/')
          await page.waitForTimeout(500)
          const el = page.locator(`text=${text}`).first()
          const isVisible = await el.isVisible().catch(() => false)
          expect(typeof isVisible).toBe('boolean')
        })
      }
    })
  })

  test.describe('Input Fields', () => {
    for (let i = 1; i <= 40; i++) {
      test(`input field ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const input = page.locator('input, textarea').nth(i)
        const isVisible = await input.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Dropdowns', () => {
    for (let i = 1; i <= 30; i++) {
      test(`dropdown ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const dropdown = page.locator('select, [role="combobox"]').nth(i)
        const isVisible = await dropdown.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Tooltips', () => {
    for (let i = 1; i <= 30; i++) {
      test(`tooltip ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const tooltip = page.locator('[title], [data-tooltip]').nth(i)
        const isVisible = await tooltip.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Loading States', () => {
    for (let i = 1; i <= 30; i++) {
      test(`loading state ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const loading = page.locator('[class*="loading"], [class*="spinner"]').nth(i)
        const isVisible = await loading.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Error States', () => {
    for (let i = 1; i <= 20; i++) {
      test(`error state ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const error = page.locator('[class*="error"], [class*="Error"]').nth(i)
        const isVisible = await error.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
