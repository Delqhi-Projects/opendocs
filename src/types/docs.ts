export type BlockType =
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "code"
  | "table"
  | "database"
  | "workflow"
  | "draw"
  | "n8n"
  | "callout"
  | "checklist"
  | "mermaid"
  | "quote"
  | "divider"
  | "image"
  | "video"
  | "voice"
  | "link"
  | "file"
  | "aiPrompt"
  | "horizontal"
  | "automation";

import type { DatabaseBlockData } from "@/types/database";
import type { N8nBlockData } from "@/types/n8n";
import type { DocIcon } from "@/types/icons";

export type CalloutTone = "info" | "success" | "warning" | "error" | "tip";

// Re-export commonly used types
export type { N8nBlockData } from "@/types/n8n";
export type { DatabaseBlockData } from "@/types/database";
export type { DocIcon } from "@/types/icons";

export type DocBlockBase = {
  id: string;
  type: BlockType;
  locked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  layout?: "grid" | "default";
};

export type HeadingBlock = DocBlockBase & { type: "heading1" | "heading2" | "heading3"; text: string };
export type ParagraphBlock = DocBlockBase & { type: "paragraph"; text: string };
export type CodeBlock = DocBlockBase & { type: "code"; language: string; code: string };
export type QuoteBlock = DocBlockBase & { type: "quote"; text: string; caption?: string };
export type DividerBlock = DocBlockBase & { type: "divider" };
export type ImageBlock = DocBlockBase & { type: "image"; url: string; alt?: string; caption?: string };
export type VideoBlock = DocBlockBase & { type: "video"; url: string; caption?: string };
export type LinkBlock = DocBlockBase & { type: "link"; url: string; title?: string; description?: string };
export type FileBlock = DocBlockBase & { type: "file"; name: string; url?: string };
export type AiPromptResult = 
  | { status: "pending" }
  | { status: "success"; content: string }
  | { status: "error"; message: string };

export type AiPromptBlock = DocBlockBase & { 
  type: "aiPrompt"; 
  prompt: string; 
  result?: AiPromptResult;
};

export type ChecklistItem = { id: string; text: string; checked: boolean };
export type ChecklistBlock = DocBlockBase & { type: "checklist"; items: ChecklistItem[] };

export type TableCell = { id: string; value: string };
export type TableRow = { id: string; cells: TableCell[] };
export type TableBlock = DocBlockBase & {
  type: "table";
  columns: { id: string; name: string }[];
  rows: TableRow[];
};

export type DatabaseBlock = DocBlockBase & {
  type: "database";
  data: DatabaseBlockData;
};

export type WorkflowBlock = DocBlockBase & {
  type: "workflow";
  data: {
    title: string;
    nodes: { id: string; x: number; y: number; label: string; color?: string; refId?: string }[];
    edges: { id: string; source: string; target: string; label?: string }[];
  };
};

// Excalidraw types - using Record for flexibility while maintaining type safety
export type ExcalidrawElement = Record<string, unknown>;
export type ExcalidrawAppState = Record<string, unknown>;
export type ExcalidrawFiles = Record<string, unknown>;

export type DrawBlock = DocBlockBase & {
  type: "draw";
  data: {
    elements: ExcalidrawElement[];
    appState: ExcalidrawAppState;
    files: ExcalidrawFiles;
  };
};

export type N8nBlock = DocBlockBase & {
  type: "n8n";
  data: N8nBlockData;
};

export type CalloutBlock = DocBlockBase & {
  type: "callout";
  text: string;
  title?: string;
  tone: CalloutTone;
};

export type MermaidBlock = DocBlockBase & {
  type: "mermaid";
  code: string;
  caption?: string;
};

export type VoiceBlock = DocBlockBase & {
  type: "voice";
  data: {
    audioUrl?: string;
    audioData?: string;
    duration?: number;
    language?: string;
    transcription?: string;
    transcriptionConfidence?: number;
    transcriptionLanguage?: string;
    createdAt?: string;
    synthesizedAudioUrl?: string;
    synthesizedDuration?: number;
    synthesizedVoice?: string;
  };
};

export type HorizontalBlock = DocBlockBase & {
  type: "horizontal";
  blocks: DocBlock[];
};

// Re-export Automation type for use in AutomationBlock
export type { Automation, AutomationNode, AutomationEdge } from "@/types/automation";

export type AutomationBlock = DocBlockBase & {
  type: "automation";
  automation: import("@/types/automation").Automation;
};

export type DocBlock = 
  | HeadingBlock 
  | ParagraphBlock 
  | CodeBlock 
  | QuoteBlock 
  | DividerBlock 
  | ImageBlock 
  | VideoBlock 
  | VoiceBlock
  | LinkBlock 
  | FileBlock 
  | AiPromptBlock 
  | ChecklistBlock 
  | TableBlock 
  | DatabaseBlock 
  | WorkflowBlock 
  | DrawBlock
  | N8nBlock
  | CalloutBlock
  | MermaidBlock
  | HorizontalBlock
  | AutomationBlock;

// Page and Folder types
export type DocPage = {
  id: string;
  title: string;
  icon?: DocIcon;
  cover?: string;
  blocks: DocBlock[];
  createdAt: string;
  updatedAt: string;
};

export type DocFolder = {
  id: string;
  name: string;
  icon?: DocIcon;
  children: string[]; // Page IDs or subfolder IDs
  folderIds: string[]; // Subfolder IDs
  pageIds: string[]; // Page IDs
  collapsed?: boolean;
};

export type Theme = "light" | "dark";

export type DocsState = {
  folders: Record<string, DocFolder>;
  pages: Record<string, DocPage>;
  rootFolderId: string;
  selectedPageId: string | null;
  theme: Theme;
  expandedFolderIds: string[];
};
