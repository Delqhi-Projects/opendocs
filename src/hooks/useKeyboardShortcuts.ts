import { useEffect, useCallback } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
      const altMatch = shortcut.alt ? event.altKey : !event.altKey

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault()
        shortcut.action()
        return
      }
    }
  }, [shortcuts])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { key: 's', ctrl: true, action: () => {}, description: 'Save' },
  { key: 'z', ctrl: true, action: () => {}, description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: () => {}, description: 'Redo' },
  { key: 'c', ctrl: true, action: () => {}, description: 'Copy' },
  { key: 'v', ctrl: true, action: () => {}, description: 'Paste' },
  { key: 'a', ctrl: true, action: () => {}, description: 'Select All' },
  { key: 'f', ctrl: true, action: () => {}, description: 'Find' },
  { key: '/', ctrl: true, action: () => {}, description: 'Search' },
  { key: 'n', ctrl: true, action: () => {}, description: 'New Document' },
  { key: 'e', ctrl: true, shift: true, action: () => {}, description: 'Export' },
  { key: 'Escape', action: () => {}, description: 'Close Modal' },
  { key: 'Enter', shift: true, action: () => {}, description: 'Add Block' }
]
