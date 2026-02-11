import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { agentPlan, nvidiaChatText } from "@/services/nvidia";
import { executeOpenDocsCommand } from "@/commands/executeCommand";
import type { OpenDocsCommand } from "@/commands/commandTypes";
import type { DocBlock } from "@/types/docs";
import { Wand2, Zap, AlignLeft, ShieldCheck, Languages, Minus, ArrowRight, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; commands?: OpenDocsCommand[] };

function CommandRow({ cmd }: { cmd: OpenDocsCommand }) {
  const [status, setStatus] = useState<string>("");
  const label = JSON.stringify(cmd);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2 py-2 text-[11px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={label}>
        <code>{label}</code>
      </div>
      <div className="flex items-center gap-2">
        {status && <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{status}</span>}
        <button
          type="button"
          className="rounded-md px-2 py-1 text-[10px] text-indigo-700 hover:bg-indigo-50 dark:text-indigo-200 dark:hover:bg-indigo-950/40"
          onClick={async () => {
            const confirmed = confirm(`Apply command?\n\n${label}`);
            if (!confirmed) return;
            const res = await executeOpenDocsCommand(cmd);
            setStatus(res.ok ? "Applied" : `Failed: ${res.message}`);
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function summarizeBlock(block: DocBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading1":
    case "heading2":
    case "heading3":
    case "quote":
      return block.text;
    case "code":
      return `language: ${block.language}\n${block.code}`;
    case "callout":
      return `${block.tone.toUpperCase()} ${block.title ?? ""}\n${block.text}`;
    case "table":
      return `Table with ${block.columns.length} columns and ${block.rows.length} rows.`;
    case "database":
      return `Database: ${block.data.title} (${block.data.rows.length} rows, ${block.data.properties.length} properties)`;
    case "workflow":
      return `Workflow: ${block.data.nodes.length} nodes, ${block.data.edges.length} edges.`;
    case "draw":
      return `Draw block (Excalidraw). Elements: ${block.data.elements?.length ?? 0}`;
    case "mermaid":
      return `Mermaid diagram:\n${block.code}`;
    case "image":
      return `Image URL: ${block.url}`;
    case "video":
      return `Video URL: ${block.url}`;
    case "link":
      return `Link: ${block.url}`;
    case "file":
      return `File: ${block.name} (${block.url ?? "no url"})`;
    case "divider":
      return "Divider";
    case "checklist":
      return `Checklist: ${block.items.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.text}`).join("; ")}`;
    default:
      return "unknown";
  }
}

export function BlockChatModal({
  open,
  block,
  onClose,
}: {
  open: boolean;
  block: DocBlock | null;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [agent, setAgent] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDocked, setIsDocked] = useState(false);

  const context = useMemo(() => (block ? summarizeBlock(block) : ""), [block]);

  useEffect(() => {
    if (open && block) {
      setMsgs([
        {
          role: "assistant",
          content: "Ask me about this block. Enable Agent Mode to propose safe actions.",
        },
      ]);
      setInput("");
      setIsMinimized(false);
    }
  }, [open, block]);

  const send = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || !block) return;
    if (!overrideText) setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: text }]);
    try {
      if (agent) {
        const plan = await agentPlan(text, {
          blockId: block.id,
          blockType: block.type,
          summary: context,
          hint: "The user selected a transformation preset. You MUST propose 'docs.block.update' with the improved content if the user asks to summarize, refactor, or improve this block.",
        });
        setMsgs((m) => [...m, { role: "assistant", content: plan.reply, commands: plan.commands }]);
      } else {
        const reply = await nvidiaChatText(text, {
          system: `You are OpenDocs. Answer based only on this block context.\n\nBlock type: ${(block as DocBlock).type}\nBlock summary:\n${context}`,
        });
        setMsgs((m) => [...m, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: `Error: ${String((e as any)?.message || e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  const presets = [
    { label: "Refactor", icon: Wand2, prompt: "Please refactor and improve the content of this block while maintaining its meaning." },
    { label: "Summarize", icon: AlignLeft, prompt: "Please summarize the content of this block to be as concise as possible." },
    { label: "Fix Tone", icon: ShieldCheck, prompt: "Make the tone of this block more professional and clear." },
    { label: "Translate", icon: Languages, prompt: "Translate the content of this block to English (if it isn't already) or provide a multi-language version." },
  ];

  if (!block) {
    if (isDocked) return null;
    return (
      <Modal open={open} title="Block Chat" onClose={onClose}>
        <div className="p-4 text-sm text-zinc-600 dark:text-zinc-300">No block selected.</div>
      </Modal>
    );
  }

  if (isDocked && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <span className="text-sm font-medium">Block Chat</span>
          <span className="text-xs opacity-75">{block.type}</span>
        </button>
      </div>
    );
  }

  if (isDocked) {
    return (
      <div className="fixed right-4 top-20 bottom-4 z-50 w-96 shadow-2xl">
        <div className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Block Chat</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">• {block.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
                title="Minimize"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { setIsDocked(false); onClose(); }}
                className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {msgs.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={
                      "inline-block max-w-[92%] rounded-lg px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100")
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                value={input}
                disabled={busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about this block…"
                className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
              />
              <Button onClick={() => void send()} disabled={busy || !input.trim()}>
                {busy ? "..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const chatContent = (
    <div className={`flex flex-col gap-3 ${isMinimized ? "h-12" : "h-[70vh]"}`}>
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-amber-500" />
          <span>AI Context active</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            <input type="checkbox" className="rounded border-zinc-300 dark:border-zinc-700" checked={agent} onChange={(e) => setAgent(e.target.checked)} /> Agent Mode
          </label>
          <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700 mx-2" />
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDocked(true)}
            className="rounded p-1 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30"
            title="Dock to right"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/30 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="space-y-3">
              {msgs.map((m, idx) => (
                <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={
                      "inline-block max-w-[92%] rounded-lg px-3 py-2 text-sm " +
                      (m.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100")
                    }
                  >
                    {m.content}
                  </div>
                  {m.commands?.length ? (
                    <div className="mt-2 space-y-2">
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Proposed actions</div>
                      {m.commands.map((c, i) => (
                        <CommandRow key={i} cmd={c} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                type="button"
                key={p.label}
                disabled={busy}
                onClick={() => void send(p.prompt)}
                className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/50 transition-all active:scale-95 disabled:opacity-50"
              >
                <p.icon className="h-3.5 w-3.5 text-indigo-500" />
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={agent ? "Ask + propose actions…" : "Ask about this block…"}
              className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
            />
            <Button onClick={() => void send()} disabled={busy || !input.trim()}>
              {busy ? "..." : "Send"}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal open={open} title={`Block Chat • ${block.type}`} onClose={onClose}>
      {chatContent}
    </Modal>
  );
}
