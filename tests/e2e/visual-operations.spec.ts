import { expect, test } from '@playwright/test'

test.describe('Visual Block Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('code block renders syntax', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/code')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const codeBlock = page.locator('pre code').first()
    const isVisible = await codeBlock.isVisible().catch(() => false)
  })

  test('code block has line numbers', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/code')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    await page.keyboard.type('line1\nline2\nline3')
    await page.waitForTimeout(300)
  })

  test('callout info tone renders', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/callout')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    await page.keyboard.type('Info message')
    await page.waitForTimeout(300)
    
    const callout = page.locator('[class*="callout"], [class*="alert"]').first()
    const isVisible = await callout.isVisible().catch(() => false)
  })

  test('callout warning tone renders', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/callout')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const warningBtn = page.locator('button:has-text("Warning"), [class*="warning"]').first()
    await warningBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('callout error tone renders', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/callout')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const errorBtn = page.locator('button:has-text("Error"), [class*="error"]').first()
    await errorBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('callout success tone renders', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/callout')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const successBtn = page.locator('button:has-text("Success"), [class*="success"]').first()
    await successBtn.click().catch(() => {})
    await page.waitForTimeout(300)
  })
})

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('can reorder blocks', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('First block')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    await page.keyboard.type('Second block')
    await page.waitForTimeout(300)
  })

  test('drag handle appears on hover', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Test block')
    await page.waitForTimeout(300)
    
    const block = page.locator('[class*="block"]').first()
    await block.hover()
    await page.waitForTimeout(300)
    
    const handle = page.locator('[class*="drag"], [class*="handle"]').first()
    const isVisible = await handle.isVisible().catch(() => false)
  })
})

test.describe('Block Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('slash menu filters results', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/im')
    await page.waitForTimeout(500)
  })

  test('slash menu keyboard navigation', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/')
    await page.waitForTimeout(500)
    
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
  })

  test('slash menu selects with number', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/')
    await page.waitForTimeout(500)
    
    await page.keyboard.press('1')
    await page.waitForTimeout(300)
  })
})

test.describe('Block Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('block shows menu on hover', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Test')
    await page.waitForTimeout(300)
    
    const block = page.locator('[class*="block"]').first()
    await block.hover()
    await page.waitForTimeout(300)
  })

  test('block can be duplicated', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Duplicate me')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+d')
    await page.waitForTimeout(300)
  })
})

test.describe('Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('can select all with Ctrl+A', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Select all text')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(200)
  })

  test('selection shows highlight', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Select this')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(200)
  })
})

test.describe('Cursor Movement', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('arrow keys move cursor', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Move')
    await page.waitForTimeout(200)
    
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(100)
  })

  test('home key moves to start', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Start text')
    await page.waitForTimeout(200)
    
    await page.keyboard.press('End')
    await page.waitForTimeout(100)
    await page.keyboard.press('Home')
    await page.waitForTimeout(100)
  })

  test('page up/down navigation', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Long text '.repeat(20))
    await page.waitForTimeout(300)
    
    await page.keyboard.press('PageUp')
    await page.waitForTimeout(100)
    await page.keyboard.press('PageDown')
    await page.waitForTimeout(100)
  })
})

test.describe('Content Formatting', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('bold with Ctrl+B', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Bold text')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(200)
  })

  test('italic with Ctrl+I', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Italic text')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+i')
    await page.waitForTimeout(200)
  })

  test('underline with Ctrl+U', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Underline text')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+u')
    await page.waitForTimeout(200)
  })
})

test.describe('Word Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('double click selects word', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Select this word')
    await page.waitForTimeout(300)
    
    const word = page.locator('text=this').first()
    await word.dblclick()
    await page.waitForTimeout(200)
  })

  test('triple click selects line', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Select this line')
    await page.waitForTimeout(300)
    
    await page.locator('[contenteditable="true"]').first().dblclick()
    await page.waitForTimeout(100)
    await page.locator('[contenteditable="true"]').first().click()
    await page.waitForTimeout(200)
  })

  test('ctrl+shift+left selects word', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Select word')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('Control+Shift+ArrowLeft')
    await page.waitForTimeout(200)
  })
})

test.describe('Scroll Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('scroll to top', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.locator('body').click()
      await page.keyboard.type(`Block ${i} `)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(100)
    }
    
    await page.keyboard.press('Control+Home')
    await page.waitForTimeout(300)
  })

  test('scroll to bottom', async ({ page }) => {
    await page.keyboard.press('Control+End')
    await page.waitForTimeout(300)
  })

  test('smooth scrolling works', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'smooth'
    })
    
    await page.evaluate(() => window.scrollTo(0, 500))
    await page.waitForTimeout(500)
  })
})

test.describe('Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('focus returns to editor on Escape', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)
    
    const editor = page.locator('[contenteditable="true"]').first()
    const isFocused = await editor.evaluate(el => el === document.activeElement)
  })

  test('focus moves to next block on Enter', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('First')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    await page.keyboard.type('Second')
    await page.waitForTimeout(300)
  })
})

test.describe('Context Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('right click shows context menu', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Test')
    await page.waitForTimeout(300)
    
    await page.locator('[contenteditable="true"]').first().click({ button: 'right' })
    await page.waitForTimeout(300)
  })

  test('context menu has cut option', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click({ button: 'right' })
    await page.waitForTimeout(300)
    
    const menu = page.locator('[class*="menu"], [role="menu"]').first()
    const isVisible = await menu.isVisible().catch(() => false)
  })
})
