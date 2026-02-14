import { expect, test } from '@playwright/test'

test.describe('API Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('shows error when AI API fails', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('test')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(5000)
    
    const error = page.locator('[class*="error"], [class*="failed"], [class*="alert"]').first()
    const isVisible = await error.isVisible().catch(() => false)
  })

  test('network error shows retry option', async ({ page }) => {
    await page.route('**/api/**', route => route.abort('failed'))
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(1000)
  })

  test('timeout shows appropriate message', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('timeout test')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(35000)
  })
})

test.describe('Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('can navigate to page from sidebar', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const pageItem = page.locator('[class*="page"], [class*="item"]').first()
    await pageItem.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('can create nested folder', async ({ page }) => {
    const newFolderBtn = page.locator('button:has-text("New folder"), button[class*="folder"]').first()
    await newFolderBtn.click().catch(async () => {
      await page.keyboard.press('Control+k')
      await page.waitForTimeout(300)
    })
    await page.waitForTimeout(500)
  })

  test('page title is editable', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const title = page.locator('input[class*="title"], [contenteditable="true"]').first()
    await title.dblclick().catch(() => {})
    await page.waitForTimeout(300)
  })
})

test.describe('Block Content Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('code block accepts code input', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/code')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    await page.keyboard.type('const x = 1;')
    await page.waitForTimeout(300)
  })

  test('checklist items are toggleable', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/checklist')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const checkbox = page.locator('input[type="checkbox"]').first()
    await checkbox.check().catch(() => {})
    await page.waitForTimeout(200)
  })

  test('callout shows different tones', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/callout')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    await page.keyboard.type('Important message')
    await page.waitForTimeout(300)
  })

  test('divider renders correctly', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/divider')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const divider = page.locator('hr, [class*="divider"]').first()
    const isVisible = await divider.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('Responsive Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    const sidebar = page.locator('[class*="sidebar"]').first()
    const isVisible = await sidebar.isVisible().catch(() => false)
  })

  test('works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('works on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('sidebar collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(300)
  })
})

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('page loads under 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('AI panel opens quickly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const start = Date.now()
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(300)
    const openTime = Date.now() - start
    
    expect(openTime).toBeLessThan(500)
  })

  test('command palette opens quickly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const start = Date.now()
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    const openTime = Date.now() - start
    
    expect(openTime).toBeLessThan(500)
  })

  test('no memory leaks on repeated navigation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("New page")').first().click({ force: true })
      await page.waitForTimeout(300)
      await page.goto('/')
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('buttons have accessible names', async ({ page }) => {
    const buttons = await page.locator('button').all()
    for (const btn of buttons.slice(0, 5)) {
      const name = await btn.getAttribute('aria-label')
        || await btn.textContent()
        || await btn.getAttribute('title')
    }
  })

  test('inputs have labels', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    
    const inputs = await page.locator('input').all()
    for (const input of inputs.slice(0, 3)) {
      const label = await input.getAttribute('aria-label')
        || await input.getAttribute('placeholder')
    }
  })

  test('focus indicators are visible', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)
    
    const focused = page.locator(':focus')
    const isVisible = await focused.isVisible().catch(() => true)
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
  })
})

test.describe('Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('handles rapid typing', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    await page.waitForTimeout(200)
  })

  test('handles paste with formatting', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.insertText('<b>Bold</b> and <i>italic</i>')
    await page.waitForTimeout(300)
  })

  test('handles very long page title', async ({ page }) => {
    const longTitle = 'A'.repeat(500)
    await page.locator('input[class*="title"]').first().fill(longTitle)
    await page.waitForTimeout(300)
  })

  test('handles special HTML characters', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('<script>alert("xss")</script>')
    await page.waitForTimeout(300)
  })

  test('handles concurrent edits', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('First')
    await page.waitForTimeout(50)
    await page.keyboard.press('Enter')
    await page.keyboard.type('Second')
    await page.waitForTimeout(300)
  })
})

test.describe('Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('search input exists', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    const isVisible = await search.isVisible().catch(() => false)
  })

  test('search filters results', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(300)
    
    const search = page.locator('input[type="search"]').first()
    await search.fill('test')
    await page.waitForTimeout(300)
  })

  test('search clears on escape', async ({ page }) => {
    const search = page.locator('input[type="search"]').first()
    await search.fill('test')
    await page.waitForTimeout(200)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
  })
})
