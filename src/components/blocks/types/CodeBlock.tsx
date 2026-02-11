import type { CodeBlock } from "@/types/docs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CodeBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: CodeBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<CodeBlock>) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="group relative">
      <div className="mb-2 flex items-center justify-between gap-2">
        <input
          disabled={disabled}
          value={block.language}
          onChange={(e) => onUpdate({ language: e.target.value })}
          className="w-24 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          placeholder="Language"
        />
        <button
          onClick={copy}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <textarea
        disabled={disabled}
        value={block.code}
        onChange={(e) => onUpdate({ code: e.target.value })}
        className="min-h-[120px] w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 p-3 font-mono text-[13px] text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        placeholder="// Paste code here"
      />
    </div>
  );
}
