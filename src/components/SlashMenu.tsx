import type { BlockType } from "@/types/docs";

import { 
  Heading1, Heading2, Heading3, Type, Code, Table, Database, 
  Network, PencilLine, ListChecks, Info, Activity, Image, 
  Video, Link, Quote, Minus, File, Sparkles, Zap, Mic,
  type LucideIcon
} from "lucide-react";

const ITEMS: { type: BlockType; label: string; hint: string; icon: LucideIcon }[] = [
  { type: "heading1", label: "Heading 1", hint: "Big title", icon: Heading1 },
  { type: "heading2", label: "Heading 2", hint: "Section", icon: Heading2 },
  { type: "heading3", label: "Heading 3", hint: "Subsection", icon: Heading3 },
  { type: "paragraph", label: "Text", hint: "Paragraph", icon: Type },
  { type: "code", label: "Code", hint: "Snippet", icon: Code },
  { type: "table", label: "Table", hint: "Rows/cols", icon: Table },
  { type: "database", label: "Database", hint: "Table + Kanban", icon: Database },
  { type: "workflow", label: "Workflow", hint: "Visual Graph", icon: Network },
  { type: "draw", label: "Draw", hint: "Excalidraw Canvas", icon: PencilLine },
  { type: "n8n", label: "n8n Node", hint: "Workflow Module", icon: Activity },
  { type: "checklist", label: "Checklist", hint: "Tasks", icon: ListChecks },
  { type: "callout", label: "Callout", hint: "Info box", icon: Info },
  { type: "mermaid", label: "Mermaid", hint: "Diagram", icon: Activity },
  { type: "image", label: "Image", hint: "URL", icon: Image },
  { type: "video", label: "Video", hint: "YouTube/Vimeo", icon: Video },
  { type: "link", label: "Link", hint: "Card", icon: Link },
  { type: "quote", label: "Quote", hint: "Blockquote", icon: Quote },
  { type: "divider", label: "Divider", hint: "Separator", icon: Minus },
  { type: "file", label: "File", hint: "Attachment", icon: File },
  { type: "aiPrompt", label: "AI Prompt", hint: "Generate block", icon: Sparkles },
  { type: "automation", label: "Automation", hint: "n8n-style workflow", icon: Zap },
  { type: "voice", label: "Voice Note", hint: "Record & transcribe", icon: Mic },
];

export function SlashMenu({ onSelect, onClose }: { onSelect: (t: BlockType) => void; onClose: () => void }) {
  return (
    <div className="mt-2 w-[min(520px,90vw)] rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Insert block</div>
        <button type="button" className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900" onClick={onClose}>
          Esc
        </button>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {ITEMS.map((it) => (
          <button
            type="button"
            key={it.type}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            onClick={() => onSelect(it.type)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
              <it.icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="font-medium truncate">{it.label}</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate uppercase tracking-tight">{it.hint}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
