import { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import type { WorkflowBlock, DocBlock } from "@/types/docs";

// Type-safe helper for workflow block updates
function makeWorkflowPatch(patch: Partial<Omit<WorkflowBlock, 'id' | 'type'>>): Partial<DocBlock> {
  return patch as Partial<DocBlock>;
}

// Node data type for React Flow - must extend Record for React Flow compatibility
interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
}

export function WorkflowBlockView({
  block,
  disabled,
  onUpdate,
}: {
  block: WorkflowBlock;
  disabled: boolean;
  onUpdate: (patch: Partial<DocBlock>) => void;
}) {
  const data = block.data;

  // Sync internal React Flow state with block data
  const [nodes, setNodes, onNodesChange] = useNodesState(
    data.nodes.map((n) => ({
      id: n.id,
      position: { x: n.x, y: n.y },
      data: { label: n.label } as WorkflowNodeData,
      style: n.color ? { backgroundColor: n.color } : undefined,
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    data.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    }))
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = { ...params, id: `e-${Date.now()}` } as Edge;
      setEdges((eds) => addEdge(newEdge, eds) as typeof eds);

      // Persist to store
      onUpdate(makeWorkflowPatch({
        data: {
          ...data,
          edges: [
            ...data.edges,
            {
              id: newEdge.id ?? `edge-${Date.now()}`,
              source: newEdge.source,
              target: newEdge.target,
              label: "",
            },
          ],
        },
      }));
    },
    [data, onUpdate, setEdges]
  );

  const onSaveLayout = useCallback(() => {
    onUpdate(makeWorkflowPatch({
      data: {
        ...data,
        nodes: nodes.map((n) => {
          const nodeData = n.data;
          return {
            id: n.id,
            x: n.position.x,
            y: n.position.y,
            label: nodeData.label,
            color: n.style?.backgroundColor,
          };
        }),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
        })),
      },
    }));
  }, [data, edges, nodes, onUpdate]);

  const addNode = () => {
    if (disabled) return;
    const id = `node-${Date.now()}`;
    const newNode = {
      id,
      position: { x: 100, y: 100 },
      data: { label: "New Task" } as WorkflowNodeData,
    } as Node;
    setNodes((nds) => [...nds, newNode] as typeof nds);
    // The save will trigger on the next drag/interaction or manually here
    onUpdate(makeWorkflowPatch({
      data: {
        ...data,
        nodes: [...data.nodes, { id, x: 100, y: 100, label: "New Task" }],
      },
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <input
          disabled={disabled}
          value={data.title}
          onChange={(e) => onUpdate(makeWorkflowPatch({ data: { ...data, title: e.target.value } }))}
          className="w-[260px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 outline-none"
        />
        <div className="flex items-center gap-2">
          {!disabled && (
            <button
              type="button"
              onClick={addNode}
              className="rounded-md bg-white px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 hover:bg-zinc-50"
            >
              + Node
            </button>
          )}
          <div className="text-[10px] text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            React Flow Engine
          </div>
        </div>
      </div>

      <div className="relative h-[400px] w-full rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onSaveLayout}
          fitView
          nodesDraggable={!disabled}
          nodesConnectable={!disabled}
          elementsSelectable={!disabled}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      <p className="text-[11px] text-zinc-500 italic">Tip: Drag nodes to arrange. Connect dots to create dependencies.</p>
    </div>
  );
}
