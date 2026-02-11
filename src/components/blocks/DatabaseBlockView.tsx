import { useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { Trash2, Zap, LayoutGrid, Table as TableIcon, Network, BotMessageSquare, Activity, Calendar, Image as ImageIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import type { DatabaseBlock, DocBlock } from "@/types/docs";
import type { DbProperty, DbRow } from "@/types/database";
import { WorkflowBlockView } from "@/components/blocks/WorkflowBlockView";
import { CalendarView } from "@/components/database/CalendarView";
import { TimelineView } from "@/components/database/TimelineView";
import { GalleryView } from "@/components/database/GalleryView";
import { DatabaseRulesModal } from "@/components/database/DatabaseRulesModal";
import { 
  createDbRow, 
  deleteDbRow, 
  ensureDbColumns, 
  upsertDbRow, 
  triggerAutomationJob,
} from "@/services/dbProvisioning";

function toPgIdentSafe(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "")
    .slice(0, 50);
}

function uniqColumnName(props: DbProperty[], base: string): string {
  const b = toPgIdentSafe(base) || "col";
  const used = new Set(props.map((p) => p.dbColumnName));
  if (!used.has(b)) return b;
  for (let i = 2; i < 999; i++) {
    const c = `${b}_${i}`;
    if (!used.has(c)) return c;
  }
  return `${b}_${Date.now()}`;
}

function rowToDbPayload(row: DbRow, props: DbProperty[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of props) {
    out[p.dbColumnName] = row.cells[p.id] ?? null;
  }
  return out;
}

export function DatabaseBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: DatabaseBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<DocBlock>) => void;
}) {
  const data = block?.data;
  if (!data) return <div className="p-4 text-xs text-zinc-500 italic">Database configuration missing.</div>;
  
  const views = data.views || [];
  const activeView = views.find((v) => v.id === data.activeViewId) || views[0];
  const remoteTable = data.remote?.tableName;
  const provisioning = data.remote?.provisioning;
  const pending = useRef<Record<string, number>>({});
  const [rulesOpen, setRulesOpen] = useState(false);

  const scheduleUpsert = (row: DbRow) => {
    if (!remoteTable) return;
    if (provisioning && provisioning !== "ready") return;
    if (pending.current[row.id]) window.clearTimeout(pending.current[row.id]);
    pending.current[row.id] = window.setTimeout(async () => {
      await upsertDbRow({ tableName: remoteTable, rowId: row.id, data: rowToDbPayload(row, data.properties) });
      void triggerAutomationJob(remoteTable, row.id);
    }, 350);
  };

  const setData = (next: DatabaseBlock["data"]) => {
    onUpdate({ data: next } as any);
  };

  const addRow = async (initialCells?: Record<string, any>) => {
    if (disabled) return;
    const rowId = nanoid();
    const row: DbRow = { id: rowId, cells: initialCells || {} };
    for (const p of data.properties) {
      if (row.cells[p.id] === undefined) {
        row.cells[p.id] = p.type === "checkbox" ? false : null;
      }
    }
    const next = { ...data, rows: [...data.rows, row] };
    setData(next);
    if (remoteTable && provisioning === "ready") {
      try {
        await createDbRow({ tableName: remoteTable, rowId: row.id });
        scheduleUpsert(row);
      } catch (e) {
        console.error("Failed to provision row:", e);
      }
    }
  };

  const deleteRow = async (rowId: string) => {
    if (disabled) return;
    setData({ ...data, rows: data.rows.filter((r) => r.id !== rowId) });
    if (remoteTable && provisioning === "ready") {
      await deleteDbRow({ tableName: remoteTable, rowId });
    }
  };

  const updateCell = (rowId: string, propId: string, value: any) => {
    if (disabled) return;
    const rows = data.rows.map((r) => (r.id === rowId ? { ...r, cells: { ...r.cells, [propId]: value } } : r));
    const next = { ...data, rows };
    setData(next);
    const row = rows.find((r) => r.id === rowId);
    if (row) scheduleUpsert(row);
  };

  const addProperty = async (type: DbProperty["type"]) => {
    if (disabled) return;
    const baseName = type === "text" ? "Text" : type === "number" ? "Number" : type === "checkbox" ? "Checkbox" : type === "date" ? "Date" : "Select";
    const dbColumnName = uniqColumnName(data.properties, baseName);
    const prop: DbProperty = type === "select"
      ? { id: nanoid(), name: baseName, type: "select", dbColumnName, options: [{ id: nanoid(), name: "Option", color: "zinc" }] }
      : ({ id: nanoid(), name: baseName, type, dbColumnName } as any);
    const next = { ...data, properties: [...data.properties, prop] };
    next.rows = next.rows.map((r) => ({ ...r, cells: { ...r.cells, [prop.id]: type === "checkbox" ? false : null } }));
    setData(next);
    if (remoteTable && provisioning === "ready") {
      await ensureDbColumns({ tableName: remoteTable, columns: [{ name: dbColumnName, type }] });
    }
  };

  const kanban = useMemo(() => {
    if (!activeView || activeView.type !== "kanban") return null;
    const groupPropId = activeView.groupByPropertyId;
    const prop = data.properties.find((p) => p.id === groupPropId);
    if (!prop || prop.type !== "select") return null;
    const groups = prop.options.map((o) => ({ optionId: o.id, name: o.name, rows: [] as DbRow[] }));
    for (const r of data.rows) {
      const v = r.cells[groupPropId];
      const g = groups.find((x) => x.optionId === v);
      if (g) g.rows.push(r);
    }
    return { groupPropId, prop, groups };
  }, [activeView, data.properties, data.rows]);

  return (
    <div className="space-y-3 text-zinc-900 dark:text-zinc-100 font-sans">
      <DatabaseRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} data={data} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            disabled={disabled}
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            className="w-[260px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex items-center rounded-md border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            {data?.views?.map((v) => (
              <button
                key={v.id}
                disabled={disabled}
                onClick={() => setData({ ...data, activeViewId: v.id })}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                  data.activeViewId === v.id || (!data.activeViewId && data.views[0]?.id === v.id)
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {v.type === "table" && <TableIcon className="h-3 w-3" />}
                {v.type === "kanban" && <LayoutGrid className="h-3 w-3" />}
                {v.type === "graph" && <Network className="h-3 w-3" />}
                {v.type === "calendar" && <Calendar className="h-3 w-3" />}
                {v.type === "timeline" && <Activity className="h-3 w-3" />}
                {v.type === "gallery" && <ImageIcon className="h-3 w-3" />}
                {v.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {remoteTable ? (
            <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              DB: <code className="font-mono">{remoteTable}</code> • {provisioning || "idle"}
            </span>
          ) : (
            <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              Local-only database
            </span>
          )}
          {!disabled && (
            <>
              <button
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 shadow-sm"
                onClick={() => void addRow()}
              >
                + Row
              </button>
              <button
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900 shadow-sm"
                onClick={() => setRulesOpen(true)}
                title="Database Automations"
              >
                <Zap className="h-3 w-3" />
              </button>
              <select
                className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 outline-none shadow-sm cursor-pointer"
                onChange={(e) => {
                  const t = e.target.value as DbProperty["type"];
                  if (t) void addProperty(t);
                  e.currentTarget.selectedIndex = 0;
                }}
              >
                <option value="">+ Property</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="checkbox">Checkbox</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>
            </>
          )}
        </div>
      </div>

      {activeView?.type === "graph" ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <WorkflowBlockView
            block={{
              id: block.id,
              type: "workflow",
              data: {
                title: data.title,
                nodes: data.rows.map(r => ({
                  id: r.id,
                  x: r.x_pos ?? 100,
                  y: r.y_pos ?? 100,
                  label: String(r.cells[data.properties[0]?.id] ?? "Untitled"),
                  color: r.color
                })),
                edges: [] 
              }
            }}
            disabled={disabled}
            onUpdate={(patch: any) => {
              if (patch.data?.nodes) {
                const nextRows = data.rows.map((r) => {
                  const node = patch.data.nodes.find((n: any) => n.id === r.id);
                  if (node) return { ...r, x_pos: node.x, y_pos: node.y, color: node.color ?? r.color };
                  return r;
                });
                setData({ ...data, rows: nextRows });
                if (remoteTable && provisioning === "ready") {
                  for (const r of nextRows) {
                    void upsertDbRow({
                      tableName: remoteTable,
                      rowId: r.id,
                      data: { ...rowToDbPayload(r, data.properties), x_pos: r.x_pos ?? null, y_pos: r.y_pos ?? null, color: r.color ?? null },
                    });
                  }
                }
              }
            }}
          />
        </div>
      ) : activeView?.type === "calendar" ? (
        <CalendarView data={data} disabled={disabled} addRow={addRow} updateCell={updateCell} />
      ) : activeView?.type === "timeline" ? (
        <TimelineView data={data} disabled={disabled} addRow={addRow} updateCell={updateCell} />
      ) : activeView?.type === "gallery" ? (
        <GalleryView data={data} disabled={disabled} addRow={addRow} deleteRow={deleteRow} updateCell={updateCell} />
      ) : activeView?.type === "kanban" && kanban ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {kanban.groups.map((g) => (
            <div key={g.optionId} className="rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950 min-h-[120px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{g.name}</div>
                <div className="text-[10px] text-zinc-400 font-mono">{g.rows.length}</div>
              </div>
              <div className="space-y-2">
                {g.rows.map((r) => (
                  <div key={r.id} className="group relative rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <input
                        disabled={disabled}
                        value={String(r.cells[data.properties[0]?.id] ?? "")}
                        onChange={(e) => updateCell(r.id, data.properties[0]?.id, e.target.value)}
                        placeholder="Untitled"
                        className="flex-1 bg-transparent text-sm font-medium text-zinc-900 outline-none dark:text-zinc-100"
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="rounded-md p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100" onClick={() => {}} title="Mini AI Chat"><BotMessageSquare className="h-3 w-3" /></button>
                        {!disabled && <button className="rounded-md p-1 text-zinc-400 hover:text-red-500" onClick={() => void deleteRow(r.id)} title="Delete item"><Trash2 className="h-3 w-3" /></button>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.properties.slice(1).map(p => {
                        const val = r.cells[p.id];
                        if (val === null || val === undefined || val === "" || val === false) return null;
                        return <div key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">{p.name}: {String(val)}</div>;
                      })}
                    </div>
                  </div>
                ))}
                {!disabled && <button onClick={() => addRow()} className="w-full py-2 rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">+ Add card</button>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
          <table className="min-w-full border-separate border-spacing-0 font-sans">
            <thead>
              <tr>
                {data.properties.map((p) => (
                  <th key={p.id} className="border-b border-zinc-200 bg-zinc-50/50 px-3 py-2 text-left text-[11px] font-bold text-zinc-500 uppercase tracking-wider dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                    {p.name}
                  </th>
                ))}
                {!disabled && <th className="border-b border-zinc-200 bg-zinc-50/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50 w-10" />}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id} className="group">
                  {data.properties.map((p) => (
                    <td key={p.id} className="border-b border-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-900 dark:text-zinc-100">
                      <DbCell prop={p} value={r.cells[p.id]} disabled={disabled} onChange={(v) => updateCell(r.id, p.id, v)} />
                    </td>
                  ))}
                  {!disabled && (
                    <td className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-900 w-10">
                      <button className="rounded-md p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => void deleteRow(r.id)} title="Delete row"><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {data.rows.length === 0 && <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400 italic">No entries yet.</div>}
        </div>
      )}
    </div>
  );
}

function DbCell({ prop, value, disabled, onChange }: { prop: DbProperty; value: any; disabled: boolean; onChange: (v: any) => void; }) {
  if (prop.type === "checkbox") return <div className="flex justify-center w-full"><input disabled={disabled} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" /></div>;
  if (prop.type === "select") return <select disabled={disabled} value={(typeof value === "string" ? value : "") || ""} onChange={(e) => onChange(e.target.value || null)} className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"><option value="">—</option>{prop.options.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}</select>;
  if (prop.type === "number") return <input disabled={disabled} type="number" value={typeof value === "number" ? value : value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100" />;
  if (prop.type === "date") return <input disabled={disabled} type="datetime-local" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value || null)} className="w-full bg-transparent text-xs text-zinc-900 outline-none dark:text-zinc-100" />;
  return <input disabled={disabled} value={typeof value === "string" ? value : value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-100" />;
}
