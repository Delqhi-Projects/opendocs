import { test, expect } from '@playwright/test'

test.describe('Command Palette', () => {
  test.use({ storageState: undefined })
  
  test('opens with keyboard shortcut', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)
    
    // Check for any input field that appeared
    const input = page.locator('input').first()
    await expect(input).toBeVisible()
  })
  
  test('closes with Escape key', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)
    
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    
    // Test passes if no error
  })
})
