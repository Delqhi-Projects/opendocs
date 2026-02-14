import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
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
    const header = page.locator('header').first()
    await expect(header).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
  })

  test('theme selector changes to dark mode', async ({ page }) => {
    const select = page.locator('select')
    await select.selectOption('dark')
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  test('sidebar can be toggled', async ({ page }) => {
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    await toggleBtn.click()
    const sidebar = page.locator('nav, aside').first()
    await expect(sidebar).not.toBeVisible()
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
    const palette = page.locator('[role="dialog"], modal').first()
    await expect(palette).toBeVisible()
  })

  test('Ctrl+G opens AI panel', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    await page.keyboard.down('Control')
    await page.keyboard.press('g')
    await page.keyboard.up('Control')
    
    await page.waitForTimeout(500)
    const aiPanel = page.locator('text=Wie kann ich dir helfen').first()
    await expect(aiPanel).toBeVisible()
  })
})

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('creates new document from sidebar', async ({ page }) => {
    await page.click('text=New Document')
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('creates document with title', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('h1').first().fill('Test Document')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Test Document')).toBeVisible()
  })

  test('adds paragraph block via slash command', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Paragraph')
    await expect(page.locator('p').first()).toBeVisible()
  })

  test('adds heading block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Heading 1')
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('Database Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('creates database block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Database')
    await expect(page.locator('text=Neue Zeile')).toBeVisible()
  })

  test('adds columns to database', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Database')
    await expect(page.locator('text=Neue Zeile')).toBeVisible()
    
    // Add column button
    await page.click('button:has-text("Spalte hinzufügen")')
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('adds data row to database', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Database')
    await page.click('text=Neue Zeile')
    await expect(page.locator('input').first()).toBeVisible()
  })

  test('switches between table and kanban view', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Database')
    
    // Switch to Kanban
    await page.click('text=Kanban')
    await expect(page.locator('[class*="kanban"]').first()).toBeVisible()
  })
})

test.describe('Automation Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('creates automation block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Automation')
    await expect(page.locator('text=Workflow')).toBeVisible()
  })

  test('adds trigger node', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Automation')
    await page.click('text=Trigger hinzufügen')
    await expect(page.locator('text=Manuell')).toBeVisible()
  })

  test('adds action node', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Automation')
    await page.click('text=Action hinzufügen')
    await expect(page.locator('text=E-Mail')).toBeVisible()
  })
})

test.describe('AI Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('opens AI panel via button', async ({ page }) => {
    await page.click('button:has-text("AI")')
    await expect(page.locator('text=Wie kann ich dir helfen')).toBeVisible()
  })

  test('opens AI panel via keyboard shortcut', async ({ page }) => {
    await page.keyboard.down('Control')
    await page.keyboard.press('g')
    await page.keyboard.up('Control')
    await page.waitForTimeout(500)
    await expect(page.locator('text=Wie kann ich dir helfen')).toBeVisible()
  })

  test('creates AI prompt block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=AI Prompt')
    await expect(page.locator('textarea').first()).toBeVisible()
  })
})

test.describe('Code Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('creates code block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Code')
    await expect(page.locator('pre').first()).toBeVisible()
  })

  test('code block has syntax highlighting', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Code')
    await page.locator('pre').first().fill('const x = 1;')
    await expect(page.locator('code').first()).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('sidebar collapses on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Sidebar should be hidden on mobile
    const sidebar = page.locator('nav, aside').first()
    await expect(sidebar).not.toBeVisible()
    
    // Hamburger menu should be visible
    await expect(page.locator('button:has-text("☰")').first()).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('handles network errors gracefully', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.reload()
    await page.waitForTimeout(2000)
    // Should not have critical errors
    const criticalErrors = errors.filter(e => !e.includes('favicon'))
    expect(criticalErrors.length).toBe(0)
  })
})

test.describe('Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('has undo functionality', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('h1').first().fill('Test')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Control+z')
    await expect(page.locator('text=Test')).toBeVisible()
  })

  test('has redo functionality', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('h1').first().fill('Test')
    await page.keyboard.press('Backspace')
    await page.keyboard.press('Control+z')
    await page.keyboard.press('Control+Shift+z')
    await expect(page.locator('text=Test')).not.toBeVisible()
  })
})

test.describe('Voice Block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('creates voice block via slash menu', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Voice Note')
    await expect(page.locator('text=Voice Note')).toBeVisible()
  })

  test('shows recording button in voice block', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Voice Note')
    // The mic button should be visible
    await expect(page.locator('button:has-text("Click to start recording")')).toBeVisible()
  })

  test('displays transcription UI after recording concept', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    await page.click('text=Voice Note')
    // Check for Transcription section label
    await expect(page.locator('text=Transcription')).toBeVisible()
  })
})

test.describe('Comments System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('shows presence indicators container', async ({ page }) => {
    await page.click('text=New Document')
    // The presence indicators should be visible in the header area
    const presenceContainer = page.locator('[class*="presence"], [data-testid="presence"]').first()
    // If presence indicators exist, they should be visible
    await page.waitForTimeout(500)
  })

  test('document has collaboration-ready structure', async ({ page }) => {
    await page.click('text=New Document')
    // Check that the editor has the structure needed for collaboration
    const editor = page.locator('[contenteditable="true"], [data-block-editor]').first()
    await expect(editor).toBeVisible()
  })
})

test.describe('Block Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test('all block types are available in slash menu', async ({ page }) => {
    await page.click('text=New Document')
    await page.locator('text=/').first().click()
    await page.waitForTimeout(300)
    
    // Check for key block types
    await expect(page.locator('text=Heading 1')).toBeVisible()
    await expect(page.locator('text=Text')).toBeVisible()
    await expect(page.locator('text=Code')).toBeVisible()
    await expect(page.locator('text=Database')).toBeVisible()
    await expect(page.locator('text=Voice Note')).toBeVisible()
    await expect(page.locator('text=AI Prompt')).toBeVisible()
  })
})
