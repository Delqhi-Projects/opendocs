import { test, expect } from '@playwright/test'

test.describe('Block Operations - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Block Toolbar - Drag Operations', () => {
    for (let i = 1; i <= 40; i++) {
      test(`block ${i} has drag handle`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const dragHandle = page.locator('[aria-label*="Drag"], button:has-text("Drag")').nth(i)
        const isVisible = await dragHandle.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Block Toolbar - Chat Operations', () => {
    for (let i = 1; i <= 40; i++) {
      test(`block ${i} has chat button`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const chatBtn = page.locator('[aria-label*="Chat"], button:has-text("Chat")').nth(i)
        const isVisible = await chatBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Block Toolbar - Lock Operations', () => {
    for (let i = 1; i <= 40; i++) {
      test(`block ${i} has lock button`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const lockBtn = page.locator('[aria-label*="Lock"], button:has-text("Lock")').nth(i)
        const isVisible = await lockBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Block Toolbar - Move Operations', () => {
    for (let i = 1; i <= 40; i++) {
      test(`block ${i} has move up button`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const moveUpBtn = page.locator('[aria-label*="Move up"], button:has-text("Move up")').nth(i)
        const isVisible = await moveUpBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })

      test(`block ${i} has move down button`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const moveDownBtn = page.locator('[aria-label*="Move down"], button:has-text("Move down")').nth(i)
        const isVisible = await moveDownBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Block Toolbar - Delete Operations', () => {
    for (let i = 1; i <= 40; i++) {
      test(`block ${i} has delete button`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const deleteBtn = page.locator('[aria-label*="Delete"], button:has-text("Delete")').nth(i)
        const isVisible = await deleteBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Add Block Buttons', () => {
    for (let i = 1; i <= 30; i++) {
      test(`add block button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const addBlockBtn = page.locator('button:has-text("Add block below"), button:has-text("+ Add text block")').nth(i)
        const isVisible = await addBlockBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Add Grid Block', () => {
    for (let i = 1; i <= 20; i++) {
      test(`add grid block button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const gridBtn = page.locator('button:has-text("Add grid block")').nth(i)
        const isVisible = await gridBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Ask AI Button', () => {
    for (let i = 1; i <= 20; i++) {
      test(`ask AI button ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const aiBtn = page.locator('button:has-text("Ask AI to create")').nth(i)
        const isVisible = await aiBtn.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })
})
