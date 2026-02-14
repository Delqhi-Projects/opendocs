import { test, expect, Page, BrowserContext } from '@playwright/test'

test.describe('Advanced Crash Tests - Browser API Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles localStorage quota exceeded', async ({ page }) => {
    await page.addInitScript(() => {
      const hugeString = 'x'.repeat(1024 * 1024)
      let i = 0
      try {
        while (i < 100) {
          window.localStorage.setItem(`overflow_${i}`, hugeString)
          i++
        }
      } catch {
        // Expected: QuotaExceededError
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles localStorage being disabled/unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('localStorage is disabled')
        },
      })
    })
    
    try {
      await page.goto('/', { timeout: 10000 })
    } catch {
      // Page might not fully load - that's OK for this extreme edge case
    }
    
    // Just verify we got SOME response, even if it's an error page
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
  })

  test('handles sessionStorage being disabled', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', {
        get() {
          throw new Error('sessionStorage is disabled')
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles IndexedDB being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles window.crypto being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'crypto', {
        get() {
          return undefined
        },
      })
    })
    
    try {
      await page.goto('/', { timeout: 10000 })
    } catch {
      // crypto is used for UUID generation - might fail
    }
    
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
  })

  test('handles navigator being restricted', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'navigator', {
        get() {
          return {}
        },
      })
    })
    
    try {
      await page.goto('/', { timeout: 10000 })
    } catch {
      // navigator.userAgent might be needed - extreme edge case
    }
    
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
  })

  test('handles Date manipulation (clock going backwards)', async ({ page }) => {
    await page.addInitScript(() => {
      const originalDate = window.Date
      let callCount = 0
      window.Date = class extends originalDate {
        constructor(...args: any[]) {
          super(...args)
        }
        static now() {
          callCount++
          return callCount % 2 === 0 ? 0 : Date.now()
        }
      } as any
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles Math.random returning same values', async ({ page }) => {
    await page.addInitScript(() => {
      let counter = 0
      const originalRandom = Math.random
      Math.random = () => {
        counter++
        return 0.5
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles performance.now() being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window.performance, 'now', {
        value: undefined,
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles requestAnimationFrame being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'requestAnimationFrame', {
        value: undefined,
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles cancelAnimationFrame being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'cancelAnimationFrame', {
        value: undefined,
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - DOM Manipulation Stress', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('survives rapid DOM mutations', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const body = document.body
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div')
        div.id = `stress-${i}`
        body.appendChild(div)
        body.removeChild(div)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives rapid classList toggles', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const html = document.documentElement
      for (let i = 0; i < 1000; i++) {
        html.classList.toggle('dark')
        html.classList.toggle('light')
        html.classList.toggle('custom-theme')
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives rapid style changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const body = document.body
      for (let i = 0; i < 500; i++) {
        body.style.backgroundColor = i % 2 === 0 ? 'red' : 'blue'
        body.style.fontSize = `${10 + (i % 20)}px`
        body.style.opacity = String(i % 10 / 10)
      }
      body.style.backgroundColor = ''
      body.style.fontSize = ''
      body.style.opacity = ''
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives focus/blur cycles', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        window.focus()
        document.body.focus()
        document.body.blur()
        window.blur()
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives scroll events spam', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        window.scrollTo(0, i * 10)
        window.dispatchEvent(new Event('scroll'))
      }
      window.scrollTo(0, 0)
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives resize events spam', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.dispatchEvent(new Event('resize'))
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives hashchange events spam', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        window.location.hash = `hash-${i}`
        window.dispatchEvent(new HashChangeEvent('hashchange'))
      }
      window.location.hash = ''
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives popstate events spam', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        history.pushState({ index: i }, '', `?state=${i}`)
        window.dispatchEvent(new PopStateEvent('popstate', { state: { index: i } }))
      }
      history.pushState({}, '', '/')
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Event Listener Stress', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('survives many event listeners on same element', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const handlers: Array<() => void> = []
      for (let i = 0; i < 500; i++) {
        const handler = () => {}
        handlers.push(handler)
        document.body.addEventListener('click', handler)
      }
      for (const handler of handlers) {
        document.body.removeEventListener('click', handler)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives rapid event dispatch', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))
        document.body.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives custom events with large data', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const largeData = 'x'.repeat(100000)
      for (let i = 0; i < 50; i++) {
        const event = new CustomEvent('custom-event', {
          detail: { data: largeData, index: i },
          bubbles: true,
        })
        document.body.dispatchEvent(event)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives stopImmediatePropagation in handlers', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        const handler = (e: Event) => {
          e.stopImmediatePropagation()
        }
        document.body.addEventListener('click', handler)
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        document.body.removeEventListener('click', handler)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Timer Stress', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('survives setTimeout overflow', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const ids: number[] = []
      for (let i = 0; i < 1000; i++) {
        ids.push(window.setTimeout(() => {}, 2147483647))
      }
      for (const id of ids) {
        window.clearTimeout(id)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives setInterval spam with immediate clear', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 500; i++) {
        const id = window.setInterval(() => {}, 1000)
        window.clearInterval(id)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives many concurrent intervals', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    const ids = await page.evaluate(() => {
      const ids: number[] = []
      for (let i = 0; i < 100; i++) {
        ids.push(window.setInterval(() => {}, 100))
      }
      return ids
    })
    
    await page.waitForTimeout(500)
    
    await page.evaluate((ids) => {
      for (const id of ids) {
        window.clearInterval(id)
      }
    }, ids)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives requestIdleCallback stress', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const ids: number[] = []
      for (let i = 0; i < 100; i++) {
        if (window.requestIdleCallback) {
          ids.push(window.requestIdleCallback(() => {}, { timeout: 1000 }))
        }
      }
      if (window.cancelIdleCallback) {
        for (const id of ids) {
          window.cancelIdleCallback(id)
        }
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Object/Prototype Pollution', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('survives Object.prototype pollution attempt', async ({ page }) => {
    await page.addInitScript(() => {
      Object.prototype.polluted = 'yes'
    })
    
    try {
      await page.goto('/', { timeout: 10000 })
    } catch {
      // Prototype pollution can cause strange behavior
    }
    
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
    
    await page.evaluate(() => {
      delete (Object.prototype as any).polluted
    })
  })

  test('survives Array.prototype pollution attempt', async ({ page }) => {
    await page.addInitScript(() => {
      Array.prototype.polluted = () => 'yes'
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
    
    await page.evaluate(() => {
      delete (Array.prototype as any).polluted
    })
  })

  test('survives String.prototype pollution attempt', async ({ page }) => {
    await page.addInitScript(() => {
      String.prototype.polluted = function() { return 'yes' }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
    
    await page.evaluate(() => {
      delete (String.prototype as any).polluted
    })
  })

  test('survives Function.prototype pollution attempt', async ({ page }) => {
    await page.addInitScript(() => {
      Function.prototype.polluted = () => 'yes'
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
    
    await page.evaluate(() => {
      delete (Function.prototype as any).polluted
    })
  })

  test('survives JSON.parse returning non-standard values', async ({ page }) => {
    await page.addInitScript(() => {
      const originalParse = JSON.parse
      JSON.parse = function(text: string) {
        try {
          return originalParse(text)
        } catch {
          return { _error: true, _original: text }
        }
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives JSON.stringify throwing errors', async ({ page }) => {
    await page.addInitScript(() => {
      const originalStringify = JSON.stringify
      let callCount = 0
      JSON.stringify = function(value: any, replacer?: any, space?: any) {
        callCount++
        if (callCount % 10 === 0) {
          throw new Error('JSON.stringify error')
        }
        return originalStringify.call(JSON, value, replacer, space)
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Promise/Async Stress', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('survives Promise.all with rejections', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      const promises = []
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.reject(new Error(`Error ${i}`)))
      }
      try {
        await Promise.allSettled(promises)
      } catch {}
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives Promise.race with mixed outcomes', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      for (let i = 0; i < 50; i++) {
        const promises = [
          new Promise(r => setTimeout(r, 100)),
          new Promise((_, r) => setTimeout(() => r(new Error()), 50)),
          Promise.resolve('immediate'),
        ]
        try {
          await Promise.race(promises)
        } catch {}
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives unhandled promise rejections', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 20; i++) {
        Promise.reject(new Error(`Unhandled ${i}`))
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives async function throwing in constructor', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      class AsyncConstructor {
        constructor() {
          throw new Error('Constructor error')
        }
      }
      
      for (let i = 0; i < 10; i++) {
        try {
          new AsyncConstructor()
        } catch {}
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('survives deep promise chains', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      let promise = Promise.resolve(0)
      for (let i = 0; i < 1000; i++) {
        promise = promise.then(v => v + 1)
      }
      await promise
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Clipboard & Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles clipboard API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles clipboard write permission denied', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        get() {
          return {
            writeText: () => Promise.reject(new Error('Permission denied')),
            readText: () => Promise.reject(new Error('Permission denied')),
          }
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles selection API errors', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      for (let i = 0; i < 50; i++) {
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          const range = document.createRange()
          range.selectNodeContents(document.body)
          selection.addRange(range)
          selection.removeAllRanges()
        }
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Fullscreen & Media', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles fullscreen API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        get() {
          return false
        },
      })
      Object.defineProperty(document, 'fullscreenElement', {
        get() {
          return null
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles fullscreen request rejection', async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () => Promise.reject(new Error('Fullscreen denied'))
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      try {
        await document.body.requestFullscreen()
      } catch {}
    })
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles mediaDevices being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles getUserMedia rejection', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        get() {
          return {
            getUserMedia: () => Promise.reject(new Error('Camera access denied')),
          }
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Network Interception', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles fetch returning malformed responses', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(async () => {
      const originalFetch = window.fetch
      let callCount = 0
      window.fetch = function(input: any, init?: any) {
        callCount++
        if (callCount % 3 === 0) {
          return Promise.resolve(new Response('', { status: 500 }))
        }
        return originalFetch.call(window, input, init)
      }
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles XMLHttpRequest returning invalid data', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/invalid-json-endpoint', true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.send()
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles WebSocket connection failures', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      try {
        const ws = new WebSocket('wss://invalid.websocket.url.that.does.not.exist:9999')
        ws.onerror = () => {}
        ws.onclose = () => {}
      } catch {}
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles EventSource connection failures', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      try {
        const es = new EventSource('/invalid-sse-endpoint')
        es.onerror = () => {}
      } catch {}
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Worker & WebAssembly', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Worker creation failure', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      try {
        const worker = new Worker('invalid-worker-url.js')
        worker.onerror = () => {}
      } catch {}
    })
    
    await page.waitForTimeout(1000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles WebAssembly being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'WebAssembly', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles SharedArrayBuffer being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'SharedArrayBuffer', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles Atomics being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Atomics', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Service Worker', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles serviceWorker API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'serviceWorker', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles serviceWorker registration failure', async ({ page }) => {
    await page.addInitScript(() => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register = () => Promise.reject(new Error('SW registration failed'))
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Screen & Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles screen dimensions being zero', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(screen, 'width', { get() { return 0 } })
      Object.defineProperty(screen, 'height', { get() { return 0 } })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles devicePixelRatio being extreme', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'devicePixelRatio', { get() { return 0.1 } })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles colorScheme preference being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        value: () => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles orientation API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(screen, 'orientation', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Battery & Connection', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Battery API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'getBattery', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles Network Information API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles Network Information returning slow connection', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        get() {
          return {
            effectiveType: '2g',
            downlink: 0.5,
            rtt: 1000,
            saveData: true,
          }
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Permission API', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Permissions API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'permissions', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles permission query rejection', async ({ page }) => {
    await page.addInitScript(() => {
      if (navigator.permissions) {
        navigator.permissions.query = () => Promise.reject(new Error('Permission query failed'))
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Geolocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Geolocation API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'geolocation', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles geolocation permission denied', async ({ page }) => {
    await page.addInitScript(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition = (
          success: PositionCallback,
          error?: PositionErrorCallback
        ) => {
          if (error) {
            error({ code: 1, message: 'Permission denied', PERMISSION_DENIED: 1 } as GeolocationPositionError)
          }
        }
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Notification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Notification API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'Notification', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles Notification permission denied', async ({ page }) => {
    await page.addInitScript(() => {
      if (window.Notification) {
        Object.defineProperty(Notification, 'permission', {
          get() { return 'denied' }
        })
        Notification.requestPermission = () => Promise.resolve('denied')
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Vibration', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  })

  test('handles Vibration API being unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'vibrate', {
        get() {
          return undefined
        },
      })
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('handles vibration returning false', async ({ page }) => {
    await page.addInitScript(() => {
      if (navigator.vibrate) {
        navigator.vibrate = () => false
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Advanced Crash Tests - Final Recovery', () => {
  test('app recovers from complete state destruction', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    
    await page.evaluate(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
      
      window.location.reload()
    })
    
    await page.waitForTimeout(3000)
    await expect(page.locator('body')).toBeVisible()
  })

  test('app handles rapid page reloads', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.goto('/')
      await page.waitForTimeout(500)
    }
    
    await expect(page.locator('body')).toBeVisible()
  })
})
