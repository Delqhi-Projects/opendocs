import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const createMatchMedia = (matches: boolean) => 
  vi.fn().mockReturnValue({ 
    matches, 
    addEventListener: vi.fn(), 
    removeEventListener: vi.fn() 
  })

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    Object.defineProperty(window, 'matchMedia', { writable: true, configurable: true, value: createMatchMedia(false) })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns lg for 1024px viewport', async () => {
    const { useBreakpoint } = await import('../useResponsive')
    const { result } = renderHook(() => useBreakpoint())
    expect(result.current).toBe('lg')
  })
})
