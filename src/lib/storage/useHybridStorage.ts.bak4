import { useEffect, useCallback } from 'react';
import { useDocsStore } from '@/store/useDocsStore';
import type { DocsState } from '@/types/docs';
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
  createAIMetadata,
  extractFolderName,
  getCurrentAgent,
} from '@/lib/storage/agent-directories';
import type { GeneratedDocs } from '@/services/nvidia';

let syncInProgress = false;

export function useHybridStorage() {
  const state = useDocsStore(s => s.state);
  const actions = useDocsStore(s => s.actions);

  const initStorage = useCallback(async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      initSupabase(supabaseUrl, supabaseKey);
    }

    const localDocs = await loadDocsLocally();
    if (localDocs) {
      actions.hydrate(localDocs);
    } else {
      const supabaseAvailable = await hasSupabaseConnection();
      if (supabaseAvailable) {
        const supabaseDocs = await loadDocsFromSupabase();
        if (supabaseDocs) {
          actions.hydrate(supabaseDocs);
          await saveDocsLocally(supabaseDocs);
        }
      }
    }
  }, [actions]);

  const syncToSupabase = useCallback(async () => {
    if (syncInProgress || !isSupabaseAvailable()) return;
    syncInProgress = true;

    try {
      const metadata = await getAllAIMetadata();
      const result = await syncDocsToSupabase(state, metadata);
      
      if (result.success) {
        console.info('[HybridStorage] Synced to Supabase');
      } else {
        console.warn('[HybridStorage] Sync failed:', result.error);
      }
    } finally {
      syncInProgress = false;
    }
  }, [state]);

  const persistLocally = useCallback(async (docsState: DocsState) => {
    await saveDocsLocally(docsState);
  }, []);

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

export async function generateWithAgentStorage(
  gen: GeneratedDocs,
  mode: 'topic' | 'github' | 'website',
  prompt: string,
  actions: ReturnType<typeof useDocsStore.getState>['actions']
): Promise<void> {
  await createAIMetadata(mode, prompt);
  
  const root = useDocsStore.getState().state.rootFolderId;
  const folderName = extractFolderName(mode, prompt);
  
  const rootFolder = actions.createFolder(root, folderName);

  for (const folder of gen.folders || []) {
    const folderId = actions.createFolder(rootFolder, folder.name || 'Docs');
    for (const page of folder.pages || []) {
      const pageId = actions.createPage(folderId, page.title || 'Untitled');
      const p = useDocsStore.getState().state.pages[pageId];
      const initialId = p.blocks[0]?.id;
      if (initialId) actions.deleteBlock(pageId, initialId);
      let after: string | null = null;
      for (const raw of page.blocks || []) {
        const bid = actions.addBlockAfter(pageId, after, raw.type as never);
        actions.updateBlock(pageId, bid, raw as never);
        after = bid;
      }
    }
  }
}

export { getCurrentAgent };
