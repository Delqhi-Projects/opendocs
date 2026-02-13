import { useEffect, useMemo, useState } from "react";
import { Play, Power, Link2, RefreshCcw } from "lucide-react";
import type { DocBlock, N8nBlock } from "@/types/docs";
import {
  listN8nNodes,
  createN8nWorkflow,
  updateN8nNode,
  connectN8nNodes,
  toggleN8nNode,
  executeN8nWorkflow,
  type N8nNodeDefinition,
} from "@/services/n8n";
import { useDocsStore } from "@/store/useDocsStore";
import { cn } from "@/utils/cn";

function makeN8nPatch(patch: Partial<Omit<N8nBlock, 'id' | 'type'>>): Partial<DocBlock> {
  return patch as Partial<DocBlock>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}

export function N8nBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: N8nBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<DocBlock>) => void;
}) {
  const { state } = useDocsStore();
  const [nodes, setNodes] = useState<N8nNodeDefinition[]>([]);
  const [loadingNodes, setLoadingNodes] = useState(false);
  const [error, setError] = useState<string>("");
  const [running, setRunning] = useState(false);
  const data = block?.data;

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoadingNodes(true);
        const list = await listN8nNodes();
        if (mounted) setNodes(list);
      } catch (e) {
        if (mounted) setError(getErrorMessage(e));
      } finally {
        if (mounted) setLoadingNodes(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const nodeOptions = useMemo(() => nodes.map((n) => ({
    value: n.type,
    label: n.name || n.type,
  })), [nodes]);

  const saveNode = async () => {
    if (disabled || !data) return;
    if (!data.workflowId) {
      const wf = await createN8nWorkflow(data.title || "OpenDocs Workflow");
      onUpdate(makeN8nPatch({ data: { ...data, workflowId: wf.id } }));
    }
    const nodeRes = await updateN8nNode({
      workflowId: data.workflowId || "",
      nodeId: data.node?.name,
      config: data.node,
    });
    onUpdate(makeN8nPatch({ data: { ...data, workflowId: data.workflowId || "", node: { ...data.node, name: nodeRes.nodeId } } }));
  };

  const runNodeTest = async () => {
    if (disabled || !data?.workflowId) return;
    setRunning(true);
    try {
      const res = await executeN8nWorkflow(data.workflowId);
      alert(`Execution triggered! ID: ${res.executionId}`);
    } catch (e) {
      alert(`Execution failed: ${getErrorMessage(e)}`);
    } finally {
      setRunning(false);
    }
  };

  if (!data?.node) {
    return <div className="p-4 text-xs text-zinc-500 italic text-zinc-900 dark:text-zinc-100">n8n Node configuration missing.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-2 w-2 rounded-full",
            data.node.disabled ? "bg-zinc-300" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          )} />
          <input
            disabled={disabled}
            value={data.title}
            onChange={(e) => onUpdate(makeN8nPatch({ data: { ...data, title: e.target.value } }))}
            className="w-[260px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={cn(
              "rounded-md border px-2 py-1 text-xs font-bold uppercase tracking-tight transition-all",
              data.node.disabled
                ? "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
            )}
            disabled={disabled}
            onClick={async () => {
              const next = !data.node.disabled;
              onUpdate(makeN8nPatch({ data: { ...data, node: { ...data.node, disabled: next } } }));
              if (data.workflowId && data.node.name) {
                await toggleN8nNode({ workflowId: data.workflowId, nodeId: data.node.name, disabled: next });
              }
            }}
            title="Enable/Disable Node"
          >
            <Power className="h-3 w-3 inline-block mr-1" /> {data.node.disabled ? "Offline" : "Active"}
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-bold uppercase tracking-tight text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            onClick={runNodeTest}
            disabled={disabled || running || !data.workflowId}
          >
            {running ? <RefreshCcw className="h-3 w-3 inline-block mr-1 animate-spin" /> : <Play className="h-3 w-3 inline-block mr-1" />}
            {running ? "Running" : "Test"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Node Module</div>
          <select
            disabled={disabled}
            value={data.node.nodeType}
            onChange={(e) => onUpdate(makeN8nPatch({ data: { ...data, node: { ...data.node, nodeType: e.target.value } } }))}
            className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <option value="">Select node…</option>
            {nodeOptions.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
          {loadingNodes && <div className="mt-2 text-xs text-zinc-500">Loading node catalog…</div>}
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            n8n module catalog is loaded from your local n8n instance.
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">Parameters (JSON)</div>
          <textarea
            disabled={disabled}
            value={JSON.stringify(data.node.parameters || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value || "{}");
                onUpdate(makeN8nPatch({ data: { ...data, node: { ...data.node, parameters: parsed } } }));
              } catch {
                // ignore parse errors while typing
              }
            }}
            className="h-40 w-full rounded-md border border-zinc-200 bg-white p-2 font-mono text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Visual Connections</div>
          {data.workflowId && (
            <div className="text-[10px] text-zinc-400 font-mono">WF: {data.workflowId}</div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
             <div className="text-[10px] text-zinc-400 uppercase font-bold px-1">Connect to Inputs</div>
             <div className="flex flex-wrap gap-1.5 p-1 rounded-md border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
               {(state.pages?.[state.selectedPageId || ""]?.blocks || [])
                 .filter((b): b is N8nBlock => b?.type === "n8n" && b?.id !== block?.id)
                 .map((other) => {
                   const isConnected = (data?.connections || []).includes(other.id);
                   const isOutputtingToThis = (other.data?.connections || []).includes(block.id);
                   
                   return (
                     <button
                       type="button"
                       key={other.id}
                       onClick={async () => {
                         let next: string[];
                         if (isConnected) {
                           next = (data.connections || []).filter(id => id !== other.id);
                         } else {
                           next = [...(data.connections || []), other.id];
                           if (data.workflowId && data.node?.name && other.data?.node?.name) {
                             try {
                               await connectN8nNodes({ 
                                 workflowId: data.workflowId, 
                                 sourceNodeId: other.data.node.name, 
                                 targetNodeId: data.node.name 
                               });
                             } catch {
                               // Connection error - ignore for now
                             }
                           }
                         }
                         onUpdate(makeN8nPatch({ data: { ...data, connections: next } }));
                       }}
                       className={cn(
                         "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all border relative overflow-hidden",
                         isConnected 
                           ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200" 
                           : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                       )}
                     >
                       <Link2 className={cn("h-3 w-3", isConnected && "animate-pulse")} />
                       {other.data?.title || "n8n Node"}
                       {isOutputtingToThis && (
                         <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-emerald-500" title="Connected" />
                       )}
                     </button>
                   );
                 })}
               {(state.pages?.[state.selectedPageId || ""]?.blocks || []).filter((b): b is N8nBlock => b?.type === "n8n" && b?.id !== block.id).length === 0 && (
                 <div className="text-[10px] text-zinc-400 p-2 italic">No other n8n nodes found in this document.</div>
               )}
             </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              className="flex-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 text-xs font-bold uppercase tracking-tight shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={() => void saveNode()}
              disabled={disabled}
            >
              <RefreshCcw className={cn("h-3 w-3 inline-block mr-1", loadingNodes && "animate-spin")} /> Update Node Settings
            </button>
            
            {data.workflowId && (
               <a 
                 href={`${import.meta.env.VITE_N8N_BASE_URL}/workflow/${data.workflowId}`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[10px] text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
               >
                 Open n8n UI
               </a>
            )}
          </div>
        </div>
        <div className="mt-3 text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-100 dark:border-zinc-800">
           Connecting nodes here creates real edges in your local n8n workflow. The document acts as your canvas.
        </div>
      </div>
    </div>
  );
}
