'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'

const actionIcons: Record<string, string> = {
  'send-email': '📧',
  'send-webhook': '🔗',
  'update-db-row': '💾',
  'call-n8n': '⚡',
  'openclaw-message': '💬'
}

const actionColors: Record<string, string> = {
  'send-email': '#ec4899',
  'send-webhook': '#8b5cf6',
  'update-db-row': '#10b981',
  'call-n8n': '#f59e0b',
  'openclaw-message': '#22c55e'
}

export function ActionNode({ data, selected }: NodeProps) {
  const icon = actionIcons[data.subtype as string] || '⚡'
  const color = actionColors[data.subtype as string] || '#6b7280'

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[180px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary-500 shadow-primary-500/25' : ''}
      `}
      style={{ backgroundColor: `${color}15`, borderColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-400" />
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.subtype?.replace('-', ' ')}</div>
        </div>
      </div>
    </div>
  )
}
