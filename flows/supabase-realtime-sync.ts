/**
 * Supabase Real-time Sync for OpenDocs (Notion Clone)
 * Syncs: Documents, Pages, Blocks, Collaboration
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

interface SyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  postgresUrl: string;
}

interface SyncEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  operation: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  user_id: string;
  created_at: Date;
}

interface DocumentChange {
  id: string;
  type: 'document' | 'page' | 'block' | 'comment';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  userId: string;
  timestamp: Date;
}

export class SupabaseRealtimeSync {
  private supabase: ReturnType<typeof createClient>;
  private pool: Pool;
  private channels: Map<string, ReturnType<typeof this.supabase.channel>> = new Map();

  constructor(config: SyncConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.pool = new Pool({ connectionString: config.postgresUrl });
  }

  async initialize(): Promise<void> {
    await this.createSyncTables();
    await this.createTriggers();
    this.startEventPolling();
  }

  private async createSyncTables(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS sync_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        operation VARCHAR(10) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        user_id UUID,
        created_at TIMESTAMP DEFAULT NOW(),
        processed BOOLEAN DEFAULT FALSE
      );
      
      CREATE INDEX IF NOT EXISTS idx_sync_events_processed ON sync_events(processed) WHERE processed = FALSE;
    `);
  }

  private async createTriggers(): Promise<void> {
    const tables = ['documents', 'pages', 'blocks', 'comments'];
    
    for (const table of tables) {
      await this.pool.query(`
        CREATE OR REPLACE FUNCTION sync_${table}_trigger()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO sync_events (entity_type, entity_id, operation, old_data, new_data, user_id)
          VALUES (
            '${table}',
            COALESCE(NEW.id, OLD.id),
            TG_OP,
            CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
            COALESCE(NEW.user_id, OLD.user_id)
          );
          RETURN COALESCE(NEW, OLD);
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS ${table}_sync ON ${table};
        CREATE TRIGGER ${table}_sync
        AFTER INSERT OR UPDATE OR DELETE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION sync_${table}_trigger();
      `);
    }
  }

  private startEventPolling(): void {
    setInterval(async () => {
      try {
        const result = await this.pool.query(
          `SELECT * FROM sync_events WHERE processed = FALSE ORDER BY created_at ASC LIMIT 100`
        );
        
        for (const event of result.rows) {
          await this.broadcastChange(event);
          await this.pool.query('UPDATE sync_events SET processed = TRUE WHERE id = $1', [event.id]);
        }
      } catch (error) {
        console.error('[Sync] Event polling error:', error);
      }
    }, 500);
  }

  private async broadcastChange(event: SyncEvent): Promise<void> {
    const channel = this.supabase.channel(`docs:${event.entity_type}`);
    
    await channel.send({
      type: 'broadcast',
      event: event.operation.toLowerCase(),
      payload: {
        type: event.entity_type,
        id: event.entity_id,
        operation: event.operation,
        data: event.new_data || event.old_data,
        userId: event.user_id,
        timestamp: event.created_at || new Date()
      }
    });
  }

  subscribeToDocuments(documentId: string, callback: (change: DocumentChange) => void): () => void {
    const channel = this.supabase.channel(`doc:${documentId}`);
    
    channel.on('broadcast', { event: '*' }, (payload) => {
      callback(payload.payload as DocumentChange);
    });
    
    channel.subscribe();

    this.channels.set(documentId, channel);
    
    return () => {
      this.supabase.removeChannel(channel);
      this.channels.delete(documentId);
    };
  }

  subscribeToPage(pageId: string, callback: (change: DocumentChange) => void): () => void {
    const channel = this.supabase.channel(`page:${pageId}`);
    
    channel.on('broadcast', { event: '*' }, (payload) => {
      callback(payload.payload as DocumentChange);
    });
    
    channel.subscribe();

    return () => this.supabase.removeChannel(channel);
  }

  async broadcastCursor(documentId: string, userId: string, position: { x: number; y: number; blockId?: string }): Promise<void> {
    const channel = this.supabase.channel(`cursors:${documentId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: { userId, position, timestamp: new Date() }
    });
  }

  async broadcastSelection(documentId: string, userId: string, selection: { startBlock: string; endBlock: string }): Promise<void> {
    const channel = this.supabase.channel(`selections:${documentId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'selection_change',
      payload: { userId, selection, timestamp: new Date() }
    });
  }

  async close(): Promise<void> {
    const channelArray = Array.from(this.channels.values());
    for (const channel of channelArray) {
      await this.supabase.removeChannel(channel);
    }
    await this.pool.end();
  }
}

export default SupabaseRealtimeSync;
