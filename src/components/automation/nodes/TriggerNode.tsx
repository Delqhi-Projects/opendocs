'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'
import type { AutomationNodeType } from '@/types/automation'

const triggerIcons: Record<AutomationNodeType, string> = {
  manual: '🖱️',
  webhook: '🔗',
  schedule: '⏰',
  'db-row-changed': '📊'
}

const triggerColors: Record<AutomationNodeType, string> = {
  manual: '#f59e0b',
  webhook: '#3b82f6',
  schedule: '#8b5cf6',
  'db-row-changed': '#10b981'
}

export function TriggerNode({ data, selected }: NodeProps) {
  const icon = triggerIcons[data.subtype as AutomationNodeType] || '⚡'
  const color = triggerColors[data.subtype as AutomationNodeType] || '#6b7280'

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[200px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary-500 shadow-primary-500/25' : ''}
      `}
      style={{ backgroundColor: `${color}15`, borderColor: color }}
    >
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-400" />
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.subtype?.replace('-', ' ')}</div>
        </div>
      </div>
    </div>
  )
}
