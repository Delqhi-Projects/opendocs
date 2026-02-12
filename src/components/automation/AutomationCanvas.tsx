'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  ConnectionMode
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { TriggerNode } from './nodes/TriggerNode'
import { LogicNode } from './nodes/LogicNode'
import { ActionNode } from './nodes/ActionNode'
import { PropertiesPanel } from './PropertiesPanel'
import type { Automation, AutomationNode, AutomationEdge, AutomationNodeType } from '@/types/automation'

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  logic: LogicNode,
  action: ActionNode
}

interface AutomationCanvasProps {
  automation: Automation
  onChange: (nodes: Node[], edges: Edge[]) => void
  onExecute: () => void
}

function CanvasContent({ automation, onChange, onExecute }: AutomationCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<AutomationNode | null>(null)

  const handleConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds))
  }, [setEdges])

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    const automationNode = automation.nodes.find((n) => n.id === node.id)
    setSelectedNode(automationNode || null)
  }, [automation.nodes])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const initialNodes = useMemo(() => 
    automation.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { label: n.data.label, config: n.data.config, subtype: n.subtype }
    })),
    [automation.nodes]
  )

  const initialEdges = useMemo(() =>
    automation.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      animated: true
    })),
    [automation.edges]
  )

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Background variant={BackgroundVariant.Lines} gap={20} />
          <Controls />
          <MiniMap />
          <Panel position="top-right">
            <button
              onClick={onExecute}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              ▶ Ausführen
            </button>
          </Panel>
        </ReactFlow>
      </div>
      {selectedNode && (
        <PropertiesPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onChange={(config) => {
            setNodes((ns) =>
              ns.map((n) =>
                n.id === selectedNode.id
                  ? { ...n, data: { ...n.data, config } }
                  : n
              )
            )
          }}
        />
      )}
    </div>
  )
}

export function AutomationCanvas(props: AutomationCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  )
}
