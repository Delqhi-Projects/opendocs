import { Globe, Clock, Database, MousePointerClick, GitBranch, Split, Timer, Mail, Send, Zap, MessageCircle, X, type LucideIcon } from "lucide-react";
import { AUTOMATION_NODE_DEFINITIONS } from "@/types/automation";

interface AutomationNodePanelProps {
  onAddNode: (type: string, subtype: string) => void;
  onClose: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Globe, Clock, Database, MousePointerClick, GitBranch, Split, Timer, Mail, Send, Zap, MessageCircle,
};

export function AutomationNodePanel({ onAddNode, onClose }: AutomationNodePanelProps) {
  const categories = [
    { key: "trigger", label: "Triggers", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { key: "logic", label: "Logic", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
    { key: "action", label: "Actions", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950/30" },
  ];
  
  const nodes = Object.entries(AUTOMATION_NODE_DEFINITIONS);
  
  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-tight">Nodes</span>
        <button type="button" onClick={onClose} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {categories.map((cat) => (
          <div key={cat.key}>
            <div className={`text-[10px] font-bold uppercase tracking-tight mb-1.5 px-1 ${cat.color}`}>
              {cat.label}
            </div>
            <div className="space-y-1">
              {nodes
                .filter(([_, def]) => def.category === cat.key)
                .map(([type, def]) => {
                  const Icon = iconMap[def.icon] || Globe;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onAddNode(def.category, type)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all ${cat.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                      <span className="font-medium">{def.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
