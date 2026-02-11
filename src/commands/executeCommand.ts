import type { OpenDocsCommand } from "@/commands/commandTypes";
import { useDocsStore } from "@/store/useDocsStore";
import { openClaw } from "@/services/apiClient";
import { nanoid } from "nanoid";

export type CommandResult = { ok: true; message?: string } | { ok: false; message: string };

export async function executeOpenDocsCommand(cmd: OpenDocsCommand): Promise<CommandResult> {
  const { state, actions } = useDocsStore.getState();

  try {
    switch (cmd.type) {
      case "docs.page.create": {
        const folderId = cmd.folderId || state.rootFolderId;
        if (!state.folders?.[folderId]) return { ok: false, message: `Folder ${folderId} not found` };
        const id = actions.createPage(folderId, cmd.title);
        return { ok: true, message: `Created page ${id}` };
      }
      case "docs.page.rename": {
        actions.renamePage(cmd.pageId, cmd.title);
        return { ok: true };
      }
      case "docs.page.delete": {
        actions.deletePage(cmd.pageId);
        return { ok: true };
      }
      case "docs.page.select": {
        actions.selectPage(cmd.pageId);
        return { ok: true };
      }
      case "docs.block.insertAfter": {
        const bid = actions.addBlockAfter(cmd.pageId, cmd.afterBlockId, cmd.blockType);
        if (cmd.initial) actions.updateBlock(cmd.pageId, bid, cmd.initial as any);
        return { ok: true };
      }
      case "docs.block.update": {
        actions.updateBlock(cmd.pageId, cmd.blockId, cmd.patch);
        return { ok: true };
      }
      case "docs.block.delete": {
        actions.deleteBlock(cmd.pageId, cmd.blockId);
        return { ok: true };
      }
      case "docs.block.move": {
        actions.moveBlock(cmd.pageId, cmd.blockId, cmd.direction);
        return { ok: true };
      }
      case "docs.block.toggleLock": {
        actions.toggleBlockLock(cmd.pageId, cmd.blockId);
        return { ok: true };
      }
      case "db.row.insert": {
        const page = state.pages[cmd.pageId];
        const block = page?.blocks.find(b => b.id === cmd.blockId);
        if (block?.type === "database") {
          const nextData = { ...block.data, rows: [...block.data.rows, { id: nanoid(), cells: cmd.data }] };
          actions.updateBlock(cmd.pageId, cmd.blockId, { data: nextData } as any);
        }
        return { ok: true };
      }
      case "n8n.node.connect": {
        const page = state.pages[cmd.pageId];
        const block = page?.blocks.find(b => b.id === cmd.blockId);
        if (block?.type === "n8n") {
          const connections = [...(block.data.connections || []), cmd.sourceNodeBlockId];
          actions.updateBlock(cmd.pageId, cmd.blockId, { data: { ...block.data, connections } } as any);
        }
        return { ok: true };
      }
      case "app.theme.set": {
        actions.setTheme(cmd.theme);
        return { ok: true };
      }
      case "integration.openclaw.send": {
        const res = await openClaw.sendMessage(cmd.integrationId, { to: cmd.to, text: cmd.text });
        return { ok: true, message: `Message sent via OpenClaw: ${JSON.stringify(res)}` };
      }
      default:
        return { ok: false, message: `Unknown command type: ${(cmd as any).type}` };
    }
  } catch (e) {
    return { ok: false, message: String((e as any)?.message || e) };
  }
}
