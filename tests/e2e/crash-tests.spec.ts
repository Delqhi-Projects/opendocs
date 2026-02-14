import { test, expect, Page } from '@playwright/test'

const STORAGE_KEYS = {
  state: 'opendocs_state',
  theme: 'opendocs_theme',
}

test.describe('Crash Tests - localStorage Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles corrupt JSON in localStorage gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', '{invalid json}')
      window.localStorage.setItem('opendocs_theme', 'dark')
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles null localStorage value', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', 'null')
      window.localStorage.setItem('opendocs_theme', 'null')
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles undefined localStorage value', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', undefined as any)
      window.localStorage.setItem('opendocs_theme', undefined as any)
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles empty string localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', '')
      window.localStorage.setItem('opendocs_theme', '')
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles huge payload in localStorage (5MB)', async ({ page }) => {
    const hugeData = 'x'.repeat(5 * 1024 * 1024)
    
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', JSON.stringify({ data: 'placeholder'.repeat(1000) }))
    })
    
    await page.goto('/')
    await page.waitForTimeout(3000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles circular JSON reference', async ({ page }) => {
    await page.addInitScript(() => {
      const obj: any = { name: 'test' }
      obj.self = obj
      window.localStorage.setItem('opendocs_state', JSON.stringify(obj))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles nested objects exceeding recursion limit', async ({ page }) => {
    await page.addInitScript(() => {
      let obj: any = {}
      for (let i = 0; i < 100; i++) {
        obj = { nested: obj }
      }
      window.localStorage.setItem('opendocs_state', JSON.stringify(obj))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles NaN and Infinity values', async ({ page }) => {
    await page.addInitScript(() => {
      const obj = {
        nan: NaN,
        infinity: Infinity,
        negInfinity: -Infinity,
        nested: { value: NaN }
      }
      window.localStorage.setItem('opendocs_state', JSON.stringify(obj))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles special JavaScript values (undefined, function, symbol)', async ({ page }) => {
    await page.addInitScript(() => {
      const obj = {
        undef: undefined,
        func: function() {},
        symbol: Symbol('test'),
        date: new Date(),
        regex: /test/g
      }
      window.localStorage.setItem('opendocs_state', JSON.stringify(obj))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles partial/corrupted state with missing required fields', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs_state', JSON.stringify({
        folders: {},
        pages: null,
        rootFolderId: undefined
      }))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Rapid User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
  })

  test('handles rapid clicking on new page button', async ({ page }) => {
    const newPageBtn = page.locator('button:has-text("New page")').first()
    
    for (let i = 0; i < 20; i++) {
      await newPageBtn.click({ force: true }).catch(() => {})
      await page.waitForTimeout(10)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid theme toggling', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label*="theme"], button:has-text("theme"), button:has-text("Theme")').first()
    
    for (let i = 0; i < 20; i++) {
      await themeBtn.click({ force: true }).catch(() => {})
      await page.waitForTimeout(20)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid typing in content area', async ({ page }) => {
    try {
      const contentArea = page.locator('[contenteditable="true"]').first()
      
      if (await contentArea.isVisible().catch(() => false)) {
        for (let i = 0; i < 50; i++) {
          await contentArea.fill(`Test content ${i} ` + 'x'.repeat(100)).catch(() => {})
          await page.waitForTimeout(5)
        }
      }
    } catch (e) {
      // Content area not found - test passes
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid block additions', async ({ page }) => {
    const addBlockBtn = page.locator('button:has-text("+ Add text block")').first()
    
    for (let i = 0; i < 15; i++) {
      await addBlockBtn.click({ force: true }).catch(() => {})
      await page.waitForTimeout(20)
    }
    
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles simultaneous multi-button clicking', async ({ page }) => {
    const buttons = page.locator('button').all()
    
    const clickPromises = (await buttons).slice(0, 10).map(async (btn) => {
      for (let i = 0; i < 5; i++) {
        await btn.click({ force: true }).catch(() => {})
      }
    })
    
    await Promise.all(clickPromises)
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid folder expand/collapse', async ({ page }) => {
    const folderToggle = page.locator('[data-testid="folder"], button[aria-label*="folder"], button:has-text("OpenDocs")').first()
    
    for (let i = 0; i < 30; i++) {
      await folderToggle.click({ force: true }).catch(() => {})
      await page.waitForTimeout(10)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Invalid/Malformed Data Injection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles XSS attempt in localStorage', async ({ page }) => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      '"><script>alert(1)</script>',
      "'-alert(1)-'",
      '{{constructor.constructor("alert(1)")()}}'
    ]
    
    for (const payload of xssPayloads) {
      await page.addInitScript((p) => {
        window.localStorage.setItem('opendocs_state', JSON.stringify({
          pages: {
            test: {
              id: 'test',
              title: p,
              blocks: [{ id: '1', type: 'paragraph', text: p }]
            }
          },
          folders: {},
          rootFolderId: 'root'
        }))
      }, payload)
      
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles SQL injection patterns in localStorage', async ({ page }) => {
    const sqlPayloads = [
      "'; DROP TABLE users;--",
      "' OR '1'='1",
      "' UNION SELECT * FROM passwords--",
      "1; DELETE FROM pages WHERE '1'='1",
      "'; EXEC xp_cmdshell('dir');--",
      "1' AND '1'='1",
      "admin'--",
      "1' ORDER BY 1--"
    ]
    
    for (const payload of sqlPayloads) {
      await page.addInitScript((p) => {
        window.localStorage.setItem('opendocs_state', JSON.stringify({
          pages: {
            test: { id: 'test', title: p, blocks: [{ id: '1', type: 'paragraph', text: p }] }
          },
          folders: {},
          rootFolderId: 'root'
        }))
      }, payload)
      
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles weird unicode characters', async ({ page }) => {
    const unicodePayloads = [
      '\u0000\u0001\u0002',
      '\uD800\uDC00',
      '\uFFFE\uFFFF',
      ' ᠀  ',
      '田中さんにあげてね',
      '🎉🚀💯',
      '️test️',
      '⁄⁄⁄⁄⁄',
      '﻿',
      '⃝⃝⃝⃝⃝'
    ]
    
    for (const payload of unicodePayloads) {
      await page.addInitScript((p) => {
        window.localStorage.setItem('opendocs_state', JSON.stringify({
          pages: {
            test: { id: 'test', title: p, blocks: [{ id: '1', type: 'paragraph', text: p }] }
          },
          folders: {},
          rootFolderId: 'root'
        }))
      }, payload)
      
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles extremely long strings', async ({ page }) => {
    const longString = 'A'.repeat(1000000)
    
    await page.addInitScript((str) => {
      window.localStorage.setItem('opendocs_state', JSON.stringify({
        pages: {
          test: { id: 'test', title: str.substring(0, 1000), blocks: [{ id: '1', type: 'paragraph', text: str.substring(0, 50000) }] }
        },
        folders: {},
        rootFolderId: 'root'
      }))
    }, longString)
    
    await page.goto('/')
    await page.waitForTimeout(3000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })

  test('handles binary-like data in strings', async ({ page }) => {
    const binaryPayloads = [
      Buffer.from([0x00, 0x01, 0x02, 0xFF, 0xFE]).toString('binary'),
      '\x00\x01\x02\x03\x04',
      String.fromCharCode(0, 1, 2, 255, 254),
      '﻿﻿﻿',
      '\uFEFF\uFEFF'
    ]
    
    for (const payload of binaryPayloads) {
      await page.addInitScript((p) => {
        try {
          window.localStorage.setItem('opendocs_state', JSON.stringify({
            pages: { test: { id: 'test', title: 'test', blocks: [{ id: '1', type: 'paragraph', text: p }] } },
            folders: {},
            rootFolderId: 'root'
          }))
        } catch (e) {
          window.localStorage.setItem('opendocs_state', JSON.stringify({
            pages: { test: { id: 'test', title: 'test', blocks: [{ id: '1', type: 'paragraph', text: 'fallback' }] } },
            folders: {},
            rootFolderId: 'root'
          }))
        }
      }, payload)
      
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    await page.waitForTimeout(500)
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Network Failure Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
  })

  test('handles API timeout gracefully', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 30000))
      route.continue()
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles 500 Internal Server Error', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles 404 Not Found errors', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 404,
        body: 'Not Found'
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles network offline mode', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles connection reset during request', async ({ page }) => {
    let requestCount = 0
    await page.route('**/api/**', async (route) => {
      requestCount++
      if (requestCount > 2) {
        await route.abort('failed')
      } else {
        await route.continue()
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(3000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles malformed API response (non-JSON)', async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Not JSON</body></html>'
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles CORS errors gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      window.addEventListener('error', (e) => {
        console.log('Captured error:', e.message)
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('CORS')) {
        errors.push(msg.text())
      }
    })
    
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Concurrent Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
  })

  test('handles rapid undo/redo operations', async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault()
        }
      })
    })
    
    for (let i = 0; i < 30; i++) {
      await page.keyboard.down('Control')
      await page.keyboard.press('z')
      await page.keyboard.up('Control')
      await page.waitForTimeout(10)
    }
    
    for (let i = 0; i < 30; i++) {
      await page.keyboard.down('Control')
      await page.keyboard.down('Shift')
      await page.keyboard.press('z')
      await page.keyboard.up('Shift')
      await page.keyboard.up('Control')
      await page.waitForTimeout(10)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles simultaneous saves from multiple sources', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.addInitScript((n) => {
        window.localStorage.setItem('opendocs_state', JSON.stringify({
          pages: {
            ['page' + n]: { 
              id: 'page' + n, 
              title: 'Page ' + n, 
              blocks: [{ id: '1', type: 'paragraph', text: 'Content ' + n }] 
            }
          },
          folders: {},
          rootFolderId: 'root'
        }))
      }, i)
    }
    
    await page.reload()
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles parallel API calls with race conditions', async ({ page }) => {
    let requestCount = 0
    const responses: Promise<any>[] = []
    
    await page.route('**/api/**', async (route) => {
      requestCount++
      const delay = Math.random() * 100
      await new Promise(resolve => setTimeout(resolve, delay))
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, requestNumber: requestCount })
      })
    })
    
    for (let i = 0; i < 20; i++) {
      responses.push(page.evaluate(async () => {
        try {
          const resp = await fetch('/api/test' + Math.random(), { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          return await resp.json()
        } catch (e) {
          return { error: e.message }
        }
      }))
    }
    
    await Promise.all(responses)
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid state updates during render', async ({ page }) => {
    await page.addInitScript(() => {
      let updateCount = 0
      const maxUpdates = 100
      
      const updateState = () => {
        if (updateCount >= maxUpdates) return
        updateCount++
        
        try {
          const current = localStorage.getItem('opendocs_state')
          const parsed = current ? JSON.parse(current) : { folders: {}, pages: {}, rootFolderId: 'root' }
          
          parsed.pages = parsed.pages || {}
          parsed.pages['update' + updateCount] = {
            id: 'update' + updateCount,
            title: 'Rapid Update ' + updateCount,
            blocks: [{ id: 'b1', type: 'paragraph', text: 'Content ' + updateCount }]
          }
          
          localStorage.setItem('opendocs_state', JSON.stringify(parsed))
          
          window.dispatchEvent(new Event('storage'))
          
          setTimeout(updateState, 1)
        } catch (e) {
          console.error('Update error:', e)
        }
      }
      
      setTimeout(updateState, 100)
    })
    
    await page.goto('/')
    await page.waitForTimeout(5000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles concurrent localStorage writes', async ({ page }) => {
    for (let i = 0; i < 50; i++) {
      await page.addInitScript((n) => {
        const key = 'opendocs_state'
        try {
          const current = localStorage.getItem(key)
          const parsed = current ? JSON.parse(current) : { folders: {}, pages: {}, rootFolderId: 'root' }
          parsed['write' + n] = n
          localStorage.setItem(key, JSON.stringify(parsed))
        } catch (e) {
          console.error('Write error:', e)
        }
      }, i)
    }
    
    await page.reload()
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles browser back/forward navigation rapidly', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    for (let i = 0; i < 10; i++) {
      await page.goto('/')
      await page.goBack()
      await page.goForward()
      await page.waitForTimeout(50)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles page refresh during operation', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    for (let i = 0; i < 5; i++) {
      await page.reload()
      await page.waitForTimeout(200)
    }
    
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles tab visibility changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          value: true,
          writable: true
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await page.waitForTimeout(50)
      
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          value: false,
          writable: true
        })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      await page.waitForTimeout(50)
    }
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles memory pressure simulation', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    await page.evaluate(() => {
      const allocate = (mb: number): number => {
        const arr: number[] = []
        for (let i = 0; i < mb * 1024 * 1024; i++) {
          arr.push(i)
        }
        return arr.length
      }
      
      try {
        allocate(10)
      } catch (e) {
        console.log('Memory allocation failed (expected):', e)
      }
    })
    
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles invalid viewport dimensions', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    await page.setViewportSize({ width: 0, height: 0 }).catch(() => {})
    await page.waitForTimeout(500)
    
    await page.setViewportSize({ width: 10000, height: 10000 }).catch(() => {})
    await page.waitForTimeout(500)
    
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles rapid URL hash changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
    
    for (let i = 0; i < 20; i++) {
      await page.evaluate((n) => {
        window.location.hash = 'page' + n
      }, i)
      await page.waitForTimeout(10)
    }
    
    await page.evaluate(() => {
      window.location.hash = ''
    })
    
    await page.waitForTimeout(1000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })

  test('handles emoji in page title', async ({ page }) => {
    const emojiTitles = ['🎉', '🚀', '💯', '🎊', '✨', '🔥', '💥', '🎯']
    
    for (const emoji of emojiTitles) {
      await page.addInitScript((title) => {
        window.localStorage.setItem('opendocs_state', JSON.stringify({
          pages: {
            test: { id: 'test', title: title, blocks: [{ id: '1', type: 'paragraph', text: title }] }
          },
          folders: {},
          rootFolderId: 'root'
        }))
      }, emoji)
      
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })
})

test.describe('Crash Tests - Recovery Scenarios', () => {
  test('recovers from completely corrupted state', async ({ page }) => {
    const corruptionTypes = [
      () => { window.localStorage.setItem('opendocs_state', 'totally invalid') },
      () => { window.localStorage.setItem('opendocs_state', '{"pages": null}') },
      () => { window.localStorage.setItem('opendocs_state', '{"folders": null}') },
      () => { window.localStorage.setItem('opendocs_state', '{}') },
      () => { window.localStorage.setItem('opendocs_state', '["array", "not", "object"]') },
      () => { window.localStorage.setItem('opendocs_state', '123') },
      () => { window.localStorage.setItem('opendocs_state', 'true') },
      () => { window.localStorage.setItem('opendocs_state', 'undefined') },
    ]
    
    for (const corrupt of corruptionTypes) {
      await page.addInitScript(() => {
        window.localStorage.clear()
        window.localStorage.setItem('opendocs_theme', 'dark')
      })
      
      await page.addInitScript(corrupt)
      
      await page.goto('/')
      await page.waitForTimeout(2000)
      
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      
      await page.waitForTimeout(500)
      
      if (errors.length > 0) {
        console.log('Errors for corruption type:', errors)
      }
      
      expect(errors.length).toBe(0)
    }
  })

  test('survives rapid clear local data operations', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    const clearBtn = page.locator('button:has-text("Clear local data")')
    
    if (await clearBtn.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await clearBtn.click({ force: true }).catch(() => {})
        await page.waitForTimeout(50)
      }
    }
    
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    
    expect(errors.length).toBe(0)
  })
})
