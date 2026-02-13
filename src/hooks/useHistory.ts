import { useState, useCallback } from 'react'

interface UseHistoryReturn<T> {
  state: T
  setState: (newState: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  history: T[]
  clear: () => void
}

export function useHistory<T>(initialState: T, maxHistory = 50): UseHistoryReturn<T> {
  const [history, setHistory] = useState<T[]>(() => [initialState])
  const [index, setIndex] = useState(0)

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const computed = typeof newState === 'function' ? (newState as (prev: T) => T)(prev[index]) : newState
      const newHistory = [...prev.slice(0, index + 1), computed]
      if (newHistory.length > maxHistory) {
        newHistory.shift()
      }
      return newHistory
    })
    setIndex(prev => Math.min(prev + 1, maxHistory - 1))
  }, [index, maxHistory])

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(prev => prev - 1)
    }
  }, [index])

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(prev => prev + 1)
    }
  }, [index, history.length])

  const clear = useCallback(() => {
    setHistory([initialState])
    setIndex(0)
  }, [initialState])

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
    history,
    clear
  }
}
