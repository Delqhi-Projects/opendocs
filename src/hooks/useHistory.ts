import { useState, useCallback, useRef } from 'react'

interface HistoryEntry<T> {
  state: T
  timestamp: number
}

interface UseHistoryOptions<T> {
  maxHistory?: number
  onUndo?: (state: T) => void
  onRedo?: (state: T) => void
}

export function useHistory<T>(initialState: T, options: UseHistoryOptions<T> = {}) {
  const [history, setHistory] = useState<HistoryEntry<T>[]>([{ state: initialState, timestamp: Date.now() }])
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxHistory = options.maxHistory ?? 50

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const current = prev[currentIndex]
      const computedState = typeof newState === 'function' ? (newState as (prev: T) => T)(current.state) : newState

      const newEntry: HistoryEntry<T> = { state: computedState, timestamp: Date.now() }
      const newHistory = [...prev.slice(0, currentIndex + 1), newEntry]

      if (newHistory.length > maxHistory) {
        newHistory.shift()
      }

      return newHistory
    })
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1))
  }, [currentIndex, maxHistory])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      options.onUndo?.(history[newIndex].state)
    }
  }, [currentIndex, history, options])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      options.onRedo?.(history[newIndex].state)
    }
  }, [currentIndex, history, options])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    state: history[currentIndex].state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize: history.length
  }
}
