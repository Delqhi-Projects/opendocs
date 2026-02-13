import { test, expect } from '@playwright/test'

test.describe('Corrupted localStorage Recovery', () => {
  test.use({
    storageState: undefined,
  })

  test('handles corrupted expandedFolderIds (string) gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      const corruptedState = {
        folders: { 'root': { id: 'root', name: 'Root', children: [], folderIds: [], pageIds: [] } },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: 'corrupted-string-value',
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(corruptedState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    // App should load without crashing
    await expect(page).toHaveTitle(/OpenDocs/)
    
    // No uncaught errors related to expandedFolderIds
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('handles corrupted expandedFolderIds (number) gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      const corruptedState = {
        folders: { 'root': { id: 'root', name: 'Root', children: [], folderIds: [], pageIds: [] } },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: 12345,
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(corruptedState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveTitle(/OpenDocs/)
    
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('handles corrupted expandedFolderIds (null) gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      const corruptedState = {
        folders: { 'root': { id: 'root', name: 'Root', children: [], folderIds: [], pageIds: [] } },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: null,
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(corruptedState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveTitle(/OpenDocs/)
    
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('handles corrupted expandedFolderIds (object) gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      const corruptedState = {
        folders: { 'root': { id: 'root', name: 'Root', children: [], folderIds: [], pageIds: [] } },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: { invalid: 'object' },
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(corruptedState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveTitle(/OpenDocs/)
    
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('handles corrupted expandedFolderIds (undefined in JSON) gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      const corruptedState = {
        folders: { 'root': { id: 'root', name: 'Root', children: [], folderIds: [], pageIds: [] } },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: undefined,
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(corruptedState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveTitle(/OpenDocs/)
    
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('recovers from completely malformed JSON in localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('opendocs-state', 'not valid json {{{')
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    // App should still load with defaults
    await expect(page).toHaveTitle(/OpenDocs/)
    
    // Sidebar should be visible (default state loaded)
    const sidebar = page.locator('text=OpenDocs').first()
    await expect(sidebar).toBeVisible()
  })

  test('valid expandedFolderIds array works correctly', async ({ page }) => {
    await page.addInitScript(() => {
      const validState = {
        folders: { 
          'root': { id: 'root', name: 'Root', parentId: null, children: ['folder-1'], pageIds: [] },
          'folder-1': { id: 'folder-1', name: 'Test Folder', parentId: 'root', children: [], pageIds: [] }
        },
        pages: {},
        rootFolderId: 'root',
        selectedPageId: null,
        expandedFolderIds: ['folder-1'],
        theme: 'light'
      }
      window.localStorage.setItem('opendocs-state', JSON.stringify(validState))
    })
    
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveTitle(/OpenDocs/)
    
    const criticalErrors = errors.filter(e => 
      e.includes('expandedFolderIds') || 
      e.includes('filter is not a function') ||
      e.includes('includes is not a function')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
