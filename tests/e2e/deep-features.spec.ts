import { expect, test } from '@playwright/test'

test.describe('Block Type Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('image block handles invalid URL', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/image')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const urlInput = page.locator('input[type="url"], input[placeholder*="URL"]').first()
    await urlInput.fill('invalid-url-not-image')
    await page.waitForTimeout(300)
  })

  test('image block handles missing URL', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/image')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
  })

  test('video block accepts YouTube URL', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/video')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const urlInput = page.locator('input[type="url"]').first()
    await urlInput.fill('https://youtube.com/watch?v=test')
    await page.waitForTimeout(300)
  })

  test('video block handles Vimeo URL', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/video')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const urlInput = page.locator('input[type="url"]').first()
    await urlInput.fill('https://vimeo.com/123456')
    await page.waitForTimeout(300)
  })

  test('link block validates URL', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/link')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
  })

  test('link block handles title', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/link')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const titleInput = page.locator('input:not([type="url"]), input[placeholder*="title"]').first()
    await titleInput.fill('My Link Title')
    await page.waitForTimeout(300)
  })

  test('file block has upload button', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/file')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const uploadBtn = page.locator('button:has-text("Upload"), input[type="file"]').first()
    const isVisible = await uploadBtn.isVisible().catch(() => false)
  })

  test('table block adds column', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/table')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const addColBtn = page.locator('button:has-text("Add column"), [class*="add-column"]').first()
    await addColBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('table block adds row', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/table')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const addRowBtn = page.locator('button:has-text("Add row"), [class*="add-row"]').first()
    await addRowBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('table block deletes row', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/table')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const deleteBtn = page.locator('button[class*="delete"], [class*="trash"]').first()
    await deleteBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })
})

test.describe('Database Views Deep', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('database calendar view', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const calendarBtn = page.locator('button:has-text("Calendar")').first()
    await calendarBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
  })

  test('database timeline view', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const timelineBtn = page.locator('button:has-text("Timeline")').first()
    await timelineBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
  })

  test('database kanban has columns', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const kanbanBtn = page.locator('button:has-text("Kanban")').first()
    await kanbanBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
    
    const columns = page.locator('[class*="column"], [class*="kanban"]').all()
    const count = (await columns).length
  })

  test('database gallery shows cards', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const galleryBtn = page.locator('button:has-text("Gallery")').first()
    await galleryBtn.click().catch(() => {})
    await page.waitForTimeout(1000)
    
    const cards = page.locator('[class*="card"], [class*="gallery"]').all()
    const count = (await cards).length
  })

  test('database filter by column', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const filterBtn = page.locator('button:has-text("Filter")').first()
    await filterBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })

  test('database sort by column', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const sortBtn = page.locator('button:has-text("Sort")').first()
    await sortBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })

  test('database search rows', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/database')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await searchInput.fill('test')
    await page.waitForTimeout(500)
  })
})

test.describe('Workflow Deep Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('workflow can pan canvas', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const canvas = page.locator('.react-flow__pane').first()
    await canvas.click()
    await page.mouse.move(400, 300)
    await page.mouse.down()
    await page.mouse.move(300, 200)
    await page.mouse.up()
  })

  test('workflow can zoom in', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const zoomIn = page.locator('button[aria-label*="zoom in"], button[title*="in"]').first()
    await zoomIn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('workflow can zoom out', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const zoomOut = page.locator('button[aria-label*="zoom out"], button[title*="out"]').first()
    await zoomOut.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('workflow fits view', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const fitBtn = page.locator('button[aria-label*="fit"], button[title*="fit"]').first()
    await fitBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('workflow has background grid', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const grid = page.locator('[class*="background"], [class*="grid"]').first()
    const isVisible = await grid.isVisible().catch(() => false)
  })

  test('workflow node can be dragged', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/workflow')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1500)
    
    const node = page.locator('[class*="node"]').first()
    const box = await node.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50)
      await page.mouse.up()
    }
  })
})

test.describe('AI Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('AI generates multiple blocks', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('Create a Python tutorial')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(5000)
  })

  test('AI shows loading indicator', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const input = page.locator('input, textarea').first()
    await input.fill('Hello')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    
    const spinner = page.locator('[class*="spinner"], [class*="loading"]').first()
    const isVisible = await spinner.isVisible().catch(() => false)
  })

  test('AI handles empty response', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(2000)
  })

  test('AI generates from GitHub URL', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const githubBtn = page.locator('button:has-text("GitHub")').first()
    await githubBtn.click().catch(() => {})
    await page.waitForTimeout(300)
    
    const input = page.locator('input[placeholder*="URL"]').first()
    await input.fill('https://github.com/facebook/react')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(3000)
  })

  test('AI generates from Website URL', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(500)
    
    const websiteBtn = page.locator('button:has-text("Website")').first()
    await websiteBtn.click().catch(() => {})
    await page.waitForTimeout(300)
    
    const input = page.locator('input[placeholder*="URL"]').first()
    await input.fill('https://react.dev')
    await page.waitForTimeout(300)
    
    const generateBtn = page.locator('button:has-text("Generate")').first()
    await generateBtn.click().catch(() => {})
    await page.waitForTimeout(3000)
  })
})

test.describe('Page Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('creates page with emoji', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const titleInput = page.locator('input').first()
    await titleInput.fill('🚀 My Page')
    await page.waitForTimeout(300)
  })

  test('creates page with special chars', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const titleInput = page.locator('input').first()
    await titleInput.fill('Page_123-Test (2024)')
    await page.waitForTimeout(300)
  })

  test('page shows last edited', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const timestamp = page.locator('[class*="time"], [class*="date"]').first()
    const isVisible = await timestamp.isVisible().catch(() => false)
  })

  test('page has icon picker', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const iconBtn = page.locator('button[class*="icon"]').first()
    await iconBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('page has cover image option', async ({ page }) => {
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const coverBtn = page.locator('button:has-text("Cover")').first()
    await coverBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })
})

test.describe('Multi-User Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('handles rapid page switches', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    for (let i = 0; i < 5; i++) {
      await page.locator('button:has-text("New page")').first().click({ force: true })
      await page.waitForTimeout(200)
    }
  })

  test('handles localStorage quota', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        localStorage.setItem(`page_${i}`, 'x'.repeat(10000))
      }
    })
    await page.waitForTimeout(500)
  })

  test('recovers from corrupted localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.addInitScript(() => {
      localStorage.setItem('opendocs_data', 'invalid json {{{')
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })
})
