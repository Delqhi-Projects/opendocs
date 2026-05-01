/**
 * Type-safe Block Update Utilities - Best Practices 2026
 * Eliminates the need for `as any` casts when updating blocks
 */

import type {
  DocBlock,
  HeadingBlock,
  ParagraphBlock,
  CodeBlock,
  TableBlock,
  DatabaseBlock,
  WorkflowBlock,
  DrawBlock,
  N8nBlock,
  CalloutBlock,
  ChecklistBlock,
  MermaidBlock,
  HorizontalBlock,
  QuoteBlock,
  DividerBlock,
  ImageBlock,
  VideoBlock,
  LinkBlock,
  FileBlock,
  AiPromptBlock,
  AutomationBlock,
  BlockType,
} from "@/types/docs";

// Type-safe partial update types for each block type
export type HeadingBlockUpdate = Partial<Omit<HeadingBlock, "id" | "type">>;
export type ParagraphBlockUpdate = Partial<Omit<ParagraphBlock, "id" | "type">>;
export type CodeBlockUpdate = Partial<Omit<CodeBlock, "id" | "type">>;
export type TableBlockUpdate = Partial<Omit<TableBlock, "id" | "type">>;
export type DatabaseBlockUpdate = Partial<Omit<DatabaseBlock, "id" | "type">>;
export type WorkflowBlockUpdate = Partial<Omit<WorkflowBlock, "id" | "type">>;
export type DrawBlockUpdate = Partial<Omit<DrawBlock, "id" | "type">>;
export type N8nBlockUpdate = Partial<Omit<N8nBlock, "id" | "type">>;
export type CalloutBlockUpdate = Partial<Omit<CalloutBlock, "id" | "type">>;
export type ChecklistBlockUpdate = Partial<Omit<ChecklistBlock, "id" | "type">>;
export type MermaidBlockUpdate = Partial<Omit<MermaidBlock, "id" | "type">>;
export type HorizontalBlockUpdate = Partial<Omit<HorizontalBlock, "id" | "type">>;
export type QuoteBlockUpdate = Partial<Omit<QuoteBlock, "id" | "type">>;
export type DividerBlockUpdate = Partial<Omit<DividerBlock, "id" | "type">>;
export type ImageBlockUpdate = Partial<Omit<ImageBlock, "id" | "type">>;
export type VideoBlockUpdate = Partial<Omit<VideoBlock, "id" | "type">>;
export type LinkBlockUpdate = Partial<Omit<LinkBlock, "id" | "type">>;
export type FileBlockUpdate = Partial<Omit<FileBlock, "id" | "type">>;
export type AiPromptBlockUpdate = Partial<Omit<AiPromptBlock, "id" | "type">>;
export type AutomationBlockUpdate = Partial<Omit<AutomationBlock, "id" | "type">>;

// Union type for all block updates
export type BlockUpdate =
  | { type: "heading1" | "heading2" | "heading3"; update: HeadingBlockUpdate }
  | { type: "paragraph"; update: ParagraphBlockUpdate }
  | { type: "code"; update: CodeBlockUpdate }
  | { type: "table"; update: TableBlockUpdate }
  | { type: "database"; update: DatabaseBlockUpdate }
  | { type: "workflow"; update: WorkflowBlockUpdate }
  | { type: "draw"; update: DrawBlockUpdate }
  | { type: "n8n"; update: N8nBlockUpdate }
  | { type: "callout"; update: CalloutBlockUpdate }
  | { type: "checklist"; update: ChecklistBlockUpdate }
  | { type: "mermaid"; update: MermaidBlockUpdate }
  | { type: "horizontal"; update: HorizontalBlockUpdate }
  | { type: "quote"; update: QuoteBlockUpdate }
  | { type: "divider"; update: DividerBlockUpdate }
  | { type: "image"; update: ImageBlockUpdate }
  | { type: "video"; update: VideoBlockUpdate }
  | { type: "link"; update: LinkBlockUpdate }
  | { type: "file"; update: FileBlockUpdate }
  | { type: "aiPrompt"; update: AiPromptBlockUpdate }
  | { type: "automation"; update: AutomationBlockUpdate };

/**
 * Type-safe block update function
 * Returns a properly typed partial block for the given block type
 */
export function createBlockPatch<T extends BlockType>(
  blockType: T,
  patch: Extract<BlockUpdate, { type: T }>["update"]
): Partial<DocBlock> {
  return { ...patch, type: blockType } as Partial<DocBlock>;
}

/**
 * Type guard helpers for block types
 */
export function isHeadingBlock(block: DocBlock): block is HeadingBlock {
  return block.type === "heading1" || block.type === "heading2" || block.type === "heading3";
}

export function isParagraphBlock(block: DocBlock): block is ParagraphBlock {
  return block.type === "paragraph";
}

export function isCodeBlock(block: DocBlock): block is CodeBlock {
  return block.type === "code";
}

export function isTableBlock(block: DocBlock): block is TableBlock {
  return block.type === "table";
}

export function isDatabaseBlock(block: DocBlock): block is DatabaseBlock {
  return block.type === "database";
}

export function isWorkflowBlock(block: DocBlock): block is WorkflowBlock {
  return block.type === "workflow";
}

export function isDrawBlock(block: DocBlock): block is DrawBlock {
  return block.type === "draw";
}

export function isN8nBlock(block: DocBlock): block is N8nBlock {
  return block.type === "n8n";
}

export function isCalloutBlock(block: DocBlock): block is CalloutBlock {
  return block.type === "callout";
}

export function isChecklistBlock(block: DocBlock): block is ChecklistBlock {
  return block.type === "checklist";
}

export function isMermaidBlock(block: DocBlock): block is MermaidBlock {
  return block.type === "mermaid";
}

export function isHorizontalBlock(block: DocBlock): block is HorizontalBlock {
  return block.type === "horizontal";
}

export function isQuoteBlock(block: DocBlock): block is QuoteBlock {
  return block.type === "quote";
}

export function isDividerBlock(block: DocBlock): block is DividerBlock {
  return block.type === "divider";
}

export function isImageBlock(block: DocBlock): block is ImageBlock {
  return block.type === "image";
}

export function isVideoBlock(block: DocBlock): block is VideoBlock {
  return block.type === "video";
}

export function isLinkBlock(block: DocBlock): block is LinkBlock {
  return block.type === "link";
}

export function isFileBlock(block: DocBlock): block is FileBlock {
  return block.type === "file";
}

export function isAiPromptBlock(block: DocBlock): block is AiPromptBlock {
  return block.type === "aiPrompt";
}

export function isAutomationBlock(block: DocBlock): block is AutomationBlock {
  return block.type === "automation";
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

/**
 * Special block update markers for internal operations
 */
export interface ConvertToDatabaseMarker {
  __convertToDatabase: true;
}

/**
 * Type guard to check if a patch contains the convert-to-database marker
 */
export function hasConvertToDatabaseMarker(
  patch: unknown
): patch is ConvertToDatabaseMarker {
  return (
    typeof patch === "object" &&
    patch !== null &&
    "__convertToDatabase" in patch &&
    (patch as ConvertToDatabaseMarker).__convertToDatabase === true
  );
}

/**
 * Type for block update patch that may contain special markers
 */
export type BlockUpdatePatch = Partial<DocBlock> | ConvertToDatabaseMarker;

/**
 * Valid block types that can be added via slash menu
 */
export const VALID_BLOCK_TYPES: readonly BlockType[] = [
  "paragraph",
  "heading1",
  "heading2",
  "heading3",
  "quote",
  "code",
  "callout",
  "table",
  "checklist",
  "divider",
  "image",
  "video",
  "link",
  "file",
  "mermaid",
  "horizontal",
  "workflow",
  "draw",
  "database",
  "n8n",
  "aiPrompt",
  "automation",
] as const;

/**
 * Check if a string is a valid block type
 */
export function isValidBlockType(type: string): type is BlockType {
  return VALID_BLOCK_TYPES.includes(type as BlockType);
}

/**
 * Safely cast a string to BlockType if valid, or return undefined
 */
export function toBlockType(type: string): BlockType | undefined {
  return isValidBlockType(type) ? type : undefined;
}
