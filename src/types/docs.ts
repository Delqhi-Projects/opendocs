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
  | "link"
  | "file"
  | "aiPrompt"
  | "horizontal"
  | "automation";

import type { DatabaseBlockData } from "@/types/database";
import type { N8nBlockData } from "@/types/n8n";

export type CalloutTone = "info" | "success" | "warning" | "error" | "tip";

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
export type AiPromptBlock = DocBlockBase & { type: "aiPrompt"; prompt: string; result?: any };

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

export type DrawBlock = DocBlockBase & {
  type: "draw";
  data: {
    elements: any[];
    appState: any;
    files: any;
  };
};

export type N8nBlock = DocBlockBase & {
  type: "n8n";
  data: N8nBlockData;
};

export type CalloutBlock = DocBlockBase & { type: "callout"; tone: CalloutTone; title?: string; text: string };
export type MermaidBlock = DocBlockBase & { type: "mermaid"; code: string };
export type HorizontalBlock = DocBlockBase & { type: "horizontal"; blocks: DocBlock[] };

import type { Automation } from "./automation";
export type AutomationBlock = DocBlockBase & { type: "automation"; automation: Automation };

export type DocBlock =
  | HeadingBlock
  | ParagraphBlock
  | CodeBlock
  | TableBlock
  | DatabaseBlock
  | WorkflowBlock
  | DrawBlock
  | N8nBlock
  | CalloutBlock
  | ChecklistBlock
  | MermaidBlock
  | HorizontalBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock
  | VideoBlock
  | LinkBlock
  | FileBlock
  | AiPromptBlock
  | AutomationBlock;

import type { DocIcon } from "@/types/icons";

export type DocPage = {
  id: string;
  title: string;
  icon?: DocIcon;
  cover?: string;
  blocks: DocBlock[];
  updatedAt: string;
};

export type DocFolder = {
  id: string;
  name: string;
  icon?: DocIcon;
  folderIds: string[];
  pageIds: string[];
};

export type DocsState = {
  rootFolderId: string;
  folders: Record<string, DocFolder>;
  pages: Record<string, DocPage>;
  selectedPageId?: string;
  expandedFolderIds: Record<string, boolean>;
  theme: "light" | "dark";
};
