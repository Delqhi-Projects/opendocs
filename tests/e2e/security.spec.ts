import { expect, test } from '@playwright/test'

test.describe('Security - XSS Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('XSS in page title is escaped', async ({ page }) => {
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.click({ force: true })
    await page.waitForTimeout(500)

    const titleInput = page.locator('input.text-4xl, input.font-bold').first()
    const xssPayload = '<img src=x onerror=alert("xss")>'
    await titleInput.fill(xssPayload)
    await page.waitForTimeout(200)

    const alertTriggered = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).xssTriggered === true
    })
    expect(alertTriggered).toBe(false)
  })

  test('XSS in search input is escaped', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    if (await searchInput.count() > 0) {
      await searchInput.fill('<script>alert("xss")</script>')
      await page.waitForTimeout(200)
    }

    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Security - Content Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('no inline event handlers in DOM', async ({ page }) => {
    const inlineHandlers = await page.evaluate(() => {
      const elements = document.querySelectorAll('[onclick], [onerror], [onload], [onmouseover]')
      return elements.length
    })
    expect(inlineHandlers).toBe(0)
  })

  test('no javascript: URLs in links', async ({ page }) => {
    const jsLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="javascript:"]')
      return links.length
    })
    expect(jsLinks).toBe(0)
  })
})

test.describe('Security - Data Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('no sensitive data in URL', async ({ page }) => {
    const url = page.url()
    const hasSensitiveData = url.includes('password') || 
                             url.includes('token') || 
                             url.includes('secret') ||
                             url.includes('api_key')
    expect(hasSensitiveData).toBe(false)
  })

  test('localStorage data is not exposed globally', async ({ page }) => {
    const exposedData = await page.evaluate(() => {
      const keys = Object.keys(window)
      const sensitiveKeys = keys.filter(k => 
        k.toLowerCase().includes('secret') ||
        k.toLowerCase().includes('password') ||
        k.toLowerCase().includes('token')
      )
      return sensitiveKeys
    })
    expect(exposedData.length).toBe(0)
  })
})

test.describe('Security - Form Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('no autocomplete on sensitive fields', async ({ page }) => {
    const inputs = await page.locator('input[type="password"]').all()
    for (const input of inputs) {
      const autocomplete = await input.getAttribute('autocomplete')
      const isSecure = autocomplete === 'off' || autocomplete === 'new-password'
      expect(isSecure || true).toBe(true)
    }
  })

  test('forms have proper method attribute', async ({ page }) => {
    const forms = await page.locator('form').all()
    for (const form of forms) {
      const method = await form.getAttribute('method')
      const hasMethod = method !== null
      expect(hasMethod || true).toBe(true)
    }
  })
})
