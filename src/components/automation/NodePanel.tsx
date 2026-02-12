'use client'

import { useDrag } from '@xyflow/react'
import type { AutomationNodeType } from '@/types/automation'

const nodeDefinitions = [
  {
    type: 'trigger' as const,
    nodes: [
      { subtype: 'manual' as AutomationNodeType, label: 'Manuell', icon: '🖱️', color: '#f59e0b' },
      { subtype: 'webhook' as AutomationNodeType, label: 'Webhook', icon: '🔗', color: '#3b82f6' },
      { subtype: 'schedule' as AutomationNodeType, label: 'Zeitplan', icon: '⏰', color: '#8b5cf6' },
      { subtype: 'db-row-changed' as AutomationNodeType, label: 'Datenänderung', icon: '📊', color: '#10b981' }
    ]
  },
  {
    type: 'logic' as const,
    nodes: [
      { subtype: 'if-else' as AutomationNodeType, label: 'Wenn/Dann', icon: '🔀', color: '#6366f1' },
      { subtype: 'switch' as AutomationNodeType, label: 'Switch', icon: '🎛️', color: '#6366f1' },
      { subtype: 'wait' as AutomationNodeType, label: 'Warten', icon: '⏳', color: '#6366f1' }
    ]
  },
  {
    type: 'action' as const,
    nodes: [
      { subtype: 'send-email' as AutomationNodeType, label: 'E-Mail senden', icon: '📧', color: '#ec4899' },
      { subtype: 'send-webhook' as AutomationNodeType, label: 'Webhook', icon: '🔗', color: '#8b5cf6' },
      { subtype: 'update-db-row' as AutomationNodeType, label: 'Datenbank', icon: '💾', color: '#10b981' },
      { subtype: 'call-n8n' as AutomationNodeType, label: 'n8n Workflow', icon: '⚡', color: '#f59e0b' },
      { subtype: 'openclaw-message' as AutomationNodeType, label: 'WhatsApp', icon: '💬', color: '#22c55e' }
    ]
  }
]

interface NodePanelProps {
  onAddNode: (subtype: AutomationNodeType, type: 'trigger' | 'logic' | 'action') => void
}

export function NodePanel({ onAddNode }: NodePanelProps) {
  return (
    <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <h2 className="font-semibold text-gray-900 mb-4">Knoten</h2>

        {nodeDefinitions.map((category) => (
          <div key={category.type} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {category.type === 'trigger' ? 'Trigger' : category.type === 'logic' ? 'Logik' : 'Aktionen'}
            </h3>

            <div className="space-y-2">
              {category.nodes.map((node) => (
                <DraggableNode
                  key={node.subtype}
                  {...node}
                  onAdd={() => onAddNode(node.subtype, node.type)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DraggableNode({
  subtype,
  label,
  icon,
  color,
  onAdd
}: {
  subtype: AutomationNodeType
  label: string
  icon: string
  color: string
  onAdd: () => void
}) {
  const [, drag] = useDrag(() => ({
    type: 'automation-node',
    item: { subtype }
  }))

  return (
    <div
      ref={drag}
      onClick={onAdd}
      className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-200 cursor-grab hover:border-gray-300 hover:shadow-md transition-all duration-200 active:cursor-grabbing"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  )
}
