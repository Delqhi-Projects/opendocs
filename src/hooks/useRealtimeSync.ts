import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { DocPage, DocBlock } from '@/types/docs';

export interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  position: { x: number; y: number };
  blockId?: string;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  userName: string;
  userColor: string;
  status: 'viewing' | 'editing' | 'idle';
  lastSeen: Date;
}

export interface DocumentChange {
  type: 'document' | 'page' | 'block' | 'comment';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  userId: string;
  timestamp: Date;
}

export interface RealtimeConfig {
  supabaseUrl: string;
  supabaseKey: string;
  documentId: string;
  userId: string;
  userName: string;
  userColor?: string;
}

export interface RealtimeState {
  isConnected: boolean;
  presence: UserPresence[];
  cursors: CursorPosition[];
  lastSync: Date | null;
  error: string | null;
}

function generateUserColor(userId: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

function updateCursor(cursors: CursorPosition[], newCursor: CursorPosition): CursorPosition[] {
  const filtered = cursors.filter((c) => c.userId !== newCursor.userId);
  return [...filtered, newCursor];
}

export function useRealtimeSync(config: RealtimeConfig | null) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    presence: [],
    cursors: [],
    lastSync: null,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const cursorChannelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const userColor = config?.userColor || generateUserColor(config?.userId || '');

  useEffect(() => {
    if (!config) return;

    const { supabaseUrl, supabaseKey, documentId, userId, userName } = config;
    const supabase = createClient(supabaseUrl, supabaseKey);
    supabaseRef.current = supabase;

    const channel = supabase.channel(`doc:${documentId}`, { config: { presence: { key: userId } } });
    const cursorChannel = supabase.channel(`cursors:${documentId}`);
    const presenceChannel = supabase.channel(`presence:${documentId}`, { config: { presence: { key: userId } } });

    channelRef.current = channel;
    cursorChannelRef.current = cursorChannel;
    presenceChannelRef.current = presenceChannel;

    channel
      .on('broadcast', { event: '*' }, (payload) => {
        const change = payload.payload as DocumentChange;
        setState((prev) => ({ ...prev, lastSync: new Date() }));
        window.dispatchEvent(new CustomEvent('doc:change', { detail: change }));
      })
      .subscribe((status) => {
        setState((prev) => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CHANNEL_ERROR' ? 'Connection failed' : null,
        }));
      });

    cursorChannel
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        const cursor = payload.payload as CursorPosition;
        setState((prev) => ({ ...prev, cursors: updateCursor(prev.cursors, cursor) }));
      })
      .on('broadcast', { event: 'cursor_leave' }, (payload) => {
        const { userId: leftUserId } = payload.payload as { userId: string };
        setState((prev) => ({ ...prev, cursors: prev.cursors.filter((c) => c.userId !== leftUserId) }));
      })
      .subscribe();

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const presenceList = Object.values(newState).flat().map((p) => p as unknown as UserPresence);
        setState((prev) => ({ ...prev, presence: presenceList }));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((p) => p as unknown as UserPresence);
        setState((prev) => ({ ...prev, presence: [...prev.presence, ...newUsers] }));
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p) => (p as unknown as UserPresence).userId);
        setState((prev) => ({ ...prev, presence: prev.presence.filter((p) => !leftUserIds.includes(p.userId)) }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ userId, userName, userColor, status: 'viewing', lastSeen: new Date() });
        }
      });

    return () => {
      channel.unsubscribe();
      cursorChannel.unsubscribe();
      presenceChannel.unsubscribe();
      supabase.removeChannel(channel);
      supabase.removeChannel(cursorChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [config, userColor]);

  const broadcastCursor = useCallback(
    async (position: { x: number; y: number; blockId?: string }) => {
      if (!cursorChannelRef.current || !config) return;
      await cursorChannelRef.current.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: { userId: config.userId, userName: config.userName, userColor, position, timestamp: new Date() },
      });
    },
    [config, userColor]
  );

  const broadcastBlockChange = useCallback(
    async (operation: 'INSERT' | 'UPDATE' | 'DELETE', block: DocBlock, oldData?: DocBlock) => {
      if (!channelRef.current || !config) return;
      await channelRef.current.send({
        type: 'broadcast',
        event: operation.toLowerCase(),
        payload: { type: 'block', operation, data: block, oldData, userId: config.userId, timestamp: new Date() },
      });
    },
    [config]
  );

  const broadcastPageChange = useCallback(
    async (operation: 'INSERT' | 'UPDATE' | 'DELETE', page: DocPage, oldData?: DocPage) => {
      if (!channelRef.current || !config) return;
      await channelRef.current.send({
        type: 'broadcast',
        event: operation.toLowerCase(),
        payload: { type: 'page', operation, data: page, oldData, userId: config.userId, timestamp: new Date() },
      });
    },
    [config]
  );

  const updatePresence = useCallback(
    async (status: 'viewing' | 'editing' | 'idle') => {
      if (!presenceChannelRef.current || !config) return;
      await presenceChannelRef.current.track({ userId: config.userId, userName: config.userName, userColor, status, lastSeen: new Date() });
    },
    [config, userColor]
  );

  const leaveDocument = useCallback(async () => {
    if (!cursorChannelRef.current || !presenceChannelRef.current || !config) return;
    await cursorChannelRef.current.send({ type: 'broadcast', event: 'cursor_leave', payload: { userId: config.userId } });
    await presenceChannelRef.current.untrack();
  }, [config]);

  return { ...state, userColor, broadcastCursor, broadcastBlockChange, broadcastPageChange, updatePresence, leaveDocument };
}

export default useRealtimeSync;
