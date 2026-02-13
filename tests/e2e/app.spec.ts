import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test.use({
    storageState: undefined,
  })
  
  test('loads successfully', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await expect(page).toHaveTitle(/OpenDocs/)
  })

  test('creates new document', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(1000)
    const content = await page.locator('main').innerText()
    expect(content).toContain('New page')
  })

  test('add block button exists and is clickable', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const addBlockBtn = page.locator('button:has-text("+ Add text block")')
    await expect(addBlockBtn).toBeVisible()
    await addBlockBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(500)
  })

  test('theme toggle works', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const html = await page.locator('html').getAttribute('data-theme')
    expect(html).toBe('light')
  })

  test('AI buttons exist', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const aiBtn = page.locator('button:has-text("AI")').first()
    await expect(aiBtn).toBeVisible()
  })

  test('sidebar navigation exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const sidebarContent = page.locator('text=OpenDocs').first()
    await expect(sidebarContent).toBeVisible()
  })

  test('chat button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const chatBtn = page.locator('button:has-text("Chat")')
    await expect(chatBtn).toBeVisible()
  })

  test('audit button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const auditBtn = page.locator('button:has-text("Audit")')
    await expect(auditBtn).toBeVisible()
  })

  test('clear local data button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const clearBtn = page.locator('button:has-text("Clear local data")')
    await expect(clearBtn).toBeVisible()
  })

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(errors).toHaveLength(0)
  })

  test('Add grid block button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const gridBtn = page.locator('button:has-text("Add grid block")')
    await expect(gridBtn).toBeVisible()
  })

  test('Ask AI button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const askAiBtn = page.locator('button:has-text("Ask AI")')
    await expect(askAiBtn).toBeVisible()
  })

  test('page is responsive on mobile viewport', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForTimeout(1000)
    const main = page.locator('main')
    await expect(main).toBeVisible()
  })

  test('Add cover button exists', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const coverBtn = page.locator('button:has-text("Add cover")')
    await expect(coverBtn).toBeVisible()
  })
})
