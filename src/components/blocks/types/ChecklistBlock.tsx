import type { ChecklistBlock } from "@/types/docs";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { nanoid } from "nanoid";

export function ChecklistBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: ChecklistBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<ChecklistBlock>) => void;
}) {
  return (
    <div className="space-y-1.5">
      {block.items.map((it) => (
        <div key={it.id} className="group flex items-center gap-3">
          <button
            disabled={disabled}
            onClick={() => {
              const items = block.items.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x));
              onUpdate({ items });
            }}
            className="flex-shrink-0 text-zinc-400 hover:text-indigo-600 transition-colors"
          >
            {it.checked ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> : <Circle className="h-4.5 w-4.5" />}
          </button>
          <input
            disabled={disabled}
            value={it.text}
            onChange={(e) => {
              const items = block.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x));
              onUpdate({ items });
            }}
            className={`flex-1 bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100 ${it.checked ? 'text-zinc-400 line-through' : ''}`}
            placeholder="New task"
          />
          {!disabled && (
            <button
              onClick={() => {
                const items = block.items.filter((x) => x.id !== it.id);
                onUpdate({ items });
              }}
              className="rounded p-1 text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-zinc-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          className="ml-7 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50"
          onClick={() => onUpdate({ items: [...block.items, { id: nanoid(), text: "", checked: false }] })}
        >
          <Plus className="h-3 w-3" /> Add item
        </button>
      )}
    </div>
  );
}
