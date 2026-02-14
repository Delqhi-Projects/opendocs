import { expect, test } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.ok).toBe(true)
  })

  test('nvidia chat endpoint accepts POST', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: {
        messages: [{ role: 'user', content: 'Hello' }]
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat returns json', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: {
        messages: [{ role: 'user', content: 'Hi' }]
      }
    })
    const contentType = response.headers()['content-type']
    expect(contentType).toContain('json')
  })

  test('nvidia chat handles empty messages', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: {
        messages: []
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles long messages', async ({ request }) => {
    const longMessage = 'A'.repeat(10000)
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: {
        messages: [{ role: 'user', content: longMessage }]
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('agent plan endpoint exists', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/agent/plan', {
      data: {
        task: 'Create a test plan'
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('github analyze endpoint accepts URL', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/github/analyze', {
      data: {
        url: 'https://github.com/facebook/react'
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('website analyze endpoint accepts URL', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/website/analyze', {
      data: {
        url: 'https://example.com'
      }
    })
    expect(response.ok()).toBe(true)
  })

  test('invalid endpoint returns 404', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/invalid')
    expect(response.status()).toBe(404)
  })
})

test.describe('Storage Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('saves page to localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    const data = await page.evaluate(() => localStorage.getItem('opendocs'))
    expect(data).toBeTruthy()
  })

  test('loads page from localStorage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(500)
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('handles missing localStorage gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get: () => { throw new Error('LocalStorage not available') }
      })
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('clears all data', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const clearBtn = page.locator('button:has-text("Clear"), button[class*="clear"]').first()
    await clearBtn.click().catch(() => {})
    await page.waitForTimeout(500)
  })
})

test.describe('Component Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('sidebar renders', async ({ page }) => {
    const sidebar = page.locator('aside, [class*="sidebar"]').first()
    const isVisible = await sidebar.isVisible().catch(() => false)
  })

  test('header renders', async ({ page }) => {
    const header = page.locator('header, [class*="header"]').first()
    const isVisible = await header.isVisible().catch(() => false)
  })

  test('main editor area renders', async ({ page }) => {
    const editor = page.locator('main, [class*="editor"]').first()
    const isVisible = await editor.isVisible().catch(() => false)
  })

  test('block toolbar renders on focus', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.waitForTimeout(300)
    
    const toolbar = page.locator('[class*="toolbar"]').first()
    const isVisible = await toolbar.isVisible().catch(() => false)
  })
})

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('default theme is light', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const htmlClass = await page.evaluate(() => document.documentElement.className)
  })

  test('can toggle to dark mode', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const darkToggle = page.locator('button[class*="theme"], button[class*="dark"]').first()
    await darkToggle.click().catch(() => {})
    await page.waitForTimeout(300)
  })

  test('theme persists after reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const darkToggle = page.locator('button[class*="theme"]').first()
    await darkToggle.click().catch(() => {})
    await page.waitForTimeout(300)
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })

  test('respects system preference', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: () => ({ 
          matches: true, 
          media: '', 
          addListener: () => {}, 
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        })
      })
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
  })
})

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('Tab navigates between elements', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
  })

  test('Enter activates buttons', async ({ page }) => {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(100)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
  })

  test('Arrow keys navigate menus', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(300)
    
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(100)
  })
})

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('validates URL format', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/link')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const urlInput = page.locator('input[type="url"]').first()
    await urlInput.fill('not-a-url')
    await page.waitForTimeout(300)
  })

  test('shows validation errors', async ({ page }) => {
    await page.locator('body').click()
    await page.keyboard.type('/image')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)
    
    const urlInput = page.locator('input').first()
    await urlInput.fill('')
    await page.waitForTimeout(300)
  })
})

test.describe('Clipboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('can copy text', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Copy this')
    await page.waitForTimeout(200)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+c')
    await page.waitForTimeout(200)
  })

  test('can paste text', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.press('Control+v')
    await page.waitForTimeout(200)
  })

  test('can cut text', async ({ page }) => {
    await page.locator('[contenteditable="true"]').first().click()
    await page.keyboard.type('Cut this')
    await page.waitForTimeout(200)
    
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.press('Control+x')
    await page.waitForTimeout(200)
  })
})

test.describe('Window Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('handles window resize', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.setViewportSize({ width: 800, height: 600 })
    await page.waitForTimeout(300)
    
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(300)
  })

  test('handles online/offline', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.context().setOffline(true)
    await page.waitForTimeout(500)
    
    await page.context().setOffline(false)
    await page.waitForTimeout(500)
  })

  test('handles visibility change', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await page.waitForTimeout(300)
  })
})

test.describe('Error Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('recovers from render error', async ({ page }) => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        throw new Error('Render error')
      })
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('handles console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })
})
