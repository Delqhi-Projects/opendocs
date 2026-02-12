'use client';

import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { AutomationCanvas } from './AutomationCanvas';
import { AutomationNode, AutomationEdge, AUTOMATION_NODE_DEFINITIONS } from '@/types/automation';

interface AutomationBlockData {
  automation: {
    id: string;
    name: string;
    enabled: boolean;
    nodes: AutomationNode[];
    edges: AutomationEdge[];
    createdAt: string;
    updatedAt: string;
    executionCount: number;
  };
}

interface AutomationBlockProps {
  data: AutomationBlockData;
  onChange?: (data: AutomationBlockData) => void;
}

export function AutomationBlock({ data, onChange }: AutomationBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [automationName, setAutomationName] = useState(data.automation.name);

  const handleChange = useCallback(
    (nodes: AutomationNode[], edges: AutomationEdge[]) => {
      onChange?.({
        ...data,
        automation: {
          ...data.automation,
          nodes,
          edges,
          updatedAt: new Date().toISOString(),
        },
      });
    },
    [data, onChange]
  );

  const addNode = useCallback(
    (subtype: keyof typeof AUTOMATION_NODE_DEFINITIONS) => {
      const def = AUTOMATION_NODE_DEFINITIONS[subtype];
      const newNode: AutomationNode = {
        id: nanoid(8),
        type: def.category === 'trigger' ? 'trigger' : def.category === 'logic' ? 'logic' : 'action',
        subtype,
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
          label: def.label,
          config: {},
          description: def.description,
        },
      };

      handleChange([...data.automation.nodes, newNode], data.automation.edges);
    },
    [data.automation, handleChange]
  );

  const toggleAutomation = useCallback(() => {
    onChange?.({
      ...data,
      automation: {
        ...data.automation,
        enabled: !data.automation.enabled,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [data, onChange]);

  const testAutomation = useCallback(async () => {
    console.log('Testing automation:', data.automation);
    // TODO: Implement test execution via Express proxy
  }, [data.automation]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            placeholder="Automation name..."
          />
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              data.automation.enabled
                ? 'bg-green-500/20 text-green-400'
                : 'bg-zinc-500/20 text-zinc-400'
            }`}
          >
            {data.automation.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={testAutomation}
            className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
          >
            Test
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={toggleAutomation}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              data.automation.enabled
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {data.automation.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-4 flex flex-wrap gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <div className="text-xs font-medium text-zinc-500 w-full mb-1">Add Node:</div>
          {Object.entries(AUTOMATION_NODE_DEFINITIONS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => addNode(key as keyof typeof AUTOMATION_NODE_DEFINITIONS)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all hover:scale-105 ${
                def.category === 'trigger'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                  : def.category === 'logic'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                  : 'bg-pink-500/10 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
              }`}
            >
              + {def.label}
            </button>
          ))}
        </div>
      )}

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <AutomationCanvas
          automation={{
            nodes: data.automation.nodes,
            edges: data.automation.edges,
          }}
          onChange={handleChange}
          readOnly={!isEditing}
        />
      </div>

      {data.automation.executionCount > 0 && (
        <div className="mt-3 text-xs text-zinc-500">
          Executed {data.automation.executionCount} times
        </div>
      )}
    </div>
  );
}
