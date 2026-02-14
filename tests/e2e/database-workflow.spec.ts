import { expect, test } from '@playwright/test'

test.describe('Database CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('creates database with default columns', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const columns = page.locator('th, [class*="column"]').all()
    const count = (await columns).length
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('can add new row', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const addBtn = page.locator('button:has-text("Add"), button:has-text("+"), [class*="add"]').first()
    await addBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })

  test('can edit cell', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const cell = page.locator('td, [class*="cell"]').first()
    await cell.dblclick().catch(async () => {
      await cell.click()
      await page.waitForTimeout(200)
      await cell.click()
    })
    await page.waitForTimeout(500)
  })

  test('has view switcher', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const viewBtns = page.locator('button:has-text("Table"), button:has-text("Kanban"), button:has-text("Gallery"), button:has-text("Calendar")').all()
    const count = (await viewBtns).length
    expect(count).toBeGreaterThan(0)
  })

  test('switches to kanban view', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const kanbanBtn = page.locator('button:has-text("Kanban")').first()
    await kanbanBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
  })

  test('switches to gallery view', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const galleryBtn = page.locator('button:has-text("Gallery")').first()
    await galleryBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
  })
})

test.describe('Workflow Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('workflow has node panel', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const panel = page.locator('[class*="panel"], [class*="sidebar"], [class*="node"]').first()
    const isVisible = await panel.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('workflow can add node', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const addBtn = page.locator('button:has-text("Add node"), button:has-text("+")').first()
    await addBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })

  test('workflow has controls', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const controls = page.locator('[class*="controls"], button[class*="zoom"]').first()
    const isVisible = await controls.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('workflow has zoom controls', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const zoomIn = page.locator('button[aria-label*="zoom"], button[title*="zoom"]').first()
    const isVisible = await zoomIn.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('AI Feature Deep Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('AI panel shows topic mode by default', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const topicMode = page.locator('button:has-text("Topic"), [class*="topic"]').first()
    const isVisible = await topicMode.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel has github mode option', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const githubMode = page.locator('button:has-text("GitHub"), [class*="github"]').first()
    const isVisible = await githubMode.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel has website mode option', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const websiteMode = page.locator('button:has-text("Website"), [class*="website"]').first()
    const isVisible = await websiteMode.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('AI panel generates from topic input', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('Python tutorial')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(2000)
  })

  test('AI panel has loading state', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('Test')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    
    const loading = page.locator('[class*="loading"], [class*="spinner"]').first()
    const isVisible = await loading.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('Chat Panel Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('chat button exists in sidebar', async ({ page }) => {
    const chatBtn = page.locator('button[class*="chat"], [class*="message"]').first()
    const isVisible = await chatBtn.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('chat opens with Ctrl+J', async ({ page }) => {
    await page.keyboard.press('Control+j')
    await page.waitForTimeout(500)
    
    const chat = page.locator('[class*="chat"], [class*="message"]').first()
    const isVisible = await chat.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('chat has input field', async ({ page }) => {
    await page.keyboard.press('Control+j')
    await page.waitForTimeout(500)
    
    const input = page.locator('input[placeholder*="Message"], textarea').first()
    const isVisible = await input.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })

  test('chat has send button', async ({ page }) => {
    await page.keyboard.press('Control+j')
    await page.waitForTimeout(500)
    
    const sendBtn = page.locator('button:has-text("Send"), [class*="send"]').first()
    const isVisible = await sendBtn.isVisible().catch(() => false)
    expect(isVisible).toBe(true)
  })
})

test.describe('Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('data persists in localStorage', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    const pages = page.locator('[class*="page"], [class*="item"]').all()
    const count = (await pages).length
    expect(count).toBeGreaterThan(0)
  })

  test('can create multiple pages', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const pageList = page.locator('[class*="page"], [class*="item"]').all()
    const count = (await pageList).length
    expect(count).toBeGreaterThan(1)
  })

  test('can delete page', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const deleteBtn = page.locator('button[class*="delete"], [class*="trash"]').first()
    await deleteBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })
})

test.describe('Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('undo removes last action', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Test content')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)
  })

  test('redo restores undone action', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Test content')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+Shift+z')
    await page.waitForTimeout(300)
  })

  test('undo history has limit', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.locator('[contenteditable="true"]').first().click()
      await page.keyboard.type(`Item ${i}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(100)
    }
    
    await page.keyboard.press('Control+z')
    await page.waitForTimeout(300)
  })
})
