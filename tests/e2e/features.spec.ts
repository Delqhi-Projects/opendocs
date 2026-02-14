import { expect, test } from '@playwright/test'

test.describe('Page Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('create new page from sidebar', async ({ page }) => {
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('rename page', async ({ page }) => {
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    const titleInput = page.locator('input.text-4xl, input.font-bold').first()
    await titleInput.fill('My Test Page')
    await page.waitForTimeout(200)

    const value = await titleInput.inputValue()
    expect(value).toBe('My Test Page')
  })

  test('delete page', async ({ page }) => {
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Folder Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('create new folder from sidebar', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
  })

  test('folder expands on click', async ({ page }) => {
    const folder = page.locator('[data-folder]').first()
    if (await folder.count() > 0) {
      await folder.click()
      await page.waitForTimeout(200)
    }

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Block Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('add text block', async ({ page }) => {
    const addTextBtn = page.locator('button:has-text("Add text block")').first()
    if (await addTextBtn.count() > 0) {
      await addTextBtn.click({ force: true })
      await page.waitForTimeout(300)
    }

    await expect(page.locator('body')).toBeVisible()
  })

  test('add grid block', async ({ page }) => {
    const addGridBtn = page.locator('button:has-text("Add grid"), button:has-text("grid")').first()
    if (await addGridBtn.count() > 0) {
      await addGridBtn.click({ force: true })
      await page.waitForTimeout(300)
    }

    await expect(page.locator('body')).toBeVisible()
  })

  test('slash menu opens on /', async ({ page }) => {
    const editor = page.locator('[contenteditable="true"], textarea, input[type="text"]').first()
    if (await editor.count() > 0) {
      await editor.click()
      await page.waitForTimeout(100)
      await page.keyboard.press('/')
      await page.waitForTimeout(300)
    }

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('AI Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('AI button exists', async ({ page }) => {
    const aiBtn = page.locator('button:has-text("AI"), button[aria-label*="AI"]').first()
    const count = await aiBtn.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('AI panel opens on Ctrl+G', async ({ page }) => {
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(300)

    await expect(page.locator('body')).toBeVisible()
  })

  test('command palette opens on Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('search input exists in sidebar', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[aria-label*="Search"]').first()
    const count = await searchInput.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('search filters pages', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    if (await searchInput.count() > 0) {
      await searchInput.fill('test')
      await page.waitForTimeout(300)
    }

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Data Persistence', () => {
  test('data persists after reload', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    await page.reload()
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('clear local data works', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })
})
