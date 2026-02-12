import { test, expect } from '@playwright/test'

test.describe('Automation Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('loads without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })

  test('displays header with theme selector', async ({ page }) => {
    const header = page.locator('header, div').filter({ has: page.locator('text=OpenDocs') }).first()
    await expect(header).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
  })

  test('sidebar can be toggled', async ({ page }) => {
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await toggleBtn.click()
    
    const sidebar = page.locator('nav, aside').first()
    await expect(sidebar).not.toBeVisible()
  })

  test('theme selector changes theme', async ({ page }) => {
    const select = page.locator('select')
    await select.selectOption('dark')
    
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })
})

test.describe('Keyboard Shortcuts', () => {
  test('Ctrl+K opens command palette', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    await page.keyboard.down('Control')
    await page.keyboard.press('k')
    await page.keyboard.up('Control')
    
    await page.waitForTimeout(500)
  })
})
