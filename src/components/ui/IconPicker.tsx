import { 
  FileText, Folder, Star, Zap, Settings, User, 
  Search, Bell, Bookmark, CheckCircle2, 
  AlertCircle, HelpCircle, Layout, Database,
  Network, PencilLine, Code, Terminal,
  Globe, Mail, MessageSquare, Phone
} from "lucide-react";
import type { DocIcon } from "@/types/icons";
import { useState } from "react";
import { cn } from "@/utils/cn";

const LUCIDE_ICONS: Record<string, any> = {
  FileText, Folder, Star, Zap, Settings, User,
  Search, Bell, Bookmark, CheckCircle2,
  AlertCircle, HelpCircle, Layout, Database,
  Network, PencilLine, Code, Terminal,
  Globe, Mail, MessageSquare, Phone
};

const COMMON_EMOJIS = ["📄", "📁", "⭐", "⚡", "⚙️", "👤", "🔍", "🔔", "🔖", "✅", "⚠️", "❓", "📊", "🗄️", "🌐", "📧", "💬", "📞", "💡", "🚀", "🔥", "🛠️", "📅", "📎"];

export function IconPicker({ current, onChange, onClose }: { current?: DocIcon, onChange: (i: DocIcon) => void, onClose: () => void }) {
  const [tab, setTab] = useState<"lucide" | "emoji" | "custom">(current?.type || "lucide");
  const [customUrl, setCustomUrl] = useState(current?.type === "custom" ? current.value : "");

  return (
    <div className="w-72 rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 p-3 animate-in fade-in zoom-in duration-150">
      <div className="flex gap-1 mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
        {(["lucide", "emoji", "custom"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded",
              tab === t ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-h-48 overflow-y-auto custom-scrollbar">
        {tab === "lucide" && (
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(LUCIDE_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                onClick={() => { onChange({ type: "lucide", value: name }); onClose(); }}
                className={cn(
                  "flex items-center justify-center p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors",
                  current?.type === "lucide" && current.value === name ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" : "text-zinc-500"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        )}

        {tab === "emoji" && (
          <div className="grid grid-cols-6 gap-2">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => { onChange({ type: "emoji", value: emoji }); onClose(); }}
                className={cn(
                  "flex items-center justify-center p-2 rounded text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors",
                  current?.type === "emoji" && current.value === emoji ? "bg-indigo-50 dark:bg-indigo-950/30" : ""
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {tab === "custom" && (
          <div className="space-y-3 p-1">
            <input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Image URL..."
              className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={() => { if (customUrl) { onChange({ type: "custom", value: customUrl }); onClose(); } }}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-1.5 rounded text-[10px] uppercase font-bold tracking-tight shadow-sm active:scale-95 transition-transform"
            >
              Apply URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function RenderDocIcon({ icon, className }: { icon?: DocIcon, className?: string }) {
  if (!icon) return null;
  
  if (icon.type === "emoji") {
    return <span className={cn("inline-flex items-center justify-center", className)}>{icon.value}</span>;
  }
  
  if (icon.type === "lucide") {
    const Icon = LUCIDE_ICONS[icon.value] || FileText;
    return <Icon className={className} />;
  }
  
  if (icon.type === "custom") {
    return <img src={icon.value} className={cn("object-contain", className)} alt="icon" />;
  }
  
  return null;
}
