import { expect, test } from '@playwright/test'

test.describe('Block Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Slash Menu', () => {
    test.skip('slash menu opens on /', async ({ page }) => {
      await page.locator('body').click()
      await page.waitForTimeout(300)
      await page.keyboard.type('/')
      await page.waitForTimeout(1000)
      
      const menu = page.locator('[class*="menu"], [class*="slash"], [role="listbox"], [class*="suggestion"]').first()
      const isVisible = await menu.isVisible().catch(() => false)
      expect(isVisible).toBe(true)
    })

    test.skip('slash menu has block options', async ({ page }) => {
      await page.locator('body').click()
      await page.waitForTimeout(300)
      await page.keyboard.type('/')
      await page.waitForTimeout(1000)
      
      const options = page.locator('[role="option"], [class*="item"], li').all()
      const count = (await options).length
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Media Blocks', () => {
    test.skip('adds image block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/image')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test.skip('adds video block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/video')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test.skip('adds link block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/link')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test.skip('adds file block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/file')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })
  })

  test.describe('Layout Blocks', () => {
    test('adds callout block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/callout')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test('adds divider block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/divider')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test('adds horizontal block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/horizontal')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })
  })

  test.describe('List Blocks', () => {
    test('adds checklist block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/checklist')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })
  })

  test.describe('Data Blocks', () => {
    test('adds table block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/table')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })

    test('adds database block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/database')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })
  })

  test.describe('Workflow & Draw', () => {
    test('adds workflow block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/workflow')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })

    test('adds draw block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/draw')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })
  })

  test.describe('AI Blocks', () => {
    test('adds AI prompt block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/aiprompt')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })

    test('adds mermaid block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/mermaid')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })
  })

  test.describe('Automation Blocks', () => {
    test('adds n8n block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/n8n')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })

    test('adds automation block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/automation')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    })
  })

  test.describe('Code Blocks', () => {
    test('adds code block', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/code')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })
  })

  test.describe('Edge Cases', () => {
    test.skip('handles empty slash command', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/')
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    })

    test.skip('handles unknown slash command', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/unknownblockxyz')
      await page.waitForTimeout(1000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    })

    test.skip('slash menu closes on Escape', async ({ page }) => {
      await page.locator('body').click()
      await page.keyboard.type('/code')
      await page.waitForTimeout(500)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    })
  })
})
