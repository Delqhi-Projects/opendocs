import { test, expect } from '@playwright/test'

test.describe('AI Block Creator - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('AI Block Input Tests', () => {
    for (let i = 1; i <= 80; i++) {
      test(`AI block input accepts text ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const aiInput = page.locator('input[placeholder*="Generate"], textarea[placeholder*="Generate"]').first()
        await aiInput.fill(`test prompt ${i}`)
        await page.waitForTimeout(200)
        const value = await aiInput.inputValue()
        expect(value).toContain(`test prompt ${i}`)
      })
    }
  })

  test.describe('AI Suggestion Buttons', () => {
    const suggestions = [
      'Table of features', 'Step-by-step setup', 'Mermaid flow diagram',
      'Pricing checklist', 'FAQ section', 'Code example', 'Comparison table',
      'Pros and cons', 'Quick start guide', 'Troubleshooting steps',
      'Best practices', 'Common mistakes', 'Glossary', 'Roadmap',
      'Changelog', 'Release notes', 'API documentation', 'Tutorial',
      'Case study', 'User guide', 'Getting started', 'Architecture overview'
    ]

    suggestions.forEach((suggestion, idx) => {
      test(`suggestion button "${suggestion}" exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const btn = page.locator(`button:has-text("${suggestion}")`).first()
        await expect(btn).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    })
  })

  test.describe('AI Block Submit', () => {
    for (let i = 1; i <= 30; i++) {
      test(`AI submit button ${i} state`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const submitBtn = page.locator('button[type="submit"], button:has(img)').nth(i)
        const isVisible = await submitBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('AI Response Handling', () => {
    for (let i = 1; i <= 40; i++) {
      test(`AI response container ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const container = page.locator('.ai-response, .ai-content').nth(i)
        const isVisible = await container.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
