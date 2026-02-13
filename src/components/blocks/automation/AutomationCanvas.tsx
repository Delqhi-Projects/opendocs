'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AutomationNode, AutomationEdge, AUTOMATION_NODE_DEFINITIONS } from '@/types/automation';
import { automationNodeStyles, canvasStyles } from './AutomationCanvas.styles';
import { AutomationProperties } from './AutomationProperties';
import { nanoid } from 'nanoid';

interface AutomationCanvasProps {
  automation: {
    nodes: AutomationNode[];
    edges: AutomationEdge[];
  };
  onChange: (nodes: AutomationNode[], edges: AutomationEdge[]) => void;
  readOnly?: boolean;
}

export function AutomationCanvas({ automation, onChange, readOnly = false }: AutomationCanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const initialNodes: Node[] = automation.nodes.map(n => ({
    id: n.id,
    type: 'automationNode',
    position: n.position,
    data: { node: n },
  }));

  const initialEdges: Edge[] = automation.edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      
      const newEdge: Edge = {
        id: `e-${nanoid(8)}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      };
      
      const newAutomationEdge: AutomationEdge = {
        id: newEdge.id,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle ?? undefined,
        targetHandle: params.targetHandle ?? undefined,
      };
      
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        const automationEdges = [...automation.edges, newAutomationEdge];
        onChange(
          nodes.map(n => (n.data as { node: AutomationNode }).node),
          automationEdges
        );
        return updated;
      });
    },
    [readOnly, automation.edges, nodes, onChange, setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const updateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, unknown>) => {
      setNodes((nds) => {
        const updated = nds.map((node) => {
          if (node.id === nodeId) {
            const nodeData = node.data as { node: AutomationNode };
            const updatedNode: Node = {
              ...node,
              data: {
                ...nodeData,
                node: {
                  ...nodeData.node,
                  data: {
                    ...nodeData.node.data,
                    config: { ...nodeData.node.data.config, ...config },
                  },
                },
              },
            };
            return updatedNode;
          }
          return node;
        });
        
        onChange(
          updated.map(n => (n.data as { node: AutomationNode }).node),
          edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined,
          }))
        );
        
        return updated;
      });
    },
    [edges, onChange, setNodes]
  );

  const nodeTypes = {
    automationNode: ({ data }: { data: { node: AutomationNode } }) => {
      const def = AUTOMATION_NODE_DEFINITIONS[data.node.subtype];
      if (!def) return null;
      return (
        <div className={automationNodeStyles.node(def.color)}>
          <div className={automationNodeStyles.header}>
            <span className={automationNodeStyles.icon(def.icon)}>
              {getIconSvg(def.icon)}
            </span>
            <span className={automationNodeStyles.label}>{def.label}</span>
          </div>
          <div className={automationNodeStyles.body}>
            <div className={automationNodeStyles.title}>{data.node.data.label}</div>
            {data.node.data.description && (
              <div className={automationNodeStyles.description}>
                {data.node.data.description}
              </div>
            )}
          </div>
          {def.outputs > 0 && (
            <div className={automationNodeStyles.handleOutput(def.color)} data-handleid="output" />
          )}
          {def.inputs > 0 && (
            <div className={automationNodeStyles.handleInput(def.color)} data-handleid="input" />
          )}
        </div>
      );
    },
  };

  return (
    <div className={canvasStyles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className={canvasStyles.reactFlow}
        proOptions={{ hideAttribution: true }}
      >
        <Controls className={canvasStyles.controls} />
        <MiniMap 
          className={canvasStyles.minimap}
          nodeColor={(node) => {
            const nodeData = node.data as { node?: AutomationNode } | undefined;
            const subtype = nodeData?.node?.subtype;
            if (!subtype) return '#6366f1';
            const def = AUTOMATION_NODE_DEFINITIONS[subtype];
            return def?.color || '#6366f1';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#52525b" />
        
        {!readOnly && (
          <Panel position="top-left">
            <div className={canvasStyles.panel}>
              <div className={canvasStyles.panelTitle}>Automation Builder</div>
              <div className={canvasStyles.panelHint}>
                Drag nodes to connect • Click node to edit
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
      
      {selectedNodeId && (
        <AutomationProperties
          key={selectedNodeId}
          node={nodes.find(n => n.id === selectedNodeId)?.data.node as AutomationNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateNodeConfig}
        />
      )}
    </div>
  );
}

function getIconSvg(iconName: string): string {
  const icons: Record<string, string> = {
    Globe: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    Clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    Database: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    MousePointerClick: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>',
    GitBranch: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/><line x1="6" y1="3" x2="18" y2="9"/></svg>',
    Split: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-9 9"/><path d="M3 21l9-9"/></svg>',
    Timer: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    Mail: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    Send: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>',
    Zap: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    MessageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  };
  return icons[iconName] || '';
}
