import { X } from "lucide-react";
import type { Node } from "@xyflow/react";
import { AUTOMATION_NODE_DEFINITIONS } from "@/types/automation";

interface AutomationPropertiesPanelProps {
  node: Node;
  onUpdate: (data: { label: string; config: Record<string, unknown>; description?: string }) => void;
  onClose: () => void;
}

export function AutomationPropertiesPanel({ node, onUpdate, onClose }: AutomationPropertiesPanelProps) {
  const definition = Object.entries(AUTOMATION_NODE_DEFINITIONS).find(
    ([_, def]) => def.label === node.data.label
  );
  
  if (!definition) return null;
  
  const [, def] = definition;
  
  const handleConfigChange = (key: string, value: unknown) => {
    const currentConfig = (node.data.config as Record<string, unknown>) || {};
    onUpdate({
      label: node.data.label as string,
      config: { ...currentConfig, [key]: value },
      description: node.data.description as string | undefined,
    });
  };
  
  return (
    <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-tight">Properties</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 mb-1">Type</div>
          <div className="text-sm font-medium">{def.label}</div>
          <div className="text-xs text-zinc-500">{def.description}</div>
        </div>
        
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-tight text-zinc-500">Configuration</div>
          {def.configSchema.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  value={(node.data.config as Record<string, unknown>)?.[field.key] as string || ""}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "json" ? (
                <textarea
                  value={JSON.stringify((node.data.config as Record<string, unknown>)?.[field.key] || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleConfigChange(field.key, parsed);
                    } catch {}
                  }}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-2 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={(node.data.config as Record<string, unknown>)?.[field.key] as string || ""}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-2 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
