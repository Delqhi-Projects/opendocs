import { useEffect, useState, useCallback, useRef } from 'react'

export function useIdle(timeout = 30000) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(false)

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => setIsIdle(true), timeout)
  }, [timeout])

  const reset = useCallback(() => {
    setIsIdle(false)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      startTimer()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    const handleEvent = () => reset()

    events.forEach(event => {
      window.addEventListener(event, handleEvent)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleEvent)
      })
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [reset, startTimer])

  return isIdle
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T extends (...args: unknown[]) => void>(callback: T, delay: number): T {
  const lastRanRef = useRef<number>(0)

  const throttled = useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRanRef.current >= delay) {
      callback(...args)
      lastRanRef.current = Date.now()
    }
  }, [callback, delay])

  return throttled as T
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])

  return ref
}
