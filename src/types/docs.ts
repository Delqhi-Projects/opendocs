/**
 * OpenDocs Core Types
 * Best Practices 2026 - Production Ready
 */

export interface Document {
  id: string;
  title: string;
  content: Block[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  collaborators: Collaborator[];
  metadata: DocumentMetadata;
}

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  metadata?: BlockMetadata;
}

export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'list'
  | 'bullet'
  | 'numbered'
  | 'checklist'
  | 'code'
  | 'image'
  | 'video'
  | 'audio'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'toggle'
  | 'comment'
  | 'voice'
  | 'automation'
  | 'table'
  | 'link'
  | 'file'
  | 'mermaid'
  | 'horizontal'
  | 'workflow'
  | 'draw'
  | 'database'
  | 'n8n'
  | 'aiPrompt';

export interface BlockMetadata {
  createdAt?: Date;
  updatedAt?: Date;
  authorId?: string;
  [key: string]: any;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  isActive: boolean;
}

export interface CursorPosition {
  line: number;
  ch: number;
}

export interface DocumentMetadata {
  tags?: string[];
  description?: string;
  coverImage?: string;
  [key: string]: any;
}

export interface Comment {
  id: string;
  documentId: string;
  blockId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  replies: CommentReply[];
  mentions: string[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  mentions: string[];
}

export interface Presence {
  userId: string;
  userName: string;
  color: string;
  cursorPosition?: CursorPosition;
  selection?: { from: number; to: number };
  lastActive: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface AutomationConfig {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationTrigger {
  type: 'document_created' | 'document_updated' | 'comment_added' | 'schedule';
  config: Record<string, any>;
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'webhook' | 'n8n_workflow';
  config: Record<string, any>;
  label: string;
  description?: string;
}

export interface DocsState {
  state: any;
  actions: any;
}

export interface DocPage {
  id: string;
  title: string;
  content: Block[];
}

export interface VoiceBlock {
  id: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  speaker?: string;
  data?: any;
}

// Specific Block Types for blockHelpers
export interface DocBlock extends Block { type: 'paragraph'; }
export interface HeadingBlock extends Block { type: 'heading' | 'heading1' | 'heading2' | 'heading3'; }
export interface ParagraphBlock extends Block { type: 'paragraph'; }
export interface CodeBlock extends Block { type: 'code'; }
export interface TableBlock extends Block { type: 'table'; }
export interface DatabaseBlock extends Block { type: 'database'; }
export interface WorkflowBlock extends Block { type: 'workflow'; }
export interface DrawBlock extends Block { type: 'draw'; }
export interface N8nBlock extends Block { type: 'n8n'; }
export interface CalloutBlock extends Block { type: 'callout'; }
export interface ChecklistBlock extends Block { type: 'checklist'; }
export interface MermaidBlock extends Block { type: 'mermaid'; }
export interface HorizontalBlock extends Block { type: 'horizontal'; }
export interface QuoteBlock extends Block { type: 'quote'; }
export interface DividerBlock extends Block { type: 'divider'; }
export interface ImageBlock extends Block { type: 'image'; }
export interface VideoBlock extends Block { type: 'video'; }
export interface LinkBlock extends Block { type: 'link'; }
export interface FileBlock extends Block { type: 'file'; }
export interface AiPromptBlock extends Block { type: 'aiPrompt'; }
export interface AutomationBlock extends Block { type: 'automation'; }
