import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDocsStore } from "@/store/useDocsStore";
import { agentPlan, nvidiaChatText } from "@/services/nvidia";
import { executeOpenDocsCommand } from "@/commands/executeCommand";
import type { OpenDocsCommand } from "@/commands/commandTypes";

type Msg = { role: "user" | "assistant"; content: string; commands?: OpenDocsCommand[] };

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useDocsStore();
  const page = state.selectedPageId ? state.pages[state.selectedPageId] : undefined;

  const [agent, setAgent] = useState(true);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Ask me about this doc, or enable Agent Mode to propose safe actions (create page, insert blocks, lock blocks).",
    },
  ]);

  const context = useMemo(() => {
    return {
      selectedPage: page
        ? {
            id: page.id,
            title: page.title,
            blocks: page.blocks.map((b) => ({ id: b.id, type: b.type, locked: !!b.locked })),
          }
        : null,
    };
  }, [page]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: text }]);

    try {
      if (agent) {
        const plan = await agentPlan(text, context);
        setMsgs((m) => [...m, { role: "assistant", content: plan.reply, commands: plan.commands }]);
      } else {
        const reply = await nvidiaChatText(text, { system: "You are OpenDocs Assistant. Answer based on the current page context if provided." });
        setMsgs((m) => [...m, { role: "assistant", content: reply }]);
      }
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", content: `Error: ${String((e as any)?.message || e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="AI Chat" onClose={onClose}>
      <div className="flex h-[70vh] flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <input type="checkbox" checked={agent} onChange={(e) => setAgent(e.target.checked)} />
            Agent Mode (propose actions)
          </label>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Context: {page ? page.title : "none"}</div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
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
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">Proposed actions</div>
                    {m.commands.map((c, i) => (
                      <CommandRow key={i} cmd={c} />
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={agent ? "Ask + propose actions…" : "Ask…"}
            className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <Button onClick={() => void send()} disabled={busy}>
            {busy ? "…" : "Send"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CommandRow({ cmd }: { cmd: OpenDocsCommand }) {
  const [status, setStatus] = useState<string>("");

  const label = JSON.stringify(cmd);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-2 py-2 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={label}>
        <code>{label}</code>
      </div>
      <div className="flex items-center gap-2">
        {status && <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{status}</span>}
        <button
          className="rounded-md px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50 dark:text-indigo-200 dark:hover:bg-indigo-950/40"
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
