import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns default theme as system', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('system')
  })

  it('setTheme updates localStorage and state', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorage.getItem('opendocs-theme')).toBe('dark')
  })

  it('toggleTheme switches between light and dark', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setTheme('dark')
    })

    act(() => {
      result.current.toggleTheme()
    })

    expect(result.current.resolvedTheme).toBe('light')
  })
})
