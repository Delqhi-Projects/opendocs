import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../hooks/useTheme'
import { useDebounce, useLocalStorage } from '../hooks/usePerformance'

describe('useTheme', () => {
  beforeEach(() => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => null)
    vi.spyOn(window, 'matchMedia', 'query').mockImplementation(() => ({ matches: false }) as MediaQueryList)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns default theme as system', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })
})

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 100))
    expect(result.current).toBe('test')
  })
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('updates stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(localStorage.getItem('test-key')).toBe('"new-value"')
  })
})
