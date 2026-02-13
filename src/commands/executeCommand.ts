import type { OpenDocsCommand } from "@/commands/commandTypes";
import type { DocBlock } from "@/types/docs";
import { useDocsStore } from "@/store/useDocsStore";
import { openClaw } from "@/services/apiClient";
import { nanoid } from "nanoid";
import { getErrorMessage } from "@/utils/blockHelpers";

export type CommandResult = { ok: true; message?: string } | { ok: false; message: string };

/**
 * Execute an OpenDocs command with full validation.
 * 
 * Best Practices 2026:
 * - All commands validate inputs before execution
 * - All commands return descriptive success/error messages
 * - All commands are type-safe with exhaustive switch checking
 * 
 * @param cmd - The command to execute
 * @returns CommandResult indicating success or failure with a message
 */
export async function executeOpenDocsCommand(cmd: OpenDocsCommand): Promise<CommandResult> {
  const { state, actions } = useDocsStore.getState();

  // ==================== VALIDATION HELPERS ====================
  
  /** Validate that a page exists */
  const validatePage = (pageId: string): { valid: boolean; message?: string } => {
    if (!pageId) return { valid: false, message: "pageId is required" };
    if (!state.pages[pageId]) return { valid: false, message: `Page "${pageId}" not found` };
    return { valid: true };
  };

  /** Validate that a folder exists */
  const validateFolder = (folderId: string): { valid: boolean; message?: string } => {
    if (!folderId) return { valid: false, message: "folderId is required" };
    if (!state.folders?.[folderId]) return { valid: false, message: `Folder "${folderId}" not found` };
    return { valid: true };
  };

  /** Validate that a block exists in a page */
  const validateBlock = (
    pageId: string, 
    blockId: string
  ): { valid: boolean; message?: string; block?: DocBlock } => {
    const pageValid = validatePage(pageId);
    if (!pageValid.valid) return pageValid;
    
    if (!blockId) return { valid: false, message: "blockId is required" };
    
    const block = state.pages[pageId].blocks.find((b) => b.id === blockId);
    if (!block) return { valid: false, message: `Block "${blockId}" not found in page "${pageId}"` };
    
    return { valid: true, block };
  };

  /** Find the folder containing a page */
  const findPageFolder = (pageId: string): string | null => {
    for (const [folderId, folder] of Object.entries(state.folders)) {
      if (folder.pageIds.includes(pageId)) {
        return folderId;
      }
    }
    return null;
  };

  // ==================== COMMAND EXECUTION ====================

  try {
    switch (cmd.type) {
      // ==================== PAGE COMMANDS ====================
      
      case "docs.page.create": {
        const folderId = cmd.folderId || state.rootFolderId;
        const folderValid = validateFolder(folderId);
        if (!folderValid.valid) return { ok: false, message: folderValid.message! };
        
        if (!cmd.title?.trim()) {
          return { ok: false, message: "Title is required and cannot be empty" };
        }
        
        const id = actions.createPage(folderId, cmd.title.trim());
        return { ok: true, message: `Created page "${cmd.title}" with ID ${id} in folder ${folderId}` };
      }

      case "docs.page.rename": {
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        if (!cmd.title?.trim()) {
          return { ok: false, message: "Title is required and cannot be empty" };
        }
        
        const oldTitle = state.pages[cmd.pageId].title;
        actions.renamePage(cmd.pageId, cmd.title.trim());
        return { ok: true, message: `Renamed page "${oldTitle}" to "${cmd.title}"` };
      }

      case "docs.page.delete": {
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        const title = state.pages[cmd.pageId].title;
        actions.deletePage(cmd.pageId);
        return { ok: true, message: `Deleted page "${title}" (${cmd.pageId})` };
      }

      case "docs.page.select": {
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        actions.selectPage(cmd.pageId);
        return { ok: true, message: `Selected page "${state.pages[cmd.pageId].title}" (${cmd.pageId})` };
      }

      case "docs.page.move": {
        // Validate page exists
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        // Validate target folder exists
        const folderValid = validateFolder(cmd.targetFolderId);
        if (!folderValid.valid) return { ok: false, message: folderValid.message! };
        
        // Find current folder
        const currentFolderId = findPageFolder(cmd.pageId);
        if (!currentFolderId) {
          return { ok: false, message: `Page ${cmd.pageId} is not in any folder` };
        }
        
        if (currentFolderId === cmd.targetFolderId) {
          return { ok: true, message: `Page is already in target folder` };
        }
        
        // Note: This requires additional store action - mark as not implemented
        return { 
          ok: false, 
          message: `Move page action not yet implemented. Would move from ${currentFolderId} to ${cmd.targetFolderId}` 
        };
      }

      case "docs.page.duplicate": {
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        // Note: This requires additional store action - mark as not implemented
        return { 
          ok: false, 
          message: `Duplicate page action not yet implemented. Would duplicate "${state.pages[cmd.pageId].title}"` 
        };
      }

      // ==================== FOLDER COMMANDS ====================
      
      case "docs.folder.create": {
        if (!cmd.name?.trim()) {
          return { ok: false, message: "Folder name is required and cannot be empty" };
        }
        
        const parentFolderId = cmd.parentFolderId || state.rootFolderId;
        const parentValid = validateFolder(parentFolderId);
        if (!parentValid.valid) return { ok: false, message: parentValid.message! };
        
        const folderId = actions.createFolder(parentFolderId, cmd.name.trim());
        return { ok: true, message: `Created folder "${cmd.name}" with ID ${folderId}` };
      }

      case "docs.folder.delete": {
        const folderValid = validateFolder(cmd.folderId);
        if (!folderValid.valid) return { ok: false, message: folderValid.message! };
        
        if (cmd.folderId === state.rootFolderId) {
          return { ok: false, message: "Cannot delete root folder" };
        }
        
        const folder = state.folders[cmd.folderId];
        if (folder.pageIds.length > 0 || folder.folderIds.length > 0) {
          return { ok: false, message: `Folder "${folder.name}" is not empty. Delete contents first.` };
        }
        
        actions.deleteFolder(cmd.folderId);
        return { ok: true, message: `Deleted folder "${folder.name}" (${cmd.folderId})` };
      }

      case "docs.folder.rename": {
        const folderValid = validateFolder(cmd.folderId);
        if (!folderValid.valid) return { ok: false, message: folderValid.message! };
        
        if (!cmd.name?.trim()) {
          return { ok: false, message: "Folder name is required and cannot be empty" };
        }
        
        const oldName = state.folders[cmd.folderId].name;
        actions.renameFolder(cmd.folderId, cmd.name.trim());
        return { ok: true, message: `Renamed folder "${oldName}" to "${cmd.name}"` };
      }

      // ==================== BLOCK COMMANDS ====================
      
      case "docs.block.insertAfter": {
        const pageValid = validatePage(cmd.pageId);
        if (!pageValid.valid) return { ok: false, message: pageValid.message! };
        
        if (!cmd.blockType) {
          return { ok: false, message: "blockType is required" };
        }
        
        const bid = actions.addBlockAfter(cmd.pageId, cmd.afterBlockId, cmd.blockType);
        if (cmd.initial) {
          actions.updateBlock(cmd.pageId, bid, cmd.initial);
        }
        return { 
          ok: true, 
          message: `Inserted ${cmd.blockType} block (${bid}) ${cmd.afterBlockId ? `after ${cmd.afterBlockId}` : "at start"}` 
        };
      }

      case "docs.block.insertBefore": {
        const blockValid = validateBlock(cmd.pageId, cmd.beforeBlockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (!cmd.blockType) {
          return { ok: false, message: "blockType is required" };
        }
        
        // Note: addBlockBefore not available in store - implement via reorder
        const page = state.pages[cmd.pageId];
        const blockIndex = page.blocks.findIndex((b) => b.id === cmd.beforeBlockId);
        
        // Add block at end, then reorder to position
        const bid = actions.addBlockAfter(cmd.pageId, null, cmd.blockType);
        if (cmd.initial) {
          actions.updateBlock(cmd.pageId, bid, cmd.initial);
        }
        
        // Reorder to correct position (move to before the target block)
        const newBlockIndex = page.blocks.length; // New block is at end
        actions.reorderBlocks(cmd.pageId, newBlockIndex, blockIndex);
        
        return { ok: true, message: `Inserted ${cmd.blockType} block (${bid}) before ${cmd.beforeBlockId}` };
      }

      case "docs.block.update": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (!cmd.patch || Object.keys(cmd.patch).length === 0) {
          return { ok: false, message: "patch is required and cannot be empty" };
        }
        
        actions.updateBlock(cmd.pageId, cmd.blockId, cmd.patch);
        return { ok: true, message: `Updated block ${cmd.blockId}` };
      }

      case "docs.block.delete": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        actions.deleteBlock(cmd.pageId, cmd.blockId);
        return { ok: true, message: `Deleted block ${cmd.blockId}` };
      }

      case "docs.block.move": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (!["up", "down"].includes(cmd.direction)) {
          return { ok: false, message: "direction must be 'up' or 'down'" };
        }
        
        actions.moveBlock(cmd.pageId, cmd.blockId, cmd.direction);
        return { ok: true, message: `Moved block ${cmd.blockId} ${cmd.direction}` };
      }

      case "docs.block.toggleLock": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        actions.toggleBlockLock(cmd.pageId, cmd.blockId);
        // Re-check state after toggle
        const block = state.pages[cmd.pageId].blocks.find((b) => b.id === cmd.blockId);
        const isLocked = block?.locked ? "locked" : "unlocked";
        return { ok: true, message: `Block ${cmd.blockId} is now ${isLocked}` };
      }

      case "docs.block.duplicate": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        const block = blockValid.block!;
        
        // Duplicate by inserting a copy after the original
        const newBlockId = actions.addBlockAfter(cmd.pageId, cmd.blockId, block.type);
        const blockCopy = { ...block, id: newBlockId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        // Remove id from the patch to avoid overwriting
        const { id: _, ...patch } = blockCopy;
        actions.updateBlock(cmd.pageId, newBlockId, patch);
        
        return { ok: true, message: `Duplicated block ${cmd.blockId} as ${newBlockId}` };
      }

      // ==================== APP COMMANDS ====================
      
      case "app.theme.set": {
        if (!["light", "dark"].includes(cmd.theme)) {
          return { ok: false, message: "theme must be 'light' or 'dark'" };
        }
        
        actions.setTheme(cmd.theme);
        return { ok: true, message: `Set theme to ${cmd.theme}` };
      }

      // ==================== INTEGRATION COMMANDS ====================
      
      case "integration.openclaw.send": {
        if (!cmd.integrationId?.trim()) {
          return { ok: false, message: "integrationId is required" };
        }
        if (!cmd.to?.trim()) {
          return { ok: false, message: "recipient (to) is required" };
        }
        if (!cmd.text?.trim()) {
          return { ok: false, message: "message text is required" };
        }
        
        const res = await openClaw.sendMessage(cmd.integrationId, { to: cmd.to, text: cmd.text });
        return { ok: true, message: `Message sent via OpenClaw: ${JSON.stringify(res)}` };
      }

      // ==================== DATABASE COMMANDS ====================
      
      case "db.row.insert": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (blockValid.block!.type !== "database") {
          return { ok: false, message: `Block ${cmd.blockId} is not a database block (type: ${blockValid.block!.type})` };
        }
        
        if (!cmd.data || typeof cmd.data !== "object") {
          return { ok: false, message: "data must be a non-null object" };
        }
        
        const dbBlock = blockValid.block as import("@/types/docs").DatabaseBlock;
        const newRow = { id: nanoid(), cells: cmd.data };
        const nextData = { 
          ...dbBlock.data, 
          rows: [...dbBlock.data.rows, newRow] 
        };
        actions.updateBlock(cmd.pageId, cmd.blockId, { data: nextData } as Partial<DocBlock>);
        return { ok: true, message: `Inserted row ${newRow.id} into database block ${cmd.blockId}` };
      }

      case "db.row.delete": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (blockValid.block!.type !== "database") {
          return { ok: false, message: `Block ${cmd.blockId} is not a database block` };
        }
        
        if (!cmd.rowId?.trim()) {
          return { ok: false, message: "rowId is required" };
        }
        
        const dbBlock = blockValid.block as import("@/types/docs").DatabaseBlock;
        const rowIndex = dbBlock.data.rows.findIndex((r) => r.id === cmd.rowId);
        if (rowIndex === -1) {
          return { ok: false, message: `Row "${cmd.rowId}" not found in database block ${cmd.blockId}` };
        }
        
        const nextData = {
          ...dbBlock.data,
          rows: dbBlock.data.rows.filter((r) => r.id !== cmd.rowId)
        };
        actions.updateBlock(cmd.pageId, cmd.blockId, { data: nextData } as Partial<DocBlock>);
        return { ok: true, message: `Deleted row ${cmd.rowId} from database block ${cmd.blockId}` };
      }

      case "db.row.update": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (blockValid.block!.type !== "database") {
          return { ok: false, message: `Block ${cmd.blockId} is not a database block` };
        }
        
        if (!cmd.rowId?.trim()) {
          return { ok: false, message: "rowId is required" };
        }
        
        if (!cmd.data || typeof cmd.data !== "object") {
          return { ok: false, message: "data must be a non-null object" };
        }
        
        const dbBlock = blockValid.block as import("@/types/docs").DatabaseBlock;
        const rowIndex = dbBlock.data.rows.findIndex((r) => r.id === cmd.rowId);
        if (rowIndex === -1) {
          return { ok: false, message: `Row "${cmd.rowId}" not found in database block ${cmd.blockId}` };
        }
        
        const nextRows = dbBlock.data.rows.map((r) => 
          r.id === cmd.rowId ? { ...r, cells: { ...r.cells, ...cmd.data } } : r
        );
        const nextData = { ...dbBlock.data, rows: nextRows };
        actions.updateBlock(cmd.pageId, cmd.blockId, { data: nextData } as Partial<DocBlock>);
        return { ok: true, message: `Updated row ${cmd.rowId} in database block ${cmd.blockId}` };
      }

      // ==================== N8N COMMANDS ====================
      
      case "n8n.node.connect": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (blockValid.block!.type !== "n8n") {
          return { ok: false, message: `Block ${cmd.blockId} is not an n8n block (type: ${blockValid.block!.type})` };
        }
        
        if (!cmd.sourceNodeBlockId?.trim()) {
          return { ok: false, message: "sourceNodeBlockId is required" };
        }
        
        const n8nBlock = blockValid.block as import("@/types/docs").N8nBlock;
        const connections = [...(n8nBlock.data.connections || []), cmd.sourceNodeBlockId];
        actions.updateBlock(cmd.pageId, cmd.blockId, { data: { ...n8nBlock.data, connections } } as Partial<DocBlock>);
        return { ok: true, message: `Connected node ${cmd.sourceNodeBlockId} to n8n block ${cmd.blockId}` };
      }

      case "n8n.node.disconnect": {
        const blockValid = validateBlock(cmd.pageId, cmd.blockId);
        if (!blockValid.valid) return { ok: false, message: blockValid.message! };
        
        if (blockValid.block!.type !== "n8n") {
          return { ok: false, message: `Block ${cmd.blockId} is not an n8n block` };
        }
        
        if (!cmd.sourceNodeBlockId?.trim()) {
          return { ok: false, message: "sourceNodeBlockId is required" };
        }
        
        const n8nBlock = blockValid.block as import("@/types/docs").N8nBlock;
        const connections = (n8nBlock.data.connections || []).filter((id) => id !== cmd.sourceNodeBlockId);
        actions.updateBlock(cmd.pageId, cmd.blockId, { data: { ...n8nBlock.data, connections } } as Partial<DocBlock>);
        return { ok: true, message: `Disconnected node ${cmd.sourceNodeBlockId} from n8n block ${cmd.blockId}` };
      }

      default: {
        // Exhaustive type check - this should never be reached if all cases are handled
        const exhaustiveCheck: never = cmd;
        return { ok: false, message: `Unknown command type: ${JSON.stringify(exhaustiveCheck)}` };
      }
    }
  } catch (e) {
    return { ok: false, message: `Command execution failed: ${getErrorMessage(e)}` };
  }
}
