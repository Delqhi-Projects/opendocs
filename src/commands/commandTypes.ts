import type { BlockType, DocBlock } from "@/types/docs";

export type OpenDocsCommand =
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
      type: "docs.block.insertAfter";
      pageId: string;
      afterBlockId: string | null;
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
      type: "app.theme.set";
      theme: "light" | "dark";
    }
  | {
      type: "integration.openclaw.send";
      integrationId: string;
      to: string;
      text: string;
    }
  | {
      type: "db.row.insert";
      pageId: string;
      blockId: string;
      data: Record<string, any>;
    }
  | {
      type: "n8n.node.connect";
      pageId: string;
      blockId: string;
      sourceNodeBlockId: string;
    };

export type AgentResponse = {
  reply: string;
  commands: OpenDocsCommand[];
};
