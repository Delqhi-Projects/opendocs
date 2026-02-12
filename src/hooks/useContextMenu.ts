import { useState, useCallback, useRef, useEffect } from 'react'

interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  divider?: boolean
  submenu?: ContextMenuItem[]
}

interface ContextMenuPosition {
  x: number
  y: number
}

export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<ContextMenuPosition>({ x: 0, y: 0 })
  const [items, setItems] = useState<ContextMenuItem[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  const open = useCallback((x: number, y: number, menuItems: ContextMenuItem[]) => {
    setPosition({ x, y })
    setItems(menuItems)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback((x: number, y: number, menuItems: ContextMenuItem[]) => {
    if (isOpen) {
      close()
    } else {
      open(x, y, menuItems)
    }
  }, [isOpen, open, close])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, close])

  return {
    isOpen,
    position,
    items,
    menuRef,
    open,
    close,
    toggle
  }
}
