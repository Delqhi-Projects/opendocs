import type { BlockType, DocBlock } from "@/types/docs";

export type OpenDocsCommand =
  // Page Commands
  | {
      type: "docs.page.create";
      folderId?: string;
      title: string;
    }
  | {
      type: "docs.page.rename";
      pageId: string;
      title: string;
    }
  | {
      type: "docs.page.delete";
      pageId: string;
    }
  | {
      type: "docs.page.select";
      pageId: string;
    }
  | {
      type: "docs.page.move";
      pageId: string;
      targetFolderId: string;
    }
  | {
      type: "docs.page.duplicate";
      pageId: string;
      title?: string;
    }
  // Folder Commands
  | {
      type: "docs.folder.create";
      parentFolderId?: string;
      name: string;
    }
  | {
      type: "docs.folder.delete";
      folderId: string;
    }
  | {
      type: "docs.folder.rename";
      folderId: string;
      name: string;
    }
  // Block Commands
  | {
      type: "docs.block.insertAfter";
      pageId: string;
      afterBlockId: string | null;
      blockType: BlockType;
      initial?: Partial<DocBlock>;
    }
  | {
      type: "docs.block.insertBefore";
      pageId: string;
      beforeBlockId: string;
      blockType: BlockType;
      initial?: Partial<DocBlock>;
    }
  | {
      type: "docs.block.update";
      pageId: string;
      blockId: string;
      patch: Partial<DocBlock>;
    }
  | {
      type: "docs.block.delete";
      pageId: string;
      blockId: string;
    }
  | {
      type: "docs.block.move";
      pageId: string;
      blockId: string;
      direction: "up" | "down";
    }
  | {
      type: "docs.block.toggleLock";
      pageId: string;
      blockId: string;
    }
  | {
      type: "docs.block.duplicate";
      pageId: string;
      blockId: string;
    }
  // App Commands
  | {
      type: "app.theme.set";
      theme: "light" | "dark";
    }
  // Integration Commands
  | {
      type: "integration.openclaw.send";
      integrationId: string;
      to: string;
      text: string;
    }
  // Database Commands
  | {
      type: "db.row.insert";
      pageId: string;
      blockId: string;
      data: Record<string, unknown>;
    }
  | {
      type: "db.row.delete";
      pageId: string;
      blockId: string;
      rowId: string;
    }
  | {
      type: "db.row.update";
      pageId: string;
      blockId: string;
      rowId: string;
      data: Record<string, unknown>;
    }
  // N8N Commands
  | {
      type: "n8n.node.connect";
      pageId: string;
      blockId: string;
      sourceNodeBlockId: string;
    }
  | {
      type: "n8n.node.disconnect";
      pageId: string;
      blockId: string;
      sourceNodeBlockId: string;
    };

export type AgentResponse = {
  reply: string;
  commands: OpenDocsCommand[];
};
