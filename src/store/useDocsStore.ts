import { create } from "zustand";
import { nanoid } from "nanoid";
import type { DocsState, DocFolder, DocPage, DocBlock, BlockType } from "@/types/docs";
import type { DatabaseBlockData } from "@/types/database";
import { STORAGE_KEYS } from "@/store/storageKeys";
import { createDefaultState } from "@/store/createDefaultState";
import { buildDatabaseTableName } from "@/utils/dbNames";
import { createDbTable, dropDbTable } from "@/services/dbProvisioning";

function now() {
  return new Date().toISOString();
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function loadFromStorage(): DocsState {
  const defaults = createDefaultState();
  try {
    const current = safeParse<Partial<DocsState>>(localStorage.getItem(STORAGE_KEYS.state));
    
    // Defensive check: only use storage if core structures exist
    if (current && typeof current === 'object' && current.folders && current.pages && current.rootFolderId) {
      // Best Practice 2026: merge with defaults to handle schema evolution
      return { 
        ...defaults, 
        ...current,
        // Ensure theme is valid
        theme: (current.theme === 'dark' || current.theme === 'light') ? current.theme : defaults.theme
      } as DocsState;
    }

    // Try migrating legacy keys
    for (const k of STORAGE_KEYS.stateLegacy) {
      const legacy = safeParse<Partial<DocsState>>(localStorage.getItem(k));
      if (legacy && legacy.folders && legacy.pages && legacy.rootFolderId) {
        const merged = { ...defaults, ...legacy } as DocsState;
        localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.error("Hydration failed, using defaults:", e);
  }

  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(defaults));
  return defaults;
}

function persist(state: DocsState) {
  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
}

import type { DocIcon } from "@/types/icons";

export type DocsActions = {
  selectPage: (id: string) => void;
  createPage: (folderId: string, title?: string) => string;
  renamePage: (pageId: string, title: string) => void;
  updatePageIcon: (pageId: string, icon: DocIcon) => void;
  updatePageMetadata: (pageId: string, metadata: { icon?: DocIcon; cover?: string }) => void;
  deletePage: (pageId: string) => void;
  createFolder: (parentFolderId: string, name?: string) => string;
  renameFolder: (folderId: string, name: string) => void;
  updateFolderIcon: (folderId: string, icon: DocIcon) => void;
  deleteFolder: (folderId: string) => void;
  toggleFolderExpanded: (folderId: string) => void;
  addBlockAfter: (pageId: string, afterBlockId: string | null, type: BlockType, options?: { layout?: "grid" | "default" }) => string;
  updateBlock: (pageId: string, blockId: string, patch: Partial<DocBlock>) => void;
  deleteBlock: (pageId: string, blockId: string) => void;
  moveBlock: (pageId: string, blockId: string, direction: "up" | "down") => void;
  reorderBlocks: (pageId: string, oldIndex: number, newIndex: number) => void;
  toggleBlockLock: (pageId: string, blockId: string) => void;
  convertTableToDatabase: (pageId: string, blockId: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  clearAllData: () => void;
};

export type DocsStore = {
  state: DocsState;
  actions: DocsActions;
};

function defaultDatabaseData(): DatabaseBlockData {
  const namePropId = nanoid();
  const statusPropId = nanoid();
  const tableViewId = nanoid();
  const kanbanViewId = nanoid();
  const graphViewId = nanoid();
  return {
    title: "Database",
    properties: [
      { id: namePropId, name: "Name", type: "text", dbColumnName: "name" },
      {
        id: statusPropId,
        name: "Status",
        type: "select",
        dbColumnName: "status",
        options: [
          { id: nanoid(), name: "Backlog", color: "zinc" },
          { id: nanoid(), name: "In Progress", color: "blue" },
          { id: nanoid(), name: "Done", color: "green" },
        ],
      },
    ],
    rows: [],
    views: [
      { id: tableViewId, name: "Table", type: "table" },
      { id: kanbanViewId, name: "Kanban", type: "kanban", groupByPropertyId: statusPropId },
      { id: graphViewId, name: "Graph", type: "graph" },
    ],
    activeViewId: tableViewId,
    remote: { provisioning: "idle", sync: "off" },
  };
}

function newBlock(type: BlockType): DocBlock {
  const id = nanoid();
  switch (type) {
    case "heading1":
    case "heading2":
    case "heading3":
      return { id, type, text: "New heading" } as DocBlock;
    case "paragraph":
      return { id, type, text: "" } as DocBlock;
    case "code":
      return { id, type, language: "ts", code: "" } as DocBlock;
    case "quote":
      return { id, type, text: "Quote…" } as DocBlock;
    case "divider":
      return { id, type } as DocBlock;
    case "image":
      return { id, type, url: "", alt: "" } as DocBlock;
    case "video":
      return { id, type, url: "" } as DocBlock;
    case "link":
      return { id, type, url: "" } as DocBlock;
    case "file":
      return { id, type, name: "file" } as DocBlock;
    case "callout":
      return { id, type, tone: "info", title: "", text: "" } as DocBlock;
    case "checklist":
      return { id, type, items: [{ id: nanoid(), text: "", checked: false }] } as DocBlock;
    case "table":
      return {
        id,
        type,
        columns: [
          { id: nanoid(), name: "Name" },
          { id: nanoid(), name: "Value" },
        ],
        rows: [
          {
            id: nanoid(),
            cells: [
              { id: nanoid(), value: "" },
              { id: nanoid(), value: "" },
            ],
          },
        ],
      } as DocBlock;
    case "database":
      return { id, type, data: defaultDatabaseData() } as DocBlock;
    case "mermaid":
      return { id, type, code: "graph TD\n  A-->B" } as DocBlock;
    case "workflow":
      return {
        id,
        type,
        data: { title: "Workflow Canvas", nodes: [], edges: [] },
      } as DocBlock;
    case "draw":
      return {
        id,
        type,
        data: { elements: [], appState: {}, files: {} },
      } as DocBlock;
    case "n8n":
      return {
        id,
        type,
        data: {
          title: "n8n Node",
          node: { nodeType: "", name: "", parameters: {}, disabled: false },
          connections: [],
          workflowId: undefined,
        },
      } as DocBlock;
    case "aiPrompt":
      return {
        id,
        type: "aiPrompt",
        prompt: "",
      } as DocBlock;
    default:
      return { id, type: "paragraph", text: "" } as DocBlock;
  }
}

async function provisionDatabaseTable(pageId: string, blockId: string) {
  const st = useDocsStore.getState().state;
  const page = st.pages[pageId];
  const blk = page?.blocks.find((b) => b.id === blockId);
  if (!page || !blk || blk.type !== "database") return;

  const tableName = buildDatabaseTableName(pageId, blockId);
  const columns = [
    ...blk.data.properties.map((p) => ({ name: p.dbColumnName, type: p.type })),
    { name: "x_pos", type: "number" as const },
    { name: "y_pos", type: "number" as const },
    { name: "color", type: "text" as const },
  ];

  useDocsStore.getState().actions.updateBlock(pageId, blockId, {
    data: { ...blk.data, remote: { ...blk.data.remote, tableName, provisioning: "creating" } },
  } as any);

  try {
    await createDbTable({ tableName, columns });
    const again = useDocsStore.getState().state.pages[pageId]?.blocks.find((b) => b.id === blockId);
    if (again?.type === "database") {
      useDocsStore.getState().actions.updateBlock(pageId, blockId, {
        data: { ...again.data, remote: { ...again.data.remote, tableName, provisioning: "ready" } },
      } as any);
    }
  } catch (e) {
    const again = useDocsStore.getState().state.pages[pageId]?.blocks.find((b) => b.id === blockId);
    if (again?.type === "database") {
      useDocsStore.getState().actions.updateBlock(pageId, blockId, {
        data: {
          ...again.data,
          remote: {
            ...again.data.remote,
            tableName,
            provisioning: "error",
            lastError: String((e as any)?.message || e),
          },
        },
      } as any);
    }
  }
}

async function deprovisionDatabaseTable(tableName: string) {
  try {
    await dropDbTable({ tableName });
  } catch {
    // best-effort
  }
}

export const useDocsStore = create<DocsStore>()((set) => {
  const initial = loadFromStorage();

  const store: DocsStore = {
    state: initial,
    actions: {
      selectPage: (id) => {
        set((s) => {
          const next = { ...s.state, selectedPageId: id };
          persist(next);
          return { state: next };
        });
      },

      createPage: (folderId, title = "Untitled") => {
        const id = nanoid();
        set((s) => {
          const page: DocPage = { id, title, blocks: [{ id: nanoid(), type: "paragraph", text: "" }], updatedAt: now() };
          const folder = s.state.folders[folderId];
          if (!folder) return s;

          const nextState: DocsState = {
            ...s.state,
            pages: { ...s.state.pages, [id]: page },
            folders: { ...s.state.folders, [folderId]: { ...folder, pageIds: [...folder.pageIds, id] } },
            selectedPageId: id,
          };
          persist(nextState);
          return { state: nextState };
        });
        return id;
      },

      renamePage: (pageId, title) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const nextState: DocsState = {
            ...s.state,
            pages: { ...s.state.pages, [pageId]: { ...page, title, updatedAt: now() } },
          };
          persist(nextState);
          return { state: nextState };
        });
      },

      updatePageIcon: (pageId, icon) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const nextState: DocsState = {
            ...s.state,
            pages: { ...s.state.pages, [pageId]: { ...page, icon, updatedAt: now() } },
          };
          persist(nextState);
          return { state: nextState };
        });
      },

      updatePageMetadata: (pageId, metadata) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const nextState: DocsState = {
            ...s.state,
            pages: { ...s.state.pages, [pageId]: { ...page, ...metadata, updatedAt: now() } },
          };
          persist(nextState);
          return { state: nextState };
        });
      },

      deletePage: (pageId) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          if (page.blocks.some((b) => b.locked)) return s;

          const folders = { ...s.state.folders };
          for (const f of Object.values(folders)) {
            if (f.pageIds.includes(pageId)) {
              f.pageIds = f.pageIds.filter((p) => p !== pageId);
            }
          }
          const pages = { ...s.state.pages };
          delete pages[pageId];

          const nextSelected = s.state.selectedPageId === pageId ? Object.keys(pages)[0] : s.state.selectedPageId;

          const nextState: DocsState = { ...s.state, folders, pages, selectedPageId: nextSelected };
          persist(nextState);
          return { state: nextState };
        });
      },

      createFolder: (parentFolderId, name = "New Folder") => {
        const id = nanoid();
        set((s) => {
          const parent = s.state.folders[parentFolderId];
          if (!parent) return s;

          const nextFolder: DocFolder = { id, name, folderIds: [], pageIds: [] };
          const nextState: DocsState = {
            ...s.state,
            folders: {
              ...s.state.folders,
              [id]: nextFolder,
              [parentFolderId]: { ...parent, folderIds: [...parent.folderIds, id] },
            },
            expandedFolderIds: { ...s.state.expandedFolderIds, [parentFolderId]: true, [id]: true },
          };
          persist(nextState);
          return { state: nextState };
        });
        return id;
      },

      renameFolder: (folderId, name) => {
        set((s) => {
          const folder = s.state.folders[folderId];
          if (!folder) return s;
          const nextState: DocsState = { ...s.state, folders: { ...s.state.folders, [folderId]: { ...folder, name } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      updateFolderIcon: (folderId, icon) => {
        set((s) => {
          const folder = s.state.folders[folderId];
          if (!folder) return s;
          const nextState: DocsState = { ...s.state, folders: { ...s.state.folders, [folderId]: { ...folder, icon } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      deleteFolder: (folderId) => {
        set((s) => {
          const folder = s.state.folders[folderId];
          if (!folder || folderId === s.state.rootFolderId) return s;

          for (const pid of folder.pageIds) {
            const p = s.state.pages[pid];
            if (p?.blocks.some((b) => b.locked)) return s;
          }

          const folders = { ...s.state.folders };
          const pages = { ...s.state.pages };

          for (const pid of folder.pageIds) delete pages[pid];

          for (const f of Object.values(folders)) {
            if (f.folderIds.includes(folderId)) f.folderIds = f.folderIds.filter((x) => x !== folderId);
          }

          delete folders[folderId];

          const nextSelected = s.state.selectedPageId && pages[s.state.selectedPageId] ? s.state.selectedPageId : Object.keys(pages)[0];

          const nextState: DocsState = { ...s.state, folders, pages, selectedPageId: nextSelected };
          persist(nextState);
          return { state: nextState };
        });
      },

      toggleFolderExpanded: (folderId) => {
        set((s) => {
          const nextState: DocsState = {
            ...s.state,
            expandedFolderIds: { ...s.state.expandedFolderIds, [folderId]: !s.state.expandedFolderIds[folderId] },
          };
          persist(nextState);
          return { state: nextState };
        });
      },

      addBlockAfter: (pageId, afterBlockId, type, options) => {
        const id = nanoid();
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const blocks = [...page.blocks];

          const idx = afterBlockId ? blocks.findIndex((b) => b.id === afterBlockId) : -1;
          const insertAt = idx >= 0 ? idx + 1 : 0;
          const newBlockWithLayout = { ...newBlock(type), id };
          if (options?.layout) {
            newBlockWithLayout.layout = options.layout;
          }
          blocks.splice(insertAt, 0, newBlockWithLayout);

          const nextState: DocsState = {
            ...s.state,
            pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } },
          };
          persist(nextState);
          return { state: nextState };
        });

        if (type === "database") {
          setTimeout(() => {
            void provisionDatabaseTable(pageId, id);
          }, 0);
        }

        return id;
      },

      updateBlock: (pageId, blockId, patch) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const blocks = page.blocks.map((b) => {
            if (b.id !== blockId) return b;
            if (b.locked) return b;
            return { ...b, ...patch } as DocBlock;
          });
          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      deleteBlock: (pageId, blockId) => {
        const target = useDocsStore.getState().state.pages[pageId]?.blocks.find((b) => b.id === blockId);
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const blk = page.blocks.find((b) => b.id === blockId);
          if (blk?.locked) return s;
          const blocks = page.blocks.filter((b) => b.id !== blockId);
          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });

        if (target?.type === "database") {
          const tableName = target.data.remote?.tableName;
          if (tableName) {
            setTimeout(() => {
              void deprovisionDatabaseTable(tableName);
            }, 0);
          }
        }
      },

      moveBlock: (pageId, blockId, direction) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const idx = page.blocks.findIndex((b) => b.id === blockId);
          if (idx < 0) return s;
          if (page.blocks[idx]?.locked) return s;

          const nextIdx = direction === "up" ? idx - 1 : idx + 1;
          if (nextIdx < 0 || nextIdx >= page.blocks.length) return s;
          if (page.blocks[nextIdx]?.locked) return s;

          const blocks = [...page.blocks];
          const [moved] = blocks.splice(idx, 1);
          blocks.splice(nextIdx, 0, moved);

          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      reorderBlocks: (pageId, oldIndex, newIndex) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const blocks = [...page.blocks];
          const [moved] = blocks.splice(oldIndex, 1);
          blocks.splice(newIndex, 0, moved);
          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      toggleBlockLock: (pageId, blockId) => {
        set((s) => {
          const page = s.state.pages[pageId];
          if (!page) return s;
          const blocks = page.blocks.map((b) => {
            if (b.id !== blockId) return b;
            const locked = !b.locked;
            return {
              ...b,
              locked,
              lockedAt: locked ? now() : undefined,
              lockedBy: locked ? "local" : undefined,
            };
          });

          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...page, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });
      },

      convertTableToDatabase: (pageId, blockId) => {
        const page = useDocsStore.getState().state.pages[pageId];
        const target = page?.blocks.find((b) => b.id === blockId);
        if (!page || !target || target.type !== "table" || target.locked) return;

        // Build properties from table columns
        const properties = target.columns.map((c, idx) => ({
          id: nanoid(),
          name: c.name || `Column ${idx + 1}`,
          type: "text" as const,
          dbColumnName: `col_${idx + 1}`,
        }));

        const rows = target.rows.map((r) => {
          const cells: Record<string, string | number | boolean | null> = {};
          r.cells.forEach((cell, i) => {
            const prop = properties[i];
            if (prop) cells[prop.id] = cell.value;
          });
          return { id: r.id || nanoid(), cells };
        });

        const tableViewId = nanoid();
        const kanbanViewId = nanoid();
        const graphViewId = nanoid();

        const data: DatabaseBlockData = {
          title: "Database",
          properties,
          rows,
          views: [
            { id: tableViewId, name: "Table", type: "table" },
            { id: kanbanViewId, name: "Kanban", type: "kanban", groupByPropertyId: properties[0]?.id || nanoid() },
            { id: graphViewId, name: "Graph", type: "graph" },
          ],
          activeViewId: tableViewId,
          remote: { provisioning: "idle", sync: "off" },
        };

        // Replace block
        set((s) => {
          const p = s.state.pages[pageId];
          if (!p) return s;
          const blocks = p.blocks.map((b) => (b.id === blockId ? ({ ...b, type: "database", data } as any) : b));
          const nextState: DocsState = { ...s.state, pages: { ...s.state.pages, [pageId]: { ...p, blocks, updatedAt: now() } } };
          persist(nextState);
          return { state: nextState };
        });

        // Provision in background
        setTimeout(() => {
          void provisionDatabaseTable(pageId, blockId);
        }, 0);
      },

      setTheme: (theme) => {
        set((s) => {
          const nextState: DocsState = { ...s.state, theme };
          persist(nextState);
          localStorage.setItem(STORAGE_KEYS.theme, theme);
          return { state: nextState };
        });
      },

      clearAllData: () => {
        for (const k of [STORAGE_KEYS.state, ...STORAGE_KEYS.stateLegacy]) localStorage.removeItem(k);
        for (const k of [STORAGE_KEYS.theme, ...STORAGE_KEYS.themeLegacy]) localStorage.removeItem(k);
        const next = createDefaultState();
        persist(next);
        set({ state: next });
      },
    },
  };

  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme) || STORAGE_KEYS.themeLegacy.map((k) => localStorage.getItem(k)).find(Boolean) || "";
  
  // Detect system preference if no stored theme
  let initialTheme: "light" | "dark" = "light";
  if (storedTheme === "dark" || storedTheme === "light") {
    initialTheme = storedTheme as "light" | "dark";
  } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    initialTheme = "dark";
  }
  
  if (storedTheme === "dark" || storedTheme === "light") {
    store.state = { ...store.state, theme: storedTheme as "light" | "dark" };
  } else {
    store.state = { ...store.state, theme: initialTheme };
  }

  return store;
});
