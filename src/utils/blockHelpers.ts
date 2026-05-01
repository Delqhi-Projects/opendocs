/**
 * Type-safe Block Update Utilities - Best Practices 2026
 */

import type { Block, BlockType } from "@/types/docs";

export function isBlockType(block: Block, type: BlockType): boolean {
  return block.type === type;
}

export function isHeading(block: Block): boolean {
  return block.type.includes('heading');
}

export function isList(block: Block): boolean {
  return block.type === 'list' || block.type === 'checklist';
}

export function isMedia(block: Block): boolean {
  return block.type === 'image' || block.type === 'video' ;
}

export function isCode(block: Block): boolean {
  return block.type === 'code' || block.type === 'mermaid';
}

export function isLayout(block: Block): boolean {
  return block.type === 'horizontal' || block.type === 'divider';
}

export function isInteractive(block: Block): boolean {
  return block.type === 'automation' || block.type === 'workflow' || block.type === 'n8n' || block.type === 'database';
}

export function isContent(block: Block): boolean {
  return !isLayout(block) && !isInteractive(block);
}

export function getBlockCategory(block: Block): string {
  if (isHeading(block)) return 'heading';
  if (isList(block)) return 'list';
  if (isMedia(block)) return 'media';
  if (isCode(block)) return 'code';
  if (isLayout(block)) return 'layout';
  if (isInteractive(block)) return 'interactive';
  return 'content';
}

export function createBlock(type: BlockType, content: any = {}): Block {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

export function updateBlock(block: Block, updates: Partial<Block>): Block {
  return {
    ...block,
    ...updates,
    metadata: {
      ...block.metadata,
      updatedAt: new Date(),
    },
  };
}

export function deleteBlock(blocks: Block[], blockId: string): Block[] {
  return blocks.filter(b => b.id !== blockId);
}

export function insertBlock(blocks: Block[], block: Block, index: number): Block[] {
  const newBlocks = [...blocks];
  newBlocks.splice(index, 0, block);
  return newBlocks;
}

export function moveBlock(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const newBlocks = [...blocks];
  const [removed] = newBlocks.splice(fromIndex, 1);
  newBlocks.splice(toIndex, 0, removed);
  return newBlocks;
}

export function duplicateBlock(blocks: Block[], blockId: string): Block[] {
  const blockIndex = blocks.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return blocks;
  
  const block = blocks[blockIndex];
  const duplicate: Block = {
    ...block,
    id: crypto.randomUUID(),
    metadata: {
      ...block.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
  
  return insertBlock(blocks, duplicate, blockIndex + 1);
}

export function serializeBlock(block: Block): string {
  return JSON.stringify(block, null, 2);
}

export function deserializeBlock(json: string): Block {
  return JSON.parse(json);
}

export function cloneBlock(block: Block): Block {
  return JSON.parse(JSON.stringify(block));
}

export function isEmptyBlock(block: Block): boolean {
  if (!block.content) return true;
  if (typeof block.content === 'string') return block.content.trim() === '';
  if (Array.isArray(block.content)) return block.content.length === 0;
  if (typeof block.content === 'object') return Object.keys(block.content).length === 0;
  return false;
}

export function getBlockText(block: Block): string {
  if (typeof block.content === 'string') return block.content;
  if (block.content?.text) return block.content.text;
  if (block.content?.code) return block.content.code;
  return '';
}

export function setBlockText(block: Block, text: string): Block {
  if (typeof block.content === 'string') {
    return { ...block, content: text };
  }
  if (block.content && typeof block.content === 'object') {
    return {
      ...block,
      content: { ...block.content, text },
    };
  }
  return { ...block, content: text };
}

export default {
  isBlockType,
  isHeading,
  isList,
  isMedia,
  isCode,
  isLayout,
  isInteractive,
  isContent,
  getBlockCategory,
  createBlock,
  updateBlock,
  deleteBlock,
  insertBlock,
  moveBlock,
  duplicateBlock,
  serializeBlock,
  deserializeBlock,
  cloneBlock,
  isEmptyBlock,
  getBlockText,
  setBlockText,
};
