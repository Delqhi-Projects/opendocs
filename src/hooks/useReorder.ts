import { useState, useCallback, useRef } from 'react'

interface DragItem {
  id: string
  index: number
}

interface UseReorderOptions {
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function useReorder<T extends DragItem>(items: T[], options: UseReorderOptions = {}) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDragStart = useCallback((item: T) => {
    setDraggedItem(item)
  }, [])

  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
    }
    setDraggedItem(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem && dragOverIndex !== null && dragOverIndex !== index) {
      const fromIndex = items.findIndex(i => i.id === draggedItem.id)
      const toIndex = index

      if (fromIndex !== toIndex) {
        const newItems = [...items]
        const [removed] = newItems.splice(fromIndex, 1)
        newItems.splice(toIndex, 0, removed)
        options.onReorder?.(fromIndex, toIndex)
      }
    }
  }, [draggedItem, dragOverIndex, items, options])

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver
  }
}
