/**
 * Supabase Real-time Sync
 * Table changes → Edge Functions → Client subscriptions
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

interface SyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  postgresUrl: string;
  tables: string[];
}

export class SupabaseRealtimeSync {
  private supabase: ReturnType<typeof createClient>;
  private pool: Pool;
  private config: SyncConfig;
  private syncFunctions: Map<string, Function> = new Map();

  constructor(config: SyncConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.pool = new Pool({ connectionString: config.postgresUrl });
  }

  /**
   * Initialize sync triggers for all configured tables
   */
  async initialize(): Promise<void> {
    for (const table of this.config.tables) {
      await this.createSyncTrigger(table);
    }
    
    // Start listening for sync events
    await this.startEventListener();
  }

  /**
   * Create PostgreSQL trigger for table sync
   */
  private async createSyncTrigger(tableName: string): Promise<void> {
    // Create sync_events table if not exists
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS sync_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(100) NOT NULL,
        record_id UUID NOT NULL,
        operation VARCHAR(10) NOT NULL,
        old_data JSONB,
        new_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        processed BOOLEAN DEFAULT FALSE
      )
    `);

    // Create trigger function
    await this.pool.query(`
      CREATE OR REPLACE FUNCTION sync_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO sync_events (table_name, record_id, operation, old_data, new_data)
        VALUES (
          TG_TABLE_NAME,
          COALESCE(NEW.id, OLD.id),
          TG_OP,
          CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
          CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
        );
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);

    // Create trigger for this table
    const triggerName = `${tableName}_sync_trigger`;
    await this.pool.query(`
      DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};
      CREATE TRIGGER ${triggerName}
      AFTER INSERT OR UPDATE OR DELETE ON ${tableName}
      FOR EACH ROW EXECUTE FUNCTION sync_trigger()
    `);

    console.log(`Sync trigger created for table: ${tableName}`);
  }

  /**
   * Start listening for sync events
   */
  private async startEventListener(): Promise<void> {
    // Poll for unprocessed events every second
    setInterval(async () => {
      try {
        const events = await this.pool.query(
          `SELECT * FROM sync_events 
           WHERE processed = FALSE 
           ORDER BY created_at ASC 
           LIMIT 100`
        );

        for (const event of events.rows) {
          await this.processEvent(event);
        }
      } catch (error) {
        console.error('Error processing sync events:', error);
      }
    }, 1000);
  }

  /**
   * Process a single sync event
   */
  private async processEvent(event: any): Promise<void> {
    try {
      // Broadcast to Supabase realtime
      const channel = this.supabase.channel(`sync:${event.table_name}`);
      
      await channel.send({
        type: 'postgres_changes',
        event: event.operation,
        schema: 'public',
        table: event.table_name,
        record: event.new_data || event.old_data,
        old_record: event.old_data
      });

      // Call any registered sync functions
      const syncFn = this.syncFunctions.get(event.table_name);
      if (syncFn) {
        await syncFn(event);
      }

      // Mark as processed
      await this.pool.query(
        'UPDATE sync_events SET processed = TRUE WHERE id = $1',
        [event.id]
      );
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
    }
  }

  /**
   * Register a custom sync function for a table
   */
  onSync(tableName: string, fn: Function): void {
    this.syncFunctions.set(tableName, fn);
  }

  /**
   * Subscribe client to table changes
   */
  subscribe(tableName: string, callback: (payload: any) => void): () => void {
    const channel = this.supabase
      .channel(`sync:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        callback
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * Edge Function for earnings updates (deploy to Supabase)
 */
export const earningsEdgeFunction = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_KEY')!)

serve(async (req) => {
  const { p_user_id, p_amount, p_new_balance, p_source } = await req.json()
  
  // Broadcast to all clients subscribed to this user's earnings
  await supabase.channel(\`earnings:\${p_user_id}\`).send({
    type: 'postgres_changes',
    event: 'INSERT',
    schema: 'public',
    table: 'earnings',
    record: {
      user_id: p_user_id,
      amount: p_amount,
      new_balance: p_new_balance,
      source: p_source,
      created_at: new Date().toISOString()
    }
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
`;

/**
 * SQL to create RPC function in Supabase
 */
export const createRpcFunction = `
CREATE OR REPLACE FUNCTION notify_earnings_update(
  p_user_id UUID,
  p_amount DECIMAL,
  p_new_balance DECIMAL,
  p_source VARCHAR
)
RETURNS VOID AS $$
BEGIN
  -- This function is called from external services
  -- The actual broadcast happens via Supabase realtime
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export default SupabaseRealtimeSync;
