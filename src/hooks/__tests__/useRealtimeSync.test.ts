import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSync } from '../useRealtimeSync';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockImplementation(function(this: unknown, callback?: (status: string) => void) {
        if (callback) callback('SUBSCRIBED');
        return Promise.resolve();
      }),
      send: vi.fn().mockResolvedValue({}),
      track: vi.fn().mockResolvedValue({}),
      untrack: vi.fn().mockResolvedValue({}),
      unsubscribe: vi.fn(),
      presenceState: vi.fn(() => ({})),
    })),
    removeChannel: vi.fn(),
  })),
}));

describe('useRealtimeSync', () => {
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    documentId: 'doc-123',
    userId: 'user-1',
    userName: 'Test User',
    userColor: '#FF6B6B',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state when config is null', () => {
    const { result } = renderHook(() => useRealtimeSync(null));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.presence).toEqual([]);
    expect(result.current.cursors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should generate user color from userId if not provided', () => {
    const configWithoutColor = { ...mockConfig, userColor: undefined };
    const { result } = renderHook(() => useRealtimeSync(configWithoutColor));

    // Color should be generated deterministically from userId
    expect(result.current.userColor).toBeTruthy();
    expect(typeof result.current.userColor).toBe('string');
    expect(result.current.userColor.startsWith('#')).toBe(true);
  });

  it('should use provided user color', () => {
    const { result } = renderHook(() => useRealtimeSync(mockConfig));

    expect(result.current.userColor).toBe('#FF6B6B');
  });

  it('should have broadcast functions defined', () => {
    const { result } = renderHook(() => useRealtimeSync(mockConfig));

    expect(typeof result.current.broadcastCursor).toBe('function');
    expect(typeof result.current.broadcastBlockChange).toBe('function');
    expect(typeof result.current.broadcastPageChange).toBe('function');
    expect(typeof result.current.updatePresence).toBe('function');
    expect(typeof result.current.leaveDocument).toBe('function');
  });

  it('should set isConnected to true after successful subscription', async () => {
    const { result } = renderHook(() => useRealtimeSync(mockConfig));

    // Wait for effect to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isConnected).toBe(true);
  });
});

describe('generateUserColor (via hook)', () => {
  it('should generate consistent colors for same userId', () => {
    const config = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      documentId: 'doc-123',
      userId: 'user-abc',
      userName: 'Test User',
    };

    const { result, rerender } = renderHook(() => useRealtimeSync(config));
    const color1 = result.current.userColor;

    rerender();
    const color2 = result.current.userColor;

    expect(color1).toBe(color2);
  });

  it('should generate different colors for different userIds', () => {
    const config1 = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      documentId: 'doc-123',
      userId: 'user-aaa',
      userName: 'User A',
    };

    const config2 = {
      supabaseUrl: 'https://test.supabase.co',
      supabaseKey: 'test-key',
      documentId: 'doc-123',
      userId: 'user-bbb',
      userName: 'User B',
    };

    const { result: result1 } = renderHook(() => useRealtimeSync(config1));
    const { result: result2 } = renderHook(() => useRealtimeSync(config2));

    // Different users should get different colors (statistically)
    // Note: This could theoretically fail if hash collision, but unlikely
    expect(result1.current.userColor).not.toBe(result2.current.userColor);
  });
});
