'use client';

import { useState } from 'react';
import { type AutomationNode, AUTOMATION_NODE_DEFINITIONS } from '@/types/automation';
import { propertiesStyles } from './AutomationCanvas.styles';

interface AutomationPropertiesProps {
  node: AutomationNode;
  onClose: () => void;
  onUpdate: (nodeId: string, config: Record<string, unknown>) => void;
}

export function AutomationProperties({ node, onClose, onUpdate }: AutomationPropertiesProps) {
  const definition = AUTOMATION_NODE_DEFINITIONS[node.subtype];
  const [config, setConfig] = useState<Record<string, unknown>>(() => node.data.config || {});
  const [label, setLabel] = useState(() => node.data.label);

  const handleChange = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(node.id, newConfig);
  };

  const handleLabelChange = (value: string) => {
    setLabel(value);
    onUpdate(node.id, { ...config, _label: value });
  };

  const renderField = (field: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'json' | 'boolean';
    options?: string[];
    placeholder?: string;
  }) => {
    const value = config[field.key] ?? '';

    return (
      <div key={field.key} className={propertiesStyles.formGroup}>
        <label className={propertiesStyles.label}>{field.label}</label>
        {field.type === 'text' && (
          <input
            type="text"
            className={propertiesStyles.input}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        )}
        {field.type === 'number' && (
          <input
            type="number"
            className={propertiesStyles.input}
            value={value === '' ? '' : Number(value)}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(field.key, e.target.valueAsNumber)}
          />
        )}
        {field.type === 'select' && (
          <select
            className={propertiesStyles.select}
            value={String(value)}
            onChange={(e) => handleChange(field.key, e.target.value)}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}
        {field.type === 'json' && (
          <textarea
            className={propertiesStyles.textarea}
            value={JSON.stringify(value, null, 2)}
            placeholder={field.placeholder}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(field.key, parsed);
              } catch {
                handleChange(field.key, e.target.value);
              }
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={propertiesStyles.container}>
      <div className={propertiesStyles.header}>
        <div className={propertiesStyles.title}>{definition.label}</div>
        <button className={propertiesStyles.closeBtn} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className={propertiesStyles.content}>
        <div className={propertiesStyles.formGroup}>
          <label className={propertiesStyles.label}>Label</label>
          <input
            type="text"
            className={propertiesStyles.input}
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
        </div>

        <div className={propertiesStyles.formGroup}>
          <label className={propertiesStyles.label}>Description</label>
          <textarea
            className={propertiesStyles.textarea}
            value={node.data.description || ''}
            placeholder="Optional description..."
            onChange={(e) => onUpdate(node.id, { ...config, _description: e.target.value })}
          />
        </div>

        <div style={{ borderTop: '1px solid #3f3f46', margin: '16px 0' }} />

        {definition.configSchema.map(renderField)}

        {definition.description && (
          <>
            <div style={{ borderTop: '1px solid #3f3f46', margin: '16px 0' }} />
            <div style={{ fontSize: '12px', color: '#71717a', fontStyle: 'italic' }}>
              {definition.description}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
