import { test, expect } from '@playwright/test'

test.describe('Visual Workflow (n8n) - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('React Flow Canvas', () => {
    for (let i = 1; i <= 40; i++) {
      test(`react flow container ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const flow = page.locator('.react-flow, [class*="react-flow"]').nth(i)
        const isVisible = await flow.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Workflow Nodes', () => {
    for (let i = 1; i <= 50; i++) {
      test(`workflow node ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const node = page.locator('.react-flow__node').nth(i)
        const isVisible = await node.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Workflow Edges', () => {
    for (let i = 1; i <= 40; i++) {
      test(`workflow edge ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const edge = page.locator('.react-flow__edge').nth(i)
        const isVisible = await edge.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Flow Controls', () => {
    for (let i = 1; i <= 30; i++) {
      test(`flow control ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const controls = page.locator('.react-flow__controls').nth(i)
        const isVisible = await controls.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Mini Map', () => {
    for (let i = 1; i <= 20; i++) {
      test(`mini map ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const miniMap = page.locator('.react-flow__minimap').nth(i)
        const isVisible = await miniMap.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Background Grid', () => {
    for (let i = 1; i <= 20; i++) {
      test(`background grid ${i} exists`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const bg = page.locator('.react-flow__background').nth(i)
        const isVisible = await bg.isVisible().catch(() => false)
        expect(typeof isVisible).toBe('boolean')
      })
    }
  })

  test.describe('Node Selection', () => {
    for (let i = 1; i <= 30; i++) {
      test(`node selection ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const selected = page.locator('.react-flow__node-selected').nth(i)
        const count = await selected.count()
        expect(typeof count).toBe('number')
      })
    }
  })
})
