import { openDB, type IDBPDatabase } from 'idb';
import type { DocsState } from '@/types/docs';

const DB_NAME = 'opendocs-hybrid';
const DB_VERSION = 1;

export interface AIDocumentMetadata {
  id: string;
  agentId: string;
  agentName: string;
  generatedAt: string;
  source: 'topic' | 'github' | 'website';
  prompt: string;
  syncedToSupabase: boolean;
  lastModified: string;
}

export interface HybridStorage {
  docs: DocsState;
  metadata: AIDocumentMetadata[];
  lastSync: string | null;
}

interface OpenDocsDB {
  docs: {
    key: string;
    value: DocsState;
  };
  metadata: {
    key: string;
    value: AIDocumentMetadata;
    indexes: { 'by-agent': string; 'by-date': string };
  };
  sync: {
    key: string;
    value: { lastSync: string; pendingChanges: string[] };
  };
}

let dbInstance: IDBPDatabase<OpenDocsDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OpenDocsDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OpenDocsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const docsStore = db.createObjectStore('docs', { keyPath: 'id' });
      docsStore.createIndex('by-id', 'id');

      const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
      metadataStore.createIndex('by-agent', 'agentId');
      metadataStore.createIndex('by-date', 'generatedAt');

      db.createObjectStore('sync', { keyPath: 'id' });
    },
  });

  return dbInstance;
}

export async function saveDocsLocally(state: DocsState): Promise<void> {
  const db = await getDB();
  await db.put('docs', state, 'current');
}

export async function loadDocsLocally(): Promise<DocsState | undefined> {
  const db = await getDB();
  const result = await db.get('docs', 'current');
  return result;
}

export async function saveAIMetadata(metadata: AIDocumentMetadata): Promise<void> {
  const db = await getDB();
  await db.put('metadata', metadata);
}

export async function getAIDocumentsByAgent(agentId: string): Promise<AIDocumentMetadata[]> {
  const db = await getDB();
  return db.getAllFromIndex('metadata', 'by-agent', agentId);
}

export async function getAllAIMetadata(): Promise<AIDocumentMetadata[]> {
  const db = await getDB();
  return db.getAll('metadata');
}

export async function updateSyncStatus(docId: string, synced: boolean): Promise<void> {
  const db = await getDB();
  const meta = await db.get('metadata', docId);
  if (meta) {
    meta.syncedToSupabase = synced;
    meta.lastModified = new Date().toISOString();
    await db.put('metadata', meta);
  }
}

export async function getLastSyncTime(): Promise<string | null> {
  const db = await getDB();
  const sync = await db.get('sync', 'main');
  return sync?.lastSync || null;
}

export async function setLastSyncTime(time: string): Promise<void> {
  const db = await getDB();
  await db.put('sync', { lastSync: time, pendingChanges: [] }, 'main');
}

export async function hasPendingChanges(): Promise<boolean> {
  const db = await getDB();
  const sync = await db.get('sync', 'main');
  return (sync?.pendingChanges?.length ?? 0) > 0;
}

export async function clearLocalData(): Promise<void> {
  const db = await getDB();
  await db.clear('docs');
  await db.clear('metadata');
  await db.clear('sync');
}
