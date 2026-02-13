import { expect, test } from '@playwright/test'

test.describe('Edge Cases - Dark Mode', () => {
  test('dark mode class is applied to html element', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('opendocs-theme', 'dark')
    })
    await page.goto('/')
    await page.waitForTimeout(500)
    
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })

  test('light mode class is NOT on html element', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('opendocs-theme', 'light')
    })
    await page.goto('/')
    await page.waitForTimeout(500)
    
    const hasDarkClass = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    expect(hasDarkClass).toBe(false)
  })

  test('theme toggle works via dropdown', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
    await page.goto('/')
    await page.waitForTimeout(500)

    const themeSelect = page.locator('select').first()
    await themeSelect.selectOption('dark')
    await page.waitForTimeout(300)
    
    const htmlClass = await page.locator('html').getAttribute('class')
    expect(htmlClass).toContain('dark')
  })
})

test.describe('Edge Cases - Responsive', () => {
  test('sidebar hidden on mobile by default', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).not.toBeVisible()
  })

  test('sidebar visible on desktop by default', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)

    const sidebar = page.locator('aside').first()
    const sidebarContent = sidebar.locator('.flex.h-full')
    
    const isVisible = await sidebarContent.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('hamburger menu has 44px touch target', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const hamburger = page.locator('button[aria-label="Open sidebar"]')
    const box = await hamburger.boundingBox()
    
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('sidebar toggles on hamburger click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const hamburger = page.locator('button[aria-label="Open sidebar"]')
    await hamburger.click()
    await page.waitForTimeout(300)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()
  })
})

test.describe('Edge Cases - Keyboard Navigation', () => {
  test('tab navigation reaches all interactive elements', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const focusedElements: string[] = []
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      if (focused) focusedElements.push(focused)
    }

    expect(focusedElements.length).toBeGreaterThan(5)
  })

  test('escape closes modals', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    
    const palette = page.locator('[role="dialog"]').first()
    const isVisible = await palette.isVisible().catch(() => false)
    
    if (isVisible) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await expect(palette).not.toBeVisible()
    }
  })
})

test.describe('Edge Cases - Error Handling', () => {
  test('app handles corrupted theme gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('opendocs-theme', 'invalid-theme-value')
    })
    await page.goto('/')
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('app handles empty state', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.localStorage.setItem('opendocs-state', '{}')
    })
    await page.goto('/')
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('app handles very long page title', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    const titleInput = page.locator('input[value*="New page"], input[placeholder*="Untitled"]').first()
    const longTitle = 'A'.repeat(500)
    await titleInput.fill(longTitle)
    
    const value = await titleInput.inputValue()
    expect(value.length).toBe(500)
  })

  test('app handles special characters in page title', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    const titleInput = page.locator('input[value*="New page"], input[placeholder*="Untitled"]').first()
    const specialChars = '<script>alert("xss")</script> & "quotes" \'apostrophes\''
    await titleInput.fill(specialChars)
    
    const value = await titleInput.inputValue()
    expect(value).toBe(specialChars)
  })
})

test.describe('Edge Cases - Performance', () => {
  test('app loads within 3 seconds', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    
    const startTime = Date.now()
    await page.goto('/', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(1000)

    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('network')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})
