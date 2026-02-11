import type { DividerBlock, QuoteBlock, CalloutBlock, LinkBlock, FileBlock } from "@/types/docs";
import { Info, AlertCircle, CheckCircle2, HelpCircle, Lightbulb, ExternalLink, FileIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function DividerBlockView({ block: _ }: { block: DividerBlock }) {
  return <div className="my-6 h-px w-full bg-zinc-200 dark:bg-zinc-800" />;
}

export function QuoteBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: QuoteBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<QuoteBlock>) => void;
}) {
  return (
    <div className="border-l-4 border-zinc-200 pl-4 dark:border-zinc-800">
      <textarea
        disabled={disabled}
        value={block.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        className="w-full resize-none bg-transparent text-lg italic text-zinc-700 outline-none dark:text-zinc-300"
        placeholder="Quote…"
      />
      <input
        disabled={disabled}
        value={block.caption || ""}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        className="mt-1 w-full bg-transparent text-xs text-zinc-500 outline-none"
        placeholder="— Source"
      />
    </div>
  );
}

export function CalloutBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: CalloutBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<CalloutBlock>) => void;
}) {
  const Icon = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: AlertCircle,
    tip: Lightbulb,
  }[block.tone] || HelpCircle;

  const bgCls = {
    info: "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900",
    success: "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900",
    warning: "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
    error: "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900",
    tip: "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900",
  }[block.tone];

  const iconCls = {
    info: "text-blue-500",
    success: "text-emerald-500",
    warning: "text-amber-500",
    error: "text-red-500",
    tip: "text-indigo-500",
  }[block.tone];

  return (
    <div className={cn("flex gap-3 rounded-lg border p-4", bgCls)}>
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconCls)} />
      <div className="flex-1 space-y-1">
        <input
          disabled={disabled}
          value={block.title || ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full bg-transparent text-sm font-bold text-zinc-900 outline-none dark:text-zinc-100"
          placeholder="Callout title"
        />
        <textarea
          disabled={disabled}
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full resize-none bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-200"
          placeholder="Callout content…"
        />
      </div>
    </div>
  );
}

export function LinkBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: LinkBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<LinkBlock>) => void;
}) {
  return (
    <div className="group relative flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md overflow-hidden">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
         <ExternalLink className="h-6 w-6 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
         <input
           disabled={disabled}
           value={block.title || ""}
           onChange={(e) => onUpdate({ title: e.target.value })}
           className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none dark:text-zinc-100"
           placeholder="Link Title"
         />
         <input
           disabled={disabled}
           value={block.url}
           onChange={(e) => onUpdate({ url: e.target.value })}
           className="w-full bg-transparent text-xs text-zinc-500 outline-none hover:text-indigo-600 truncate"
           placeholder="https://example.com"
         />
      </div>
      {block.url && (
         <a href={block.url} target="_blank" rel="noreferrer" className="shrink-0 rounded-full p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
            <ExternalLink className="h-4 w-4" />
         </a>
      )}
    </div>
  );
}

export function FileBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: FileBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<FileBlock>) => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60">
       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700">
          <FileIcon className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
       </div>
       <div className="flex-1 min-w-0">
          <input
            disabled={disabled}
            value={block.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full bg-transparent text-sm font-medium text-zinc-800 outline-none dark:text-zinc-200"
            placeholder="File name"
          />
          <input
            disabled={disabled}
            value={block.url || ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full bg-transparent text-[11px] text-zinc-400 outline-none"
            placeholder="Upload URL or paste link"
          />
       </div>
       <button className="shrink-0 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
          Download
       </button>
    </div>
  );
}
