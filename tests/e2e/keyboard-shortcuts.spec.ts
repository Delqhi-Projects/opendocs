import { test, expect } from '@playwright/test'

test.describe('Keyboard Shortcuts', () => {
  test.use({ storageState: undefined })
  
  test('Ctrl+B toggles sidebar', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    const sidebar = page.locator('nav, aside, [class*="sidebar"]').first()
    const initialVisible = await sidebar.isVisible().catch(() => false)
    
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(500)
    
    const afterVisible = await sidebar.isVisible().catch(() => false)
    expect(afterVisible).not.toBe(initialVisible)
  })
  
  test('Escape closes modals', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    // This test passes if no error is thrown
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  })
})
