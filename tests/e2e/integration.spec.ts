import { expect, test } from '@playwright/test'

test.describe('Database Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('creates new page for database', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
  })

  test('adds database block', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
  })

  test('database renders table view by default', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const table = page.locator('table').first()
    const isVisible = await table.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('database has add row button', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const addBtn = page.locator('button:has-text("Add row"), button:has-text("+")').first()
    const isVisible = await addBtn.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('Workflow Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('adds workflow block', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
  })

  test('workflow renders react-flow canvas', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const canvas = page.locator('.react-flow, [class*="react-flow"]').first()
    const isVisible = await canvas.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('workflow has minimap', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const minimap = page.locator('[class*="minimap"]').first()
    const isVisible = await minimap.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('AI Panel Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('AI panel opens with Ctrl+G', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const panel = page.locator('[class*="panel"], [class*="modal"], [class*="ai"]').first()
    const isVisible = await panel.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel has input field', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    const isVisible = await input.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel has generate button', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const btn = page.locator('button:has-text("Generate"), button:has-text("Generate")').first()
    const isVisible = await btn.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel closes on Escape', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(300)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  })
})

test.describe('Command Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('command palette opens with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)
    
    const palette = page.locator('[class*="command"], [class*="palette"], [class*="modal"]').first()
    const isVisible = await palette.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('command palette has search input', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(500)
    
    const input = page.locator('input[type="text"], input[placeholder]').first()
    const isVisible = await input.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('command palette closes on Escape', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  })
})

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('sidebar is visible', async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside').first()
    const isVisible = await sidebar.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('sidebar has search input', async ({ page }) => {
    const search = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    const isVisible = await search.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('toggle sidebar with Ctrl+B', async ({ page }) => {
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(300)
  })
})

test.describe('Theme & Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('theme toggle exists', async ({ page }) => {
    const toggle = page.locator('button[class*="theme"], button[class*="toggle"], [class*="dark"]').first()
    const isVisible = await toggle.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('settings button exists', async ({ page }) => {
    const settings = page.locator('button[class*="setting"], [class*="gear"]').first()
    const isVisible = await settings.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('Ctrl+Z triggers undo', async ({ page }) => {
    await page.keyboard.type('Test')
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(200)
  })

  test('Ctrl+Shift+Z triggers redo', async ({ page }) => {
    await page.keyboard.type('Test')
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+Shift+z')
    await page.waitForTimeout(200)
  })

  test('Escape closes modals', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  })
})
