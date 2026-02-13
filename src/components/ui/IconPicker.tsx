import { 
  FileText, Folder, Star, Zap, Settings, User, 
  Search, Bell, Bookmark, CheckCircle2, 
  AlertCircle, HelpCircle, Layout, Database,
  Network, PencilLine, Code, Terminal,
  Globe, Mail, MessageSquare, Phone,
  Upload, Home, Heart, Shield, Lock, Unlock,
  Cloud, Sun, Moon, Calendar, Clock, Timer,
  Camera, Image, Video, Music, Mic, Headphones,
  Book, BookOpen, GraduationCap, Award, Trophy,
  Target, Crosshair, Flag, MapPin, Compass,
  Briefcase, Building, Store, ShoppingCart, CreditCard,
  Wallet, PiggyBank, TrendingUp, TrendingDown, BarChart3,
  PieChart, Activity, Cpu, HardDrive, Server,
  Wifi, Bluetooth, Radio, Signal, RefreshCw,
  Play, Pause, Square,
  Volume2, VolumeX, Maximize2, Minimize2,
  Eye, EyeOff, ThumbsUp, ThumbsDown, Smile, Frown,
  Link, ExternalLink, Share2, Download,
  Trash2, Edit3, Copy, Clipboard,
  Plus, Minus, X, Check, MoreHorizontal, MoreVertical,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Move,
  type LucideIcon
} from "lucide-react";
import type { DocIcon } from "@/types/icons";
import { useState } from "react";
import { cn } from "@/utils/cn";

const LUCIDE_ICONS: Record<string, LucideIcon> = {
  // Document & Files
  FileText, Folder, Bookmark, Download, Upload, Copy, Clipboard,
  // Navigation
  Home, ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Move, ExternalLink, Link,
  // Actions
  Plus, Minus, X, Check, Edit3, Trash2, Share2, RefreshCw, Play, Pause, Square,
  // Status & Feedback
  Star, Heart, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, HelpCircle,
  Eye, EyeOff, Shield, Lock, Unlock,
  // UI Elements
  Search, Bell, Settings, User, Layout, MoreHorizontal, MoreVertical,
  Maximize2, Minimize2,
  // Media
  Camera, Image, Video, Music, Mic, Headphones, Volume2, VolumeX,
  // Time & Calendar
  Calendar, Clock, Timer, Sun, Moon,
  // Communication
  Mail, MessageSquare, Phone, Globe, Network,
  // Data & Charts
  Database, BarChart3, PieChart, TrendingUp, TrendingDown, Activity,
  // Tech & Development
  Code, Terminal, Cpu, HardDrive, Server, Cloud,
  // Connectivity
  Wifi, Bluetooth, Radio, Signal,
  // Commerce
  Briefcase, Building, Store, ShoppingCart, CreditCard, Wallet, PiggyBank,
  // Education & Awards
  Book, BookOpen, GraduationCap, Award, Trophy, Target, Crosshair, Flag,
  // Location
  MapPin, Compass,
  // Misc
  Zap, PencilLine, Smile, Frown
};

const COMMON_EMOJIS = ["📄", "📁", "⭐", "⚡", "⚙️", "👤", "🔍", "🔔", "🔖", "✅", "⚠️", "❓", "📊", "🗄️", "🌐", "📧", "💬", "📞", "💡", "🚀", "🔥", "🛠️", "📅", "📎"];

export function IconPicker({ current, onChange, onClose }: { current?: DocIcon, onChange: (i: DocIcon) => void, onClose: () => void }) {
  const [tab, setTab] = useState<"lucide" | "emoji" | "custom">(current?.type || "lucide");
  const [customUrl, setCustomUrl] = useState(current?.type === "custom" ? current.value : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const filteredIcons = searchQuery
    ? Object.entries(LUCIDE_ICONS).filter(([name]) => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Object.entries(LUCIDE_ICONS);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPreview(dataUrl);
      setCustomUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustom = () => {
    if (customUrl) {
      onChange({ type: "custom", value: customUrl });
      onClose();
    }
  };

  return (
    <div className="w-80 rounded-xl border border-zinc-200/80 bg-white/95 backdrop-blur-sm shadow-2xl dark:border-zinc-700/50 dark:bg-zinc-900/95 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-zinc-100/80 dark:bg-zinc-800/50 rounded-lg">
        {(["lucide", "emoji", "custom"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200",
              tab === t 
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" 
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            {t === "lucide" && "Icons"}
            {t === "emoji" && "Emoji"}
            {t === "custom" && "Upload"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-56 overflow-y-auto custom-scrollbar-thin">
        {tab === "lucide" && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search icons..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-zinc-400"
              />
            </div>
            
            {/* Icon Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {filteredIcons.map(([name, Icon]) => (
                <button
                  key={name}
                  onClick={() => { onChange({ type: "lucide", value: name }); onClose(); }}
                  title={name}
                  className={cn(
                    "group relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-150",
                    current?.type === "lucide" && current.value === name 
                      ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30" 
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 hover:scale-110"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {name}
                  </span>
                </button>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-6 text-zinc-400 text-xs">
                No icons found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {tab === "emoji" && (
          <div className="grid grid-cols-8 gap-1.5">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => { onChange({ type: "emoji", value: emoji }); onClose(); }}
                className={cn(
                  "flex items-center justify-center p-2 rounded-lg text-lg transition-all duration-150 hover:scale-125",
                  current?.type === "emoji" && current.value === emoji 
                    ? "bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500/30" 
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {tab === "custom" && (
          <div className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Upload Image
              </label>
              <div 
                onClick={() => fileInputRef?.click()}
                className="relative flex flex-col items-center justify-center py-6 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
              >
                {uploadedPreview ? (
                  <img 
                    src={uploadedPreview} 
                    alt="Preview" 
                    className="h-12 w-12 object-contain rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500">
                      Click to upload
                    </span>
                  </>
                )}
              </div>
              <input
                ref={(el) => { if (el) setFileInputRef(el); }}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Or paste URL
              </label>
              <input
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setUploadedPreview(null);
                }}
                placeholder="https://example.com/icon.png"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all placeholder:text-zinc-400"
              />
            </div>

            {/* Preview & Apply */}
            {customUrl && (
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 bg-white dark:bg-zinc-700 rounded-lg border border-zinc-200 dark:border-zinc-600 flex items-center justify-center overflow-hidden">
                  {customUrl.startsWith("data:") ? (
                    <img src={customUrl} alt="Preview" className="h-8 w-8 object-contain" />
                  ) : (
                    <img src={customUrl} alt="Preview" className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = "/favicon.svg"; }} />
                  )}
                </div>
                <button
                  onClick={handleApplyCustom}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-2 px-4 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all"
                >
                  Apply Icon
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function RenderDocIcon({ icon, className }: { icon?: DocIcon; className?: string }) {
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