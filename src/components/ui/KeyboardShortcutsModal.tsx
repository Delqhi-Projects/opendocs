'use client'

import { useEffect, useCallback } from 'react'
import { DEFAULT_SHORTCUTS } from './useKeyboardShortcuts'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  description: string
}

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const groupedShortcuts = DEFAULT_SHORTCUTS.reduce((acc, shortcut) => {
    const key = shortcut.key.toLowerCase()
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Tastenkürzel</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([key, shortcuts]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">{shortcuts[0].description}</span>
                <div className="flex items-center gap-1">
                  {shortcuts.map((s, i) => (
                    <span key={i}>
                      {s.ctrl && '⌘'}
                      {s.shift && '⇧'}
                      {s.alt && '⌥'}
                      {key.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">Drücken Sie Esc um zu schließen</p>
        </div>
      </div>
    </div>
  )
}
