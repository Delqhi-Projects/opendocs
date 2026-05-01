// @ts-nocheck - Legacy storage integration, needs refactor to match current store structure
import { useEffect, useCallback } from 'react';
import { useDocsStore } from '@/store/useDocsStore';
import {
  saveDocsLocally,
  loadDocsLocally,
  getAllAIMetadata,
} from '@/lib/storage/hybrid-storage';
import {
  initSupabase,
  isSupabaseAvailable,
  syncDocsToSupabase,
  loadDocsFromSupabase,
  hasSupabaseConnection,
} from '@/lib/storage/supabase-sync';
import {
  extractFolderName,
  getCurrentAgent,
} from '@/lib/storage/agent-directories';

let syncInProgress = false;

export function useHybridStorage() {
  const store = useDocsStore();

  const initStorage = useCallback(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      initSupabase(supabaseUrl, supabaseKey);
    }

    const localDocs = await loadDocsLocally();
    if (localDocs) {
      store.setDocuments(localDocs);
    } else {
      const supabaseAvailable = await hasSupabaseConnection();
      if (supabaseAvailable) {
        const supabaseDocs = await loadDocsFromSupabase();
        if (supabaseDocs) {
          store.setDocuments(supabaseDocs);
          await saveDocsLocally(supabaseDocs);
        }
      }
    }
  }, [store.setDocuments]);

  const syncToSupabase = useCallback(async () => {
    if (syncInProgress || !isSupabaseAvailable()) return;
    syncInProgress = true;

    try {
      const metadata = await getAllAIMetadata();
      const result = await syncDocsToSupabase(store, metadata);

      if (result.success) {
        console.info('[HybridStorage] Synced to Supabase');
      } else {
        console.warn('[HybridStorage] Sync failed:', result.error);
      }
    } finally {
      syncInProgress = false;
    }
  }, [store]);

  const persistLocally = useCallback(async () => {
    await saveDocsLocally(store);
  }, [store]);

  useEffect(() => {
    initStorage();
  }, [initStorage]);

  useEffect(() => {
    const handleOnline = () => {
      if (isSupabaseAvailable()) {
        syncToSupabase();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncToSupabase]);

  useEffect(() => {
    if (isSupabaseAvailable()) {
      const interval = setInterval(() => {
        syncToSupabase();
      }, 60000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [syncToSupabase]);

  return {
    initStorage,
    syncToSupabase,
    persistLocally,
    isSupabaseAvailable: isSupabaseAvailable(),
  };
}

// TODO: Fix generateWithAgentStorage - requires proper folder/page/block actions
// export async function generateWithAgentStorage(
//   mode: 'topic' | 'github' | 'website',
//   prompt: string
// ): Promise<void> {
//   await createAIMetadata(mode, prompt);
//   const folderName = extractFolderName(mode, prompt);
//   // Implementation pending folder system refactor
// }

export { getCurrentAgent };
