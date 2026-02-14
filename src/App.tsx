"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { AiPanel } from "@/components/AiPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ChatPanel } from "@/components/ChatPanel";
import { ContentAuditPanel } from "@/components/ContentAuditPanel";
import { PresenceIndicators } from "@/components/PresenceIndicators";
import { CursorOverlay } from "@/components/CursorOverlay";
import { CommentPanel } from "@/components/CommentPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { ToastProvider } from "@/components/ui/Toast";
import { useDocsStore } from "@/store/useDocsStore";
import { useTheme } from "@/hooks/useTheme";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { useComments } from "@/hooks/useComments";
import {
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
} from "@/hooks/useKeyboardShortcuts";
import { useBreakpoint } from "@/hooks/useResponsive";
import {
  Sparkles,
  MessageSquareText,
  ClipboardCheck,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { nanoid } from "nanoid";

// Generate a stable user ID for this session (in production, this would come from auth)
const CURRENT_USER_ID = (() => {
  const stored = localStorage.getItem("opendocs_user_id");
  if (stored) return stored;
  const newId = `user_${nanoid(8)}`;
  localStorage.setItem("opendocs_user_id", newId);
  return newId;
})();

const CURRENT_USER_NAME = "You";

export function App() {
  const { state, actions } = useDocsStore();
  const { theme, setTheme } = useTheme();
  const breakpoint = useBreakpoint();

  const [aiOpen, setAiOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return breakpoint !== "xs" && breakpoint !== "sm";
  });

  // Real-time collaboration setup
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const documentId = state.selectedPageId || "default";

  const realtimeConfig = supabaseUrl && supabaseKey ? {
    supabaseUrl,
    supabaseKey,
    documentId,
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
  } : null;

  const realtime = useRealtimeSync(realtimeConfig);

  // Comments system
  const comments = useComments({
    currentUserId: CURRENT_USER_ID,
    currentUserName: CURRENT_USER_NAME,
  });

  const selectedTitle = useMemo(() => {
    if (!state.selectedPageId) return "";
    return state.pages[state.selectedPageId]?.title || "";
  }, [state.pages, state.selectedPageId]);

  useKeyboardShortcuts([
    ...DEFAULT_SHORTCUTS,
    {
      key: "g",
      ctrl: true,
      action: () => setAiOpen(true),
      description: "Open AI",
    },
    {
      key: "j",
      ctrl: true,
      action: () => setChatOpen(true),
      description: "Open Chat",
    },
    {
      key: "k",
      ctrl: true,
      action: () => setCommandOpen(true),
      description: "Command Palette",
    },
    {
      key: "b",
      ctrl: true,
      action: () => setSidebarOpen((s) => !s),
      description: "Toggle Sidebar",
    },
    {
      key: "Escape",
      action: () => {
        setAiOpen(false);
        setChatOpen(false);
        setAuditOpen(false);
        setCommandOpen(false);
      },
      description: "Close All",
    },
  ]);

  useEffect(() => {
    if (state.theme !== theme && theme !== "system") {
      actions.setTheme(theme);
    }
  }, [theme, actions, state.theme]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100 overflow-hidden">
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <Sidebar />
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col h-full overflow-hidden">
          {sidebarOpen && (breakpoint === "xs" || breakpoint === "sm") && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 touch-manipulation">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((s) => !s)}
                className="p-2.5 rounded-lg hover:bg-zinc-100 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-700 lg:hidden touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {selectedTitle || "OpenDocs"}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-tight font-bold">
                  Best Practices Feb 2026 Edition
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as "light" | "dark" | "system")
                }
                className="text-xs border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-white dark:bg-zinc-900"
              >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="system">💻 System</option>
              </select>

              <PresenceIndicators
                presence={realtime.presence}
                currentUserId={CURRENT_USER_ID}
              />
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              <button
                type="button"
                onClick={() => setCommentsOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <MessageCircle className="h-4 w-4" />
                Comments
                {comments.unresolvedCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                    {comments.unresolvedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <Sparkles className="h-4 w-4" /> AI
              </button>
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <MessageSquareText className="h-4 w-4" /> Chat
              </button>
              <button
                type="button"
                onClick={() => setAuditOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <ClipboardCheck className="h-4 w-4" /> Audit
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            <Editor
              onCursorMove={realtime.broadcastCursor}
              onStatusChange={realtime.updatePresence}
            />
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

      {realtime.isConnected && (
        <CursorOverlay
          cursors={realtime.cursors}
          currentUserId={CURRENT_USER_ID}
        />
      )}

      {commentsOpen && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40"
            onClick={() => setCommentsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 ml-auto h-full shadow-xl">
            <CommentPanel
              comments={comments.comments}
              currentUserId={CURRENT_USER_ID}
              onAddReply={(parentId, content) => comments.addComment({ parentId, content, blockId: "general" })}
              onUpdateComment={(id, content) => comments.updateComment({ id, content })}
              onDeleteComment={comments.deleteComment}
              onResolveComment={comments.resolveComment}
              onUnresolveComment={comments.unresolveComment}
              onClose={() => setCommentsOpen(false)}
            />
          </div>
        </div>
      )}

      <ToastProvider />
    </ErrorBoundary>
  );
}
