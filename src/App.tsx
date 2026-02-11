import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { AiPanel } from "@/components/AiPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatPanel } from "@/components/ChatPanel";
import { ContentAuditPanel } from "@/components/ContentAuditPanel";
import { PresenceList } from "@/components/ui/PresenceList";
import { CommandPalette } from "@/components/CommandPalette";
import { useDocsStore } from "@/store/useDocsStore";
import { Sparkles, MessageSquareText, ClipboardCheck } from "lucide-react";

export function App() {
  const { state } = useDocsStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [state.theme]);

  const selectedTitle = useMemo(() => {
    if (!state.selectedPageId) return "";
    return state.pages[state.selectedPageId]?.title || "";
  }, [state.pages, state.selectedPageId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const cmdk = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const cmdg = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g";
      const cmdj = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j";

      if (cmdg) {
        e.preventDefault();
        setAiOpen(true);
      }
      if (cmdj) {
        e.preventDefault();
        setChatOpen(true);
      }
      if (cmdk) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 overflow-hidden">
        <Sidebar />

        <main className="relative flex min-w-0 flex-1 flex-col h-full overflow-hidden">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{selectedTitle || "OpenDocs"}</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tight font-bold">Best Practices Feb 2026 Edition</div>
            </div>
            <div className="flex items-center gap-3">
              <PresenceList />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <button
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                onClick={() => setAiOpen(true)}
              >
                <Sparkles className="h-4 w-4" /> AI
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                onClick={() => setChatOpen(true)}
              >
                <MessageSquareText className="h-4 w-4" /> Chat
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                onClick={() => setAuditOpen(true)}
              >
                <ClipboardCheck className="h-4 w-4" /> Audit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            <Editor />
          </div>
        </main>
      </div>

      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <ContentAuditPanel open={auditOpen} onClose={() => setAuditOpen(false)} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenAi={() => setAiOpen(true)}
        onOpenChat={() => setChatOpen(true)}
        onOpenAudit={() => setAuditOpen(true)}
      />
    </ErrorBoundary>
  );
}
