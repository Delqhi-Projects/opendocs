'use client'

import { useState } from 'react'
import type { AutomationNode } from '@/types/automation'

interface PropertiesPanelProps {
  node: AutomationNode
  onClose: () => void
  onChange: (config: Record<string, unknown>) => void
}

export function PropertiesPanel({ node, onClose, onChange }: PropertiesPanelProps) {
  const [config, setConfig] = useState(node.data.config || {})

  const handleChange = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    onChange(newConfig)
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Eigenschaften</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={node.data.label}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {node.subtype === 'webhook' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Pfad</label>
            <input
              type="text"
              value={(config.path as string) || ''}
              onChange={(e) => handleChange('path', e.target.value)}
              placeholder="/webhook/meine-automation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {node.subtype === 'schedule' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cron Expression</label>
            <input
              type="text"
              value={(config.cron as string) || ''}
              onChange={(e) => handleChange('cron', e.target.value)}
              placeholder="0 9 * * *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {node.subtype === 'send-email' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empfänger</label>
              <input
                type="email"
                value={(config.to as string) || ''}
                onChange={(e) => handleChange('to', e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
              <input
                type="text"
                value={(config.subject as string) || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Benachrichtigung"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </>
        )}

        {node.subtype === 'if-else' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedingung</label>
            <textarea
              value={(config.condition as string) || ''}
              onChange={(e) => handleChange('condition', e.target.value)}
              placeholder="{{input.value}} > 100"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
          </div>
        )}

        {node.subtype === 'send-webhook' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={(config.url as string) || ''}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://api.example.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {node.subtype === 'wait' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wartezeit (Sekunden)</label>
            <input
              type="number"
              value={(config.duration as number) || 5}
              onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}
