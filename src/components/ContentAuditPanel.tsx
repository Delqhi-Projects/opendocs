import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { nvidiaChatText } from "@/services/nvidia";
import { Minus, X } from "lucide-react";

export function ContentAuditPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const audit = async () => {
    setBusy(true);
    try {
      const audit = await nvidiaChatText("Analyze the current page content for quality issues and suggest improvements. Return a structured audit report.", { system: "You are a content quality expert." });
      setResult(audit);
    } catch (e) {
      setResult(`Error: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-96 z-50">
        <button type="button" onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow-lg hover:bg-indigo-700">
          <span className="text-sm font-medium">Audit</span>
        </button>
      </div>
    );
  }

  return (
    <Modal open={open} title="Content Audit" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => setIsMinimized(true)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <X className="h-4 w-4" />
          </button>
        </div>
        {!result && (
          <div className="text-center py-8">
            <button onClick={audit} disabled={busy} className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-50">
              {busy ? "Auditing…" : "Run Content Audit"}
            </button>
          </div>
        )}
        {result && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm">{result}</div>
          </div>
        )}
      </div>
    </Modal>
  );
}
