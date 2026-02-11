import type { DocBlock } from "@/types/docs";
import { 
  BotMessageSquare, Lock, Unlock, Trash2, 
  ArrowUp, ArrowDown, GripVertical, Sparkles
} from "lucide-react";
import { cn } from "@/utils/cn";

export function BlockToolbar({
  block,
  locked,
  onChat,
  onToggleLock,
  onMove,
  onDelete,
  onConvert,
}: {
  block: DocBlock;
  locked: boolean;
  onChat: () => void;
  onToggleLock: () => void;
  onMove: (dir: "up" | "down") => void;
  onDelete: () => void;
  onConvert?: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex h-7 items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          onClick={onChat}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 transition-colors"
          title="AI Block Chat"
        >
          <BotMessageSquare className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onChat}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-500 hover:text-indigo-600 transition-colors"
          title="Instant AI Transformation"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onToggleLock}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded transition-colors",
            locked ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
          title={locked ? "Unlock block" : "Lock block"}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>

        {!locked && (
          <>
            <div className="mx-0.5 h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <button
              onClick={() => onMove("up")}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onMove("down")}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <div className="mx-0.5 h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            {block.type === "table" && onConvert && (
              <button
                onClick={onConvert}
                className="flex h-6 items-center gap-1.5 px-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-[10px] font-bold uppercase tracking-tight text-indigo-600 dark:text-indigo-400"
              >
                DB
              </button>
            )}
            <button
              onClick={onDelete}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
              title="Delete block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
      
      <div className="flex h-7 w-5 items-center justify-center cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
         <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}
