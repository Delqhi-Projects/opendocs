import type { DatabaseBlock } from "@/types/docs";
import { Plus, Trash2 } from "lucide-react";

export function GalleryView({
  data,
  disabled,
  addRow,
  deleteRow,
  updateCell,
}: {
  data: DatabaseBlock["data"];
  disabled: boolean;
  addRow: () => void;
  deleteRow: (id: string) => void;
  updateCell: (rowId: string, propId: string, value: any) => void;
}) {
  const nameProp = data.properties[0];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-zinc-900 dark:text-zinc-100">
      {data.rows.map((r) => (
        <div
          key={r.id}
          className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex h-32 items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-300">
            <span className="text-4xl">📄</span>
          </div>
          <div className="p-3">
            <input
              disabled={disabled}
              value={String(r.cells[nameProp?.id] ?? "")}
              onChange={(e) => updateCell(r.id, nameProp?.id, e.target.value)}
              placeholder="Untitled"
              className="mb-1 w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none dark:text-zinc-100"
            />
            <div className="space-y-1">
              {data.properties.slice(1, 4).map((p) => {
                const val = r.cells[p.id];
                if (val === null || val === undefined || val === "" || val === false) return null;
                return (
                  <div key={p.id} className="truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium">{p.name}:</span> {String(val)}
                  </div>
                );
              })}
            </div>
          </div>
          {!disabled && (
            <button
              onClick={() => deleteRow(r.id)}
              className="absolute right-2 top-2 rounded-md bg-white/80 p-1 text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:bg-zinc-800/80"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <button
          onClick={addRow}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-200 p-8 text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-500 dark:border-zinc-800 dark:hover:border-zinc-700"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Add Item</span>
        </button>
      )}
    </div>
  );
}
