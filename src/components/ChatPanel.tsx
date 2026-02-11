import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { nvidiaChatText } from "@/services/nvidia";
import { Minus, X, Send } from "lucide-react";

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<{role: "user"|"assistant"; content: string}[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setBusy(true);
    setMsgs(m => [...m, { role: "user", content: text }]);
    try {
      const reply = await nvidiaChatText(text, { system: "You are OpenDocs, a helpful AI assistant." });
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "assistant", content: `Error: ${String(e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-48 z-50">
        <button type="button" onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg hover:bg-indigo-700">
          <span className="text-sm font-medium">Chat</span>
        </button>
      </div>
    );
  }

  return (
    <Modal open={open} title="Chat" onClose={onClose}>
      <div className="flex flex-col h-[60vh]">
        <div className="flex items-center justify-end gap-2 mb-2">
          <button type="button" onClick={() => setIsMinimized(true)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg mb-3">
          {msgs.length === 0 && <div className="text-center text-zinc-500 py-8">Start a conversation…</div>}
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"}`}>{m.content}</div>
            </div>
          ))}
          {busy && <div className="text-center text-zinc-400 text-sm">Thinking…</div>}
        </div>
        <div className="flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Type a message…" disabled={busy}
            className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50" />
          <Button onClick={send} disabled={busy || !input.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </Modal>
  );
}
