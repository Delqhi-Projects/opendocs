import { ChevronDown, ChevronRight, FileText, Folder, FolderPlus, Plus, SunMoon, Trash2, Search } from "lucide-react";
import { useDocsStore } from "@/store/useDocsStore";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { IconPicker, RenderDocIcon } from "@/components/ui/IconPicker";

export function Sidebar() {
  const { state, actions } = useDocsStore();
  const [filter, setFilter] = useState("");

  if (!state?.folders || !state?.pages) {
    return <aside className="flex h-full w-[320px] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 text-xs italic text-zinc-500">Initializing structure…</aside>;
  }

  return (
    <aside className="flex h-full w-[320px] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">OpenDocs</div>
        <button
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          title="Toggle theme"
          onClick={() => actions.setTheme(state.theme === "dark" ? "light" : "dark")}
        >
          <SunMoon className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            placeholder="Search pages..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pb-3">
        <Button className="flex-1" onClick={() => actions.createPage(state.rootFolderId, "New page")}
          >
          <Plus className="mr-2 h-4 w-4" /> New page
        </Button>
        <button
          className="rounded-md border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          title="New folder"
          onClick={() => actions.createFolder(state.rootFolderId, "New folder")}
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {state.folders?.[state.rootFolderId] ? (
          <FolderNode folderId={state.rootFolderId} depth={0} filter={filter.toLowerCase()} />
        ) : (
          <div className="p-4 text-xs text-zinc-500 italic">No structure found. Try clearing data.</div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
          onClick={actions.clearAllData}
          title="Clear all local data"
        >
          <span className="inline-flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Clear local data
          </span>
          <span className="text-xs text-zinc-400">reset</span>
        </button>
      </div>
    </aside>
  );
}

function FolderNode({ folderId, depth, filter }: { folderId: string; depth: number; filter: string }) {
  const { state, actions } = useDocsStore();
  const [showPicker, setShowPicker] = useState(false);
  
  // Defensive check for state existence
  if (!state.folders) return null;
  
  const folder = state.folders[folderId];
  if (!folder) return null;

  const expanded = state.expandedFolderIds.includes(folderId);

  return (
    <div className="relative">
      <div
        className="group flex items-center justify-between rounded-md px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <button className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded" onClick={() => actions.toggleFolderExpanded(folderId)}>
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          
          <button 
            className="flex items-center gap-2 min-w-0 flex-1 text-left" 
            onClick={() => setShowPicker(!showPicker)}
          >
            <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              {folder.icon ? <RenderDocIcon icon={folder.icon} className="w-4 h-4" /> : <Folder className="w-4 h-4 text-zinc-400" />}
            </div>
            <span className="font-medium truncate">{folder.name}</span>
          </button>
        </div>

        <button
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
          title="New page in folder"
          onClick={() => actions.createPage(folderId, "New page")}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {showPicker && (
        <div className="absolute left-full top-0 z-50 ml-2">
          <IconPicker 
            current={folder.icon} 
            onChange={(icon) => actions.updateFolderIcon(folderId, icon)} 
            onClose={() => setShowPicker(false)} 
          />
        </div>
      )}

      {(expanded || filter) && (
        <div className="pb-1">
          {folder.folderIds.map((fid) => (
            <FolderNode key={fid} folderId={fid} depth={depth + 1} filter={filter} />
          ))}
          {folder.pageIds.map((pid) => (
            <PageNode key={pid} pageId={pid} depth={depth + 1} filter={filter} />
          ))}
        </div>
      )}
    </div>
  );
}

function PageNode({ pageId, depth, filter }: { pageId: string; depth: number; filter: string }) {
  const { state, actions } = useDocsStore();
  const [showPicker, setShowPicker] = useState(false);
  
  // Defensive check for state existence
  if (!state.pages) return null;
  
  const page = state.pages[pageId];
  if (!page) return null;
  
  if (filter && !page.title.toLowerCase().includes(filter)) return null;

  const active = state.selectedPageId === pageId;

  return (
    <div className="relative">
      <button
        onClick={() => actions.selectPage(pageId)}
        className={
          `group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${ 
          active
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200"
            : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"}`
        }
        style={{ paddingLeft: 24 + depth * 12 }}
      >
        <div 
          className="w-4 h-4 flex-shrink-0 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
          onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
        >
          {page.icon ? <RenderDocIcon icon={page.icon} className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
        <span className="truncate flex-1">{page.title}</span>
      </button>

      {showPicker && (
        <div className="absolute left-full top-0 z-50 ml-2">
          <IconPicker 
            current={page.icon} 
            onChange={(icon) => actions.updatePageIcon(pageId, icon)} 
            onClose={() => setShowPicker(false)} 
          />
        </div>
      )}
    </div>
  );
}
