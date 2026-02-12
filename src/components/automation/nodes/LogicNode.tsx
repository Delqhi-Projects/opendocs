'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'

export function LogicNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg border-2 min-w-[180px]
        transition-all duration-200
        ${selected ? 'ring-2 ring-primary-500 shadow-primary-500/25' : ''}
      `}
      style={{ backgroundColor: '#6366f115', borderColor: '#6366f1' }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-400" />
      <div className="flex items-center gap-3">
        <span className="text-xl">🔀</span>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{data.label}</div>
          <div className="text-xs text-gray-500 capitalize">{data.subtype?.replace('-', ' ')}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="!w-3 !h-3 !bg-green-400" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="!w-3 !h-3 !bg-red-400" style={{ left: '70%' }} />
    </div>
  )
}
