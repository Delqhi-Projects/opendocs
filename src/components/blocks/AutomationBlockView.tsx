import { useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";
import type { Automation, AutomationNode, AutomationEdge as AutomationEdgeType } from "@/types/automation";
import { AutomationNodePanel } from "./AutomationNodePanel";
import { AutomationPropertiesPanel } from "./AutomationPropertiesPanel";
import { AutomationToolbar } from "./AutomationToolbar";
import { useToast } from "@/store/useToastStore";
import { Play, Save, Settings2 } from "lucide-react";

interface AutomationBlockViewProps {
  automation: Automation;
  onUpdate: (automation: Automation) => void;
  disabled?: boolean;
}

const nodeTypes = {
  trigger: TriggerNode,
  logic: LogicNode,
  action: ActionNode,
};

function TriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${selected ? "border-blue-500" : "border-blue-400"} bg-blue-50 dark:bg-blue-950/30`}>
      <div className="text-xs font-bold text-blue-600 uppercase tracking-tight">Trigger</div>
      <div className="text-sm font-semibold">{data.label}</div>
    </div>
  );
}

function LogicNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${selected ? "border-indigo-500" : "border-indigo-400"} bg-indigo-50 dark:bg-indigo-950/30`}>
      <div className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Logic</div>
      <div className="text-sm font-semibold">{data.label}</div>
    </div>
  );
}

function ActionNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${selected ? "border-pink-500" : "border-pink-400"} bg-pink-50 dark:bg-pink-950/30`}>
      <div className="text-xs font-bold text-pink-600 uppercase tracking-tight">Action</div>
      <div className="text-sm font-semibold">{data.label}</div>
    </div>
  );
}

export function AutomationBlockView({ automation, onUpdate, disabled }: AutomationBlockViewProps) {
  const toast = useToast();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(true);
  
  const initialNodes: Node[] = automation.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
  }));
  
  const initialEdges: Edge[] = automation.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
  }));
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (connection: Connection) => {
      if (disabled) return;
      const edge = { ...connection, id: nanoid() };
      setEdges((eds) => addEdge(edge, eds));
    },
    [disabled, setEdges]
  );
  
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);
  
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);
  
  const handleAddNode = (type: string, subtype: string) => {
    if (disabled) return;
    
    const newNode: Node = {
      id: nanoid(),
      type,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: subtype, config: {} },
    };
    
    setNodes((nds) => [...nds, newNode]);
    toast.success(`Added ${subtype} node`);
  };
  
  const handleSave = () => {
    const updatedAutomation: Automation = {
      ...automation,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as "trigger" | "logic" | "action",
        subtype: n.data.label,
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
      })),
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updatedAutomation);
    toast.success("Automation saved");
  };
  
  const handleExecute = () => {
    toast.info("Starting automation execution...");
    setTimeout(() => {
      toast.success("Automation executed successfully");
    }, 2000);
  };
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  
  return (
    <div className="flex h-[600px] bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {showNodePanel && (
        <AutomationNodePanel onAddNode={handleAddNode} onClose={() => setShowNodePanel(false)} />
      )}
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {!showNodePanel && (
              <button
                type="button"
                onClick={() => setShowNodePanel(true)}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Show Nodes
              </button>
            )}
            <span className="text-sm font-medium">{automation.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${automation.enabled ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
              {automation.enabled ? "Active" : "Inactive"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecute}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> Execute
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              type="button"
              className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#f4f4f5" gap={16} size={1} />
            <Controls />
            <MiniMap className="!bg-white dark:!bg-zinc-900" />
          </ReactFlow>
        </div>
      </div>
      
      {selectedNode && (
        <AutomationPropertiesPanel
          node={selectedNode}
          onUpdate={(updatedData) => {
            setNodes((nds) =>
              nds.map((n) => (n.id === selectedNodeId ? { ...n, data: updatedData } : n))
            );
          }}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
