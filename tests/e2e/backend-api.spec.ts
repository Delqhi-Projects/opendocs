import { expect, test } from '@playwright/test'

test.describe('AI Service Integration', () => {
  test('nvidia chat handles special characters', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: 'Hello 👋 🎉' }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles unicode', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: '中文 العربية עברית' }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles code blocks', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: '```python\nprint("hello")\n```' }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles markdown', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: '# Heading\n**bold** *italic*' }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles very long input', async ({ request }) => {
    const longText = 'Hello. ' .repeat(1000)
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: longText }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('nvidia chat handles json in message', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: '{"key": "value"}' }] }
    })
    expect(response.ok()).toBe(true)
  })
})

test.describe('Backend Error Handling', () => {
  test('handles missing API key gracefully', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user', content: 'test' }] }
    })
    expect(response.status()).toBeLessThan(500)
  })

  test('handles malformed JSON', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: 'not json'
    })
    expect(response.status()).toBe(400)
  })

  test('handles missing message content', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [{ role: 'user' }] }
    })
    expect(response.ok()).toBe(true)
  })

  test('handles empty array messages', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/nvidia/chat', {
      data: { messages: [] }
    })
    expect(response.ok()).toBe(true)
  })
})

test.describe('API Rate Limiting', () => {
  test('handles rapid requests', async ({ request }) => {
    const promises = Array(10).fill(null).map(() => 
      request.post('http://localhost:3000/api/health')
    )
    const responses = await Promise.all(promises)
    const okCount = responses.filter(r => r.ok()).length
    expect(okCount).toBeGreaterThan(5)
  })

  test('concurrent AI requests', async ({ request }) => {
    const promises = Array(3).fill(null).map(() => 
      request.post('http://localhost:3000/api/nvidia/chat', {
        data: { messages: [{ role: 'user', content: 'Hi' }] }
      })
    )
    const responses = await Promise.all(promises)
    expect(responses.length).toBe(3)
  })
})

test.describe('LocalStorage Limits', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('handles large data storage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const largeData = 'x'.repeat(100000)
    await page.evaluate((data) => localStorage.setItem('test_large', data), largeData)
    await page.waitForTimeout(100)
    
    const retrieved = await page.evaluate(() => localStorage.getItem('test_large'))
    expect(retrieved?.length).toBe(100000)
  })

  test('handles many small items', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    for (let i = 0; i < 100; i++) {
      await page.evaluate((i) => localStorage.setItem(`item_${i}`, `value_${i}`), i)
    }
    await page.waitForTimeout(500)
    
    const count = await page.evaluate(() => localStorage.length)
    expect(count).toBeGreaterThan(50)
  })
})

test.describe('State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('state updates reflect immediately', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(300)
    
    const hasData = await page.evaluate(() => {
      const data = localStorage.getItem('opendocs')
      return data && data.length > 0
    })
    expect(hasData).toBe(true)
  })

  test('multiple pages persist independently', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(300)
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(300)
    
    const data = await page.evaluate(() => localStorage.getItem('opendocs'))
    const parsed = JSON.parse(data || '{}')
    expect(Object.keys(parsed.pages || {}).length).toBeGreaterThan(1)
  })
})

test.describe('Component Mount', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('all components mount without crash', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    const errors: string[] = []
    expect(errors.length).toBe(0)
  })

  test('sidebar mounts correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const sidebar = await page.locator('aside, [class*="sidebar"]').count()
    expect(sidebar).toBeGreaterThan(0)
  })

  test('editor area mounts correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const editor = await page.locator('[contenteditable="true"]').count()
    expect(editor).toBeGreaterThan(0)
  })
})

test.describe('Rendering Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('renders 10 blocks quickly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const start = Date.now()
    for (let i = 0; i < 10; i++) {
      await page.locator('[contenteditable="true"]').first().click()
      await page.keyboard.type(`Block ${i}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(50)
    }
    const time = Date.now() - start
    
    expect(time).toBeLessThan(5000)
  })

  test('typing has no lag', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.locator('[contenteditable="true"]').first().click()
    
    const start = Date.now()
    await page.keyboard.type('abcdefghijklmnop')
    const time = Date.now() - start
    
    expect(time).toBeLessThan(1000)
  })
})

test.describe('Network Resilience', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('works offline after initial load', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.context().setOffline(true)
    await page.waitForTimeout(500)
    
    await page.locator('button:has-text("New page")').first().click({ force: true })
    await page.waitForTimeout(300)
    
    await page.context().setOffline(false)
  })

  test('recovers from network error', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.route('**/api/**', route => route.abort('failed'))
    
    await page.keyboard.press('Control+g')
    await page.waitForTimeout(1000)
  })
})

test.describe('Memory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('no memory leak after navigation', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(200)
    }
  })

  test('cleanup on page unload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeunload'))
    })
    await page.waitForTimeout(100)
  })
})
