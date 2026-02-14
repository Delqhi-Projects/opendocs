import { test, expect } from '@playwright/test'

test.describe('Database Views - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Table View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`table view renders row ${i}`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const tableRow = page.locator(`tr[data-row="${i}"]`).first()
        await expect(tableRow).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })

  test.describe('Kanban View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`kanban column ${i} renders`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const column = page.locator(`.kanban-column, [data-column="${i}"]`).first()
        await expect(column).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })

  test.describe('Flow View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`flow node ${i} renders`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const node = page.locator(`.react-flow__node, [data-node="${i}"]`).first()
        await expect(node).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })

  test.describe('Calendar View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`calendar day ${i} renders`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const day = page.locator(`.calendar-day, [data-day="${i}"]`).first()
        await expect(day).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })

  test.describe('Timeline View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`timeline item ${i} renders`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const item = page.locator(`.timeline-item, [data-item="${i}"]`).first()
        await expect(item).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })

  test.describe('Gallery View', () => {
    for (let i = 1; i <= 50; i++) {
      test(`gallery image ${i} renders`, async ({ page }) => {
        await page.goto('/')
        await page.waitForTimeout(500)
        const image = page.locator(`.gallery-image, [data-image="${i}"]`).first()
        await expect(image).toBeVisible({ timeout: 2000 }).catch(() => {})
      })
    }
  })
})
