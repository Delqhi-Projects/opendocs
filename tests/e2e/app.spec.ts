import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/OpenDocs/)
  })

  test('creates new document', async ({ page }) => {
    await page.goto('/')
    await page.click('text=New Document')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('adds paragraph block', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Add Block')
    await page.click('text=Paragraph')
    await expect(page.locator('p')).toBeVisible()
  })
})
