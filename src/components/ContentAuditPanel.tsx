import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDocsStore } from "@/store/useDocsStore";
import { nvidiaChatText } from "@/services/nvidia";
import type { DocBlock } from "@/types/docs";

function summarizeBlock(block: DocBlock): string {
  switch (block.type) {
    case "heading1":
    case "heading2":
    case "heading3":
    case "paragraph":
    case "quote":
      return block.text.slice(0, 200);
    case "code":
      return `code(${block.language}) ${block.code.slice(0, 160)}`;
    case "callout":
      return `callout(${block.tone}) ${block.title ?? ""} ${block.text.slice(0, 160)}`;
    case "table":
      return `table(${block.columns.length} cols, ${block.rows.length} rows)`;
    case "database":
      return `database(${block.data.title}, ${block.data.properties.length} props, ${block.data.rows.length} rows)`;
    case "workflow":
      return `workflow(${block.data.nodes.length} nodes, ${block.data.edges.length} edges)`;
    case "draw":
      return `draw(${block.data.elements?.length ?? 0} elements)`;
    case "mermaid":
      return `mermaid(${block.code.slice(0, 120)})`;
    case "image":
      return `image(${block.url})`;
    case "video":
      return `video(${block.url})`;
    case "link":
      return `link(${block.url})`;
    case "file":
      return `file(${block.name})`;
    case "divider":
      return "divider";
    case "checklist":
      return `checklist(${block.items.length} items)`;
    default:
      return "unknown";
  }
}

export function ContentAuditPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useDocsStore();
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fixes, setFixes] = useState<
    { pageId: string; blockId: string; patch: Partial<DocBlock> }[]
  >([]);

  const context = useMemo(() => {
    const pages = Object.values(state.pages).map((p) => ({
      id: p.id,
      title: p.title,
      blocks: p.blocks.map((b) => ({ id: b.id, type: b.type, summary: summarizeBlock(b) })),
    }));
    return { pages };
  }, [state.pages]);

  const runAudit = async () => {
    setBusy(true);
    setError("");
    try {
      const system =
        "You are OpenDocs QA. Evaluate cross-page coherence and consistency. Return a concise report with: 1) Alignment summary, 2) Mismatches, 3) Suggested fixes, 4) Priority list. Use bullet points.";
      const reply = await nvidiaChatText(JSON.stringify(context), { system, temperature: 0.1 });
      setReport(reply);
    } catch (e) {
      setError(String((e as any)?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const generateFixes = async () => {
    setBusy(true);
    setError("");
    try {
      const system =
        "You are OpenDocs QA. Return JSON array of fix objects: {pageId, blockId, patch}. Only target blocks that are text-based (heading1/2/3, paragraph, quote, callout, code). Use only IDs provided. Example: [{\"pageId\":\"...\",\"blockId\":\"...\",\"patch\":{\"text\":\"New text\"}}]. Return ONLY JSON.";
      const reply = await nvidiaChatText(JSON.stringify(context), { system, temperature: 0.1 });
      const parsed = JSON.parse(reply) as { pageId: string; blockId: string; patch: Partial<DocBlock> }[];
      if (!Array.isArray(parsed)) throw new Error("Invalid fixes format");
      setFixes(parsed);
    } catch (e) {
      setError(String((e as any)?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const applyFixes = () => {
    for (const fix of fixes) {
      actions.updateBlock(fix.pageId, fix.blockId, fix.patch);
    }
  };

  return (
    <Modal open={open} title="Content Coherence Audit" onClose={onClose}>
      <div className="flex h-[70vh] flex-col gap-3">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Audits cross-page consistency to ensure the document set reads as one coherent system.
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          {report ? <pre className="whitespace-pre-wrap font-sans">{report}</pre> : <span className="text-zinc-400">Run audit to generate report…</span>}
        </div>
        {fixes.length > 0 && (
          <div className="rounded-md border border-zinc-200 bg-white p-2 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
            {fixes.length} fix suggestions ready.
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <button className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900" onClick={onClose}>
            Close
          </button>
          <button
            className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
            onClick={generateFixes}
            disabled={busy}
          >
            {busy ? "Generating…" : "Generate fixes"}
          </button>
          <Button onClick={applyFixes} disabled={busy || fixes.length === 0}>
            Apply fixes
          </Button>
          <Button onClick={runAudit} disabled={busy}>
            {busy ? "Auditing…" : "Run audit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
