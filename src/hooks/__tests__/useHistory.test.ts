import { renderHook, act } from '@testing-library/react'
import { useHistory } from '../useHistory'
import { describe, it, expect } from 'vitest'

describe('useHistory', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useHistory('initial'))
    expect(result.current.state).toBe('initial')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('tracks history with setState', () => {
    const { result } = renderHook(() => useHistory(''))

    act(() => {
      result.current.setState('first')
    })
    act(() => {
      result.current.setState('second')
    })

    expect(result.current.state).toBe('second')
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('undo reverts to previous state', () => {
    const { result } = renderHook(() => useHistory(''))

    act(() => {
      result.current.setState('new state')
    })
    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toBe('')
  })

  it('redo advances to next state', () => {
    const { result } = renderHook(() => useHistory(''))

    act(() => {
      result.current.setState('state1')
    })
    act(() => {
      result.current.setState('state2')
    })
    act(() => {
      result.current.undo()
    })
    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toBe('state2')
  })
})
