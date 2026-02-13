import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DocsState } from '@/types/docs';
import type { AIDocumentMetadata } from './hybrid-storage';

let supabase: SupabaseClient | null = null;

export function initSupabase(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClient {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export function getSupabase(): SupabaseClient | null {
  return supabase;
}

export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

export interface SyncResult {
  success: boolean;
  syncedAt: string;
  error?: string;
}

export async function syncDocsToSupabase(
  state: DocsState,
  metadata: AIDocumentMetadata[]
): Promise<SyncResult> {
  if (!supabase) {
    return { success: false, syncedAt: new Date().toISOString(), error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase.from('documents').upsert({
      id: 'current',
      state: JSON.stringify(state),
      metadata: JSON.stringify(metadata),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true, syncedAt: new Date().toISOString() };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, syncedAt: new Date().toISOString(), error: message };
  }
}

export async function loadDocsFromSupabase(): Promise<DocsState | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('state')
      .eq('id', 'current')
      .single();

    if (error) throw error;
    if (!data?.state) return null;

    return JSON.parse(data.state) as DocsState;
  } catch {
    return null;
  }
}

export async function loadMetadataFromSupabase(): Promise<AIDocumentMetadata[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('metadata')
      .eq('id', 'current')
      .single();

    if (error) throw error;
    if (!data?.metadata) return [];

    return JSON.parse(data.metadata) as AIDocumentMetadata[];
  } catch {
    return [];
  }
}

export async function hasSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('documents').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
