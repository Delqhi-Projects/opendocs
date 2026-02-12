'use client'

import { useState } from 'react'
import { useBreakpoint } from '@/hooks/useResponsive'
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal'

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm'

  useKeyboardShortcuts([
    ...DEFAULT_SHORTCUTS,
    { key: 'b', ctrl: true, action: () => setSidebarOpen((o) => !o), description: 'Sidebar umschalten' },
    { key: '/', ctrl: true, action: () => setShortcutsOpen(true), description: 'Tastenkürzel' }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {shortcutsOpen && <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      <div className="flex">
        {(sidebarOpen || !isMobile) && (
          <aside
            className={`
              fixed md:relative z-20 bg-white border-r border-gray-200 transition-all duration-300
              ${isMobile ? 'w-64 h-screen' : 'w-64 min-h-screen'}
              ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
            `}
          >
            <div className="p-4 border-b border-gray-200">
              <h1 className="font-bold text-xl text-gray-900">OpenDocs</h1>
            </div>
            <nav className="p-4 space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <span>📄</span>
                <span>Dokumente</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <span>⚡</span>
                <span>Automations</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
                <span>💬</span>
                <span>Nachrichten</span>
              </a>
            </nav>
          </aside>
        )}

        <main className="flex-1 min-h-screen transition-all duration-300">
          {isMobile && (
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl">☰</span>
              </button>
              <h1 className="font-semibold">OpenDocs</h1>
              <button
                onClick={() => setShortcutsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl">⌨️</span>
              </button>
            </header>
          )}
          <div className={isMobile ? '' : 'p-8'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
