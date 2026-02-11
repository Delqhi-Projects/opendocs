import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDocsStore } from "@/store/useDocsStore";
import { generateFromGitHub, generateFromTopic, generateFromWebsite } from "@/services/nvidia";
import type { GeneratedDocs } from "@/services/nvidia";
import type { DocBlock, BlockType } from "@/types/docs";

type Mode = "topic" | "github" | "website";

const ALLOWED: BlockType[] = [
  "heading1",
  "heading2",
  "heading3",
  "paragraph",
  "code",
  "table",
  "callout",
  "checklist",
  "mermaid",
  "quote",
  "divider",
  "image",
  "video",
  "link",
  "file",
];

function normalizeBlock(b: any): { type: BlockType; payload: Partial<DocBlock> } {
  const t = (b?.type || "paragraph") as BlockType;
  const type: BlockType = ALLOWED.includes(t) ? t : "paragraph";
  return { type, payload: b };
}

export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useDocsStore();
  const [mode, setMode] = useState<Mode>("topic");
  const [input, setInput] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const placeholder = useMemo(() => {
    if (mode === "topic") return "e.g. Tailwind CSS best practices 2026";
    if (mode === "github") return "https://github.com/org/repo";
    return "https://example.com/docs";
  }, [mode]);

  const applyGenerated = async (gen: GeneratedDocs) => {
    const root = state.rootFolderId;
    const rootName = gen.rootName || (mode === "topic" ? input : "AI Docs");
    const rootFolder = actions.createFolder(root, rootName);

    for (const folder of gen.folders || []) {
      const folderId = actions.createFolder(rootFolder, folder.name || "Docs");
      for (const page of folder.pages || []) {
        const pageId = actions.createPage(folderId, page.title || "Untitled");

        // Clear initial block
        const p = useDocsStore.getState().state.pages[pageId];
        const initialId = p.blocks[0]?.id;
        if (initialId) actions.deleteBlock(pageId, initialId);

        let after: string | null = null;
        for (const raw of page.blocks || []) {
          const { type, payload } = normalizeBlock(raw);
          const bid = actions.addBlockAfter(pageId, after, type);
          actions.updateBlock(pageId, bid, payload as any);
          after = bid;
        }
      }
    }
  };

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      if (!input.trim()) throw new Error("Please enter a value");

      let gen: GeneratedDocs;
      if (mode === "topic") gen = await generateFromTopic(input.trim(), { language: "de", depth: "standard" });
      else if (mode === "github") gen = await generateFromGitHub(input.trim());
      else gen = await generateFromWebsite(input.trim());

      await applyGenerated(gen);
      onClose();
    } catch (e) {
      setError(String((e as any)?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="AI Generate" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <option value="topic">Topic</option>
            <option value="github">GitHub URL</option>
            <option value="website">Website URL</option>
          </select>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">{error}</div>}

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900" onClick={onClose}>
            Cancel
          </button>
          <Button onClick={run} disabled={busy}>
            {busy ? "Generating…" : "Generate"}
          </Button>
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Requires the OpenDocs server running (NVIDIA proxy). Set <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">API_AUTH_TOKEN</code> +
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">VITE_API_AUTH_TOKEN</code> for production.
        </div>
      </div>
    </Modal>
  );
}
