import { useMemo, type ReactNode } from "react";
import type { DocBlock, TableBlock, ChecklistBlock } from "@/types/docs";
import { MermaidView } from "@/components/blocks/MermaidView";
import { DatabaseBlockView } from "@/components/blocks/DatabaseBlockView";
import { WorkflowBlockView } from "@/components/blocks/WorkflowBlockView";
import { DrawBlockView } from "@/components/blocks/DrawBlockView";
import { N8nBlockView } from "@/components/blocks/N8nBlockView";
import { AiPromptBlockView } from "@/components/blocks/AiPromptBlockView";
import { BotMessageSquare, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { BlockChatModal } from "@/components/blocks/BlockChatModal";
import { useState } from "react";
import { useDocsStore } from "@/store/useDocsStore";
import { nanoid } from "nanoid";

export function BlockRenderer({
  block,
  dark,
  onUpdate,
  onDelete,
  onMove,
  onToggleLock,
  onSlash,
}: {
  block: DocBlock;
  dark: boolean;
  onUpdate: (patch: Partial<DocBlock>) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  onToggleLock: () => void;
  onSlash: () => void;
}) {
  const { state } = useDocsStore();
  const pageId = state.selectedPageId || "";
  const [chatOpen, setChatOpen] = useState(false);

  const locked = !!block.locked;
  const frame = locked
    ? "border-amber-300 bg-amber-50/40 dark:border-amber-600 dark:bg-amber-950/20"
    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

  const toolbar = (
    <div className="flex items-center gap-1">
      <button
        className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        onClick={() => setChatOpen(true)}
        title="Chat about this block"
      >
        <BotMessageSquare className="h-4 w-4" />
      </button>
      <button
        className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        onClick={onToggleLock}
        title={locked ? "Unlock" : "Lock"}
      >
        {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
      </button>
      {!locked && (
        <>
          <button
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            onClick={() => onMove("up")}
            title="Move up"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            onClick={() => onMove("down")}
            title="Move down"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          {block.type === "table" && (
            <button
              className="rounded-md px-2 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-200 dark:hover:bg-indigo-950/40"
              onClick={() => onUpdate({ __convertToDatabase: true } as any)}
              title="Convert to Database"
            >
              Convert → DB
            </button>
          )}
          <button
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );

  const disabled = locked;
  let content: ReactNode;

  if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3") {
    const cls =
      block.type === "heading1"
        ? "text-3xl font-semibold"
        : block.type === "heading2"
          ? "text-2xl font-semibold"
          : "text-xl font-semibold";

    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <input
          disabled={disabled}
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value } as any)}
          className={`w-full bg-transparent outline-none ${cls} text-zinc-900 dark:text-zinc-100 disabled:opacity-70`}
        />
      </div>
    );
  } else if (block.type === "paragraph") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <textarea
          disabled={disabled}
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value } as any)}
          onKeyDown={(e) => {
            if (e.key === "/" && (e.currentTarget.value ?? "") === "") {
              e.preventDefault();
              onSlash();
            }
          }}
          placeholder="Write… (type / on empty block to insert)"
          className="min-h-[72px] w-full resize-y rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  } else if (block.type === "code") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              disabled={disabled}
              value={block.language}
              onChange={(e) => onUpdate({ language: e.target.value } as any)}
              className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            />
            <button
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(block.code);
                } catch {
                  // ignore
                }
              }}
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </div>
          {toolbar}
        </div>
        <textarea
          disabled={disabled}
          value={block.code}
          onChange={(e) => onUpdate({ code: e.target.value } as any)}
          className="min-h-[120px] w-full resize-y rounded-md border border-zinc-200 bg-zinc-50 p-2 font-mono text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  } else if (block.type === "callout") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="mb-2 flex items-center gap-2">
          <select
            disabled={disabled}
            value={block.tone}
            onChange={(e) => onUpdate({ tone: e.target.value } as any)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="info">info</option>
            <option value="success">success</option>
            <option value="warning">warning</option>
            <option value="error">error</option>
            <option value="tip">tip</option>
          </select>
          <input
            disabled={disabled}
            value={block.title || ""}
            onChange={(e) => onUpdate({ title: e.target.value } as any)}
            placeholder="Title"
            className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          />
        </div>
        <textarea
          disabled={disabled}
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value } as any)}
          className="min-h-[72px] w-full resize-y rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  } else if (block.type === "checklist") {
    const checklistBlock = block as ChecklistBlock;
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="space-y-2">
          {checklistBlock.items.map((it, idx) => (
            <div key={it.id} className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={it.checked}
                onChange={(e) => {
                  const items = checklistBlock.items.map((x) => (x.id === it.id ? { ...x, checked: e.target.checked } : x));
                  onUpdate({ items } as any);
                }}
              />
              <input
                disabled={disabled}
                value={it.text}
                onChange={(e) => {
                  const items = checklistBlock.items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x));
                  onUpdate({ items } as any);
                }}
                className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                placeholder={idx === 0 ? "Task…" : ""}
              />
            </div>
          ))}
          {!disabled && (
            <button
              className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              onClick={() => onUpdate({ items: [...checklistBlock.items, { id: nanoid(), text: "", checked: false }] } as any)}
            >
              + Add item
            </button>
          )}
        </div>
      </div>
    );
  } else if (block.type === "table") {
    content = <TableEditor block={block} disabled={disabled} frame={frame} toolbar={toolbar} onUpdate={onUpdate} />;
  } else if (block.type === "database") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <DatabaseBlockView block={block} disabled={disabled} onUpdate={onUpdate} />
      </div>
    );
  } else if (block.type === "workflow") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <WorkflowBlockView block={block} disabled={disabled} onUpdate={onUpdate} />
      </div>
    );
  } else if (block.type === "draw") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <DrawBlockView block={block} disabled={disabled} onUpdate={onUpdate} />
      </div>
    );
  } else if (block.type === "n8n") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <N8nBlockView block={block} disabled={disabled} onUpdate={onUpdate} />
      </div>
    );
  } else if (block.type === "aiPrompt") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <AiPromptBlockView
          pageId={pageId}
          block={block}
          disabled={disabled}
          onDelete={onDelete}
        />
      </div>
    );
  } else if (block.type === "mermaid") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <textarea
          disabled={disabled}
          value={block.code}
          onChange={(e) => onUpdate({ code: e.target.value } as any)}
          className="min-h-[100px] w-full resize-y rounded-md border border-zinc-200 bg-white p-2 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <div className="mt-3 rounded-md border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950">
          <MermaidView code={block.code} dark={dark} />
        </div>
      </div>
    );
  } else if (block.type === "quote") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <textarea
          disabled={disabled}
          value={block.text}
          onChange={(e) => onUpdate({ text: e.target.value } as any)}
          className="min-h-[72px] w-full resize-y rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  } else if (block.type === "divider") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="flex items-center justify-between">{toolbar}</div>
        <div className="my-3 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  } else if (block.type === "image") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <input
          disabled={disabled}
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value } as any)}
          placeholder="Image URL"
          className="mb-2 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {block.url ? (
          <img src={block.url} alt={block.alt || ""} className="max-h-[360px] w-full rounded-md object-contain" />
        ) : (
          <div className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Paste an image URL
          </div>
        )}
      </div>
    );
  } else if (block.type === "video") {
    const embed = useMemo(() => toEmbedUrl(block.url), [block.url]);
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <input
          disabled={disabled}
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value } as any)}
          placeholder="Video URL (YouTube/Vimeo)"
          className="mb-2 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {embed ? (
          <div className="aspect-video w-full overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
            <iframe className="h-full w-full" src={embed} title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Paste a supported URL
          </div>
        )}
      </div>
    );
  } else if (block.type === "link") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <input
          disabled={disabled}
          value={block.url}
          onChange={(e) => onUpdate({ url: e.target.value } as any)}
          placeholder="URL"
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  } else if (block.type === "file") {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="flex items-center gap-2">
          <input
            disabled={disabled}
            value={block.name}
            onChange={(e) => onUpdate({ name: e.target.value } as any)}
            className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            disabled={disabled}
            value={block.url || ""}
            onChange={(e) => onUpdate({ url: e.target.value } as any)}
            placeholder="URL"
            className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>
    );
  } else {
    content = (
      <div className={`rounded-lg border p-3 ${frame}`}>
        <div className="mb-2 flex items-center justify-between">{toolbar}</div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">Unsupported block type: {(block as any).type}</div>
      </div>
    );
  }

  return (
    <>
      {content}
      <BlockChatModal open={chatOpen} block={block} onClose={() => setChatOpen(false)} />
    </>
  );
}
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function TableEditor({
  block,
  disabled,
  frame,
  toolbar,
  onUpdate,
}: {
  block: TableBlock;
  disabled: boolean;
  frame: string;
  toolbar: ReactNode;
  onUpdate: (patch: Partial<DocBlock>) => void;
}) {
  const addRow = () => {
    const rows = [...block.rows, { id: nanoid(), cells: block.columns.map(() => ({ id: nanoid(), value: "" })) }];
    onUpdate({ rows } as any);
  };
  const addCol = () => {
    const colId = nanoid();
    const columns = [...block.columns, { id: colId, name: `Col ${block.columns.length + 1}` }];
    const rows = block.rows.map((r) => ({ ...r, cells: [...r.cells, { id: nanoid(), value: "" }] }));
    onUpdate({ columns, rows } as any);
  };
  const delRow = (rowId: string) => {
    const rows = block.rows.filter((r) => r.id !== rowId);
    onUpdate({ rows } as any);
  };
  const delCol = (colId: string) => {
    const idx = block.columns.findIndex((c) => c.id === colId);
    if (idx < 0) return;
    const columns = block.columns.filter((c) => c.id !== colId);
    const rows = block.rows.map((r) => ({ ...r, cells: r.cells.filter((_, i) => i !== idx) }));
    onUpdate({ columns, rows } as any);
  };

  return (
    <div className={`rounded-lg border p-3 ${frame}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!disabled && (
            <>
              <button className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900" onClick={addRow}>
                + Row
              </button>
              <button className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900" onClick={addCol}>
                + Column
              </button>
            </>
          )}
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              {block.columns.map((c) => (
                <th key={c.id} className="sticky top-0 border-b border-zinc-200 bg-white px-2 py-2 text-left text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                  <div className="flex items-center gap-2">
                    <input
                      disabled={disabled}
                      value={c.name}
                      onChange={(e) => {
                        const columns = block.columns.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x));
                        onUpdate({ columns } as any);
                      }}
                      className="w-40 bg-transparent text-xs outline-none"
                    />
                    {!disabled && (
                      <button className="rounded px-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => delCol(c.id)} title="Delete column">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {!disabled && <th className="border-b border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-950" />}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r) => (
              <tr key={r.id}>
                {r.cells.map((cell, i) => (
                  <td key={cell.id} className="border-b border-zinc-100 px-2 py-2 dark:border-zinc-900">
                    <input
                      disabled={disabled}
                      value={cell.value}
                      onChange={(e) => {
                        const rows = block.rows.map((x) =>
                          x.id === r.id
                            ? { ...x, cells: x.cells.map((cc, idx) => (idx === i ? { ...cc, value: e.target.value } : cc)) }
                            : x
                        );
                        onUpdate({ rows } as any);
                      }}
                      className="w-56 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </td>
                ))}
                {!disabled && (
                  <td className="border-b border-zinc-100 px-2 py-2 dark:border-zinc-900">
                    <button className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900" onClick={() => delRow(r.id)}>
                      Delete row
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
