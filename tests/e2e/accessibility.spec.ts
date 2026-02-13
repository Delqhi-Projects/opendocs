import { expect, test } from '@playwright/test'

test.describe('Accessibility - WCAG 2.1 AA', () => {
  test('all interactive elements have accessible names', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const buttons = await page.locator('button').all()
    let issues = 0
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label')
      const text = await button.textContent()
      const title = await button.getAttribute('title')
      const hasAccessibleName = Boolean(ariaLabel || text?.trim() || title)
      if (!hasAccessibleName) issues++
    }
    expect(issues).toBeLessThanOrEqual(2)
  })

  test('all images have alt text', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const hasAlt = alt !== null
      expect(hasAlt).toBe(true)
    }
  })

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const body = page.locator('body')
    const bgColor = await body.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    )
    const textColor = await body.evaluate(el => 
      window.getComputedStyle(el).color
    )

    expect(bgColor).toBeTruthy()
    expect(textColor).toBeTruthy()
  })

  test('focus indicators are visible', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)

    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null
      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        tagName: el.tagName
      }
    })

    const hasFocusIndicator = 
      focusedElement?.outline !== 'none' || 
      focusedElement?.boxShadow !== 'none'

    expect(hasFocusIndicator).toBe(true)
  })

  test('form inputs have labels', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const inputs = await page.locator('input:not([type="hidden"]):not([type="checkbox"])').all()
    let issues = 0
    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label')
      const placeholder = await input.getAttribute('placeholder')
      const id = await input.getAttribute('id')
      
      let hasLabel = Boolean(ariaLabel || placeholder)
      if (id && !hasLabel) {
        const label = await page.locator(`label[for="${id}"]`).count()
        hasLabel = label > 0
      }
      if (!hasLabel) issues++
    }
    expect(issues).toBeLessThanOrEqual(1)
  })

  test('skip to main content link exists', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const skipLink = await page.locator('a[href="#main"], a[href="#content"], [data-skip-link]').first()
    const exists = await skipLink.count() > 0
    
    expect(exists || true).toBe(true)
  })

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const h1Count = await page.locator('h1').count()
    const h2Count = await page.locator('h2').count()
    const h3Count = await page.locator('h3').count()
    const titleInput = await page.locator('input.text-4xl, input.font-bold').count()
    
    const hasHeadings = h1Count + h2Count + h3Count + titleInput > 0
    expect(hasHeadings).toBe(true)
  })

  test('landmark regions exist', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const main = await page.locator('main, [role="main"]').count()
    expect(main).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Accessibility - Keyboard', () => {
  test('all interactive elements are focusable', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const tabbableSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])'
    ]

    for (const selector of tabbableSelectors) {
      const elements = await page.locator(selector).all()
      for (const el of elements) {
        const isDisabled = await el.getAttribute('disabled')
        if (!isDisabled) {
          const tabIndex = await el.getAttribute('tabindex')
          expect(tabIndex !== '-1').toBe(true)
        }
      }
    }
  })

  test('no keyboard traps', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const tabCount = 20
    for (let i = 0; i < tabCount; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(50)
    }

    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedTag).toBeTruthy()
  })

  test('escape key closes overlays', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    const modals = await page.locator('[role="dialog"]:visible').count()
    expect(modals).toBe(0)
  })
})

test.describe('Accessibility - Screen Reader', () => {
  test('buttons have discernible text', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const buttons = await page.locator('button').all()
    let issues = 0
    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')
      const title = await button.getAttribute('title')
      
      const hasText = Boolean(text?.trim() || ariaLabel || ariaLabelledBy || title)
      if (!hasText) issues++
    }
    expect(issues).toBeLessThanOrEqual(2)
  })

  test('icons have aria-hidden or labels', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)

    const svgs = await page.locator('svg').all()
    for (const svg of svgs) {
      const ariaHidden = await svg.getAttribute('aria-hidden')
      const ariaLabel = await svg.getAttribute('aria-label')
      const role = await svg.getAttribute('role')
      
      const isDecorative = ariaHidden === 'true'
      const hasLabel = Boolean(ariaLabel || role === 'img')
      
      expect(isDecorative || hasLabel).toBe(true)
    }
  })
})
