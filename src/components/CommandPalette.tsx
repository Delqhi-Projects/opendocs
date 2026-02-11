import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useDocsStore } from "@/store/useDocsStore";
import { Sparkles, MessageSquareText, ClipboardCheck, FilePlus2, Database, SunMoon, Network, PencilLine, Activity, Search } from "lucide-react";
import { cn } from "@/utils/cn";

export type CommandItem = {
  id: string;
  title: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  onOpenAi,
  onOpenChat,
  onOpenAudit,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAi: () => void;
  onOpenChat: () => void;
  onOpenAudit: () => void;
}) {
  const { state, actions } = useDocsStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      {
        id: "ai",
        title: "AI Generate Documentation",
        hint: "Cmd+G",
        icon: Sparkles,
        run: onOpenAi,
      },
      {
        id: "chat",
        title: "AI Global Assistant",
        hint: "Cmd+J",
        icon: MessageSquareText,
        run: onOpenChat,
      },
      {
        id: "audit",
        title: "Content Coherence Audit",
        hint: "Audit",
        icon: ClipboardCheck,
        run: onOpenAudit,
      },
      {
        id: "page",
        title: "Create new document",
        hint: "In root",
        icon: FilePlus2,
        run: () => {
          actions.createPage(state.rootFolderId, "New page");
        },
      },
      {
        id: "database",
        title: "Insert Database (Table/Kanban/Graph)",
        hint: "Slash Command",
        icon: Database,
        run: () => {
          if (!state.selectedPageId) return;
          actions.addBlockAfter(state.selectedPageId, state.pages[state.selectedPageId]?.blocks.at(-1)?.id ?? null, "database");
        },
      },
      {
        id: "graph",
        title: "Insert Workflow/Graph block",
        hint: "Whiteboard",
        icon: Network,
        run: () => {
          if (!state.selectedPageId) return;
          actions.addBlockAfter(state.selectedPageId, state.pages[state.selectedPageId]?.blocks.at(-1)?.id ?? null, "workflow");
        },
      },
      {
        id: "draw",
        title: "Insert Draw (Excalidraw) block",
        hint: "Drawing",
        icon: PencilLine,
        run: () => {
          if (!state.selectedPageId) return;
          actions.addBlockAfter(state.selectedPageId, state.pages[state.selectedPageId]?.blocks.at(-1)?.id ?? null, "draw");
        },
      },
      {
        id: "n8n",
        title: "Insert n8n Node block",
        hint: "Automation",
        icon: Activity,
        run: () => {
          if (!state.selectedPageId) return;
          actions.addBlockAfter(state.selectedPageId, state.pages[state.selectedPageId]?.blocks.at(-1)?.id ?? null, "n8n");
        },
      },
      {
        id: "theme",
        title: `Switch to ${state.theme === "dark" ? "Light" : "Dark"} Mode`,
        hint: "Cmd+D",
        icon: SunMoon,
        run: () => actions.setTheme(state.theme === "dark" ? "light" : "dark"),
      },
    ];
    return list;
  }, [actions, onOpenAi, onOpenAudit, onOpenChat, state.pages, state.rootFolderId, state.selectedPageId, state.theme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => `${it.title} ${it.hint ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      const selected = filtered[activeIndex];
      if (selected) {
        selected.run();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Modal open={open} title="Command Palette" onClose={onClose}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, tools, and actions..."
            className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-1">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  item.run();
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  idx === activeIndex
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded border transition-colors",
                  idx === activeIndex 
                    ? "border-indigo-200 bg-white dark:border-indigo-800 dark:bg-zinc-900" 
                    : "border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                )}>
                  <item.icon className={cn("h-4 w-4", idx === activeIndex ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.title}</div>
                  {item.hint && <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{item.hint}</div>}
                </div>
                {idx === activeIndex && (
                  <div className="text-[10px] text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    ENTER
                  </div>
                )}
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="px-3 py-10 text-center">
              <Activity className="mx-auto h-8 w-8 text-zinc-300 mb-2 opacity-50" />
              <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">No commands found</div>
              <div className="text-xs text-zinc-400 mt-1">Try searching for 'page', 'theme', or 'AI'</div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between px-1 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 border border-zinc-200 dark:border-zinc-700">↑↓</span> Navigate</span>
            <span className="flex items-center gap-1"><span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 border border-zinc-200 dark:border-zinc-700">↵</span> Select</span>
          </div>
          <span className="flex items-center gap-1"><span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 border border-zinc-200 dark:border-zinc-700">esc</span> Close</span>
        </div>
      </div>
    </Modal>
  );
}
