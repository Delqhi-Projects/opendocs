import { test, expect } from '@playwright/test'

const screenshotDir = 'tests/e2e/screenshots/visual-audit'

test.describe('Visual Audit - Screenshots', () => {
  test.use({
    storageState: undefined,
  })
  
  test('homepage - chromium desktop', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/01-homepage-chromium.png`,
      fullPage: true 
    })
  })

  test('homepage - firefox desktop', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/02-homepage-firefox.png`,
      fullPage: true 
    })
  })

  test('homepage - webkit desktop', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/03-homepage-webkit.png`,
      fullPage: true 
    })
  })

  test('homepage - mobile chrome', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/04-homepage-mobile-chrome.png`,
      fullPage: true 
    })
  })

  test('homepage - mobile safari', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/05-homepage-mobile-safari.png`,
      fullPage: true 
    })
  })

  test('dark mode - chromium', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.localStorage.setItem('opendocs-theme', 'dark');
    });
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/06-dark-mode-chromium.png`,
      fullPage: true 
    })
  })

  test('after creating new page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto('/')
    await page.waitForTimeout(1000)
    const newPageBtn = page.locator('button:has-text("New page")').first()
    await newPageBtn.evaluate((el) => (el as HTMLButtonElement).click())
    await page.waitForTimeout(1000)
    await page.screenshot({ 
      path: `${screenshotDir}/07-after-new-page.png`,
      fullPage: true 
    })
  })

  test('viewport - tablet landscape', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/08-viewport-tablet-landscape.png`,
      fullPage: true 
    })
  })

  test('viewport - tablet portrait', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/09-viewport-tablet-portrait.png`,
      fullPage: true 
    })
  })

  test('viewport - small mobile', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/10-viewport-small-mobile.png`,
      fullPage: true 
    })
  })

  test('viewport - large desktop', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForTimeout(2000)
    await page.screenshot({ 
      path: `${screenshotDir}/11-viewport-large-desktop.png`,
      fullPage: true 
    })
  })
})
