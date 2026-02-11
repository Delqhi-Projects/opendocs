import { nanoid } from "nanoid";
import type { DocsState, DocFolder, DocPage, DocBlock } from "@/types/docs";

function now() {
  return new Date().toISOString();
}

function page(title: string, blocks: DocBlock[]): DocPage {
  return { id: nanoid(), title, blocks, updatedAt: now() };
}

export function createDefaultState(): DocsState {
  const rootFolderId = nanoid();

  const welcome = page("Welcome to OpenDocs", [
    { id: nanoid(), type: "heading1", text: "OpenDocs" },
    {
      id: nanoid(),
      type: "callout",
      tone: "info",
      title: "Quick start",
      text: "Use the left sidebar to create pages. Use / inside a paragraph to insert blocks. Use Cmd/Ctrl+K for command palette. Use the AI panel to generate docs.",
    },
    {
      id: nanoid(),
      type: "paragraph",
      text: "Goal: Build docs that are ultra-simple, step-by-step, and editable. This is a local-first editor with optional Supabase sync.",
    },
  ]);

  const pages: Record<string, DocPage> = { [welcome.id]: welcome };

  const root: DocFolder = {
    id: rootFolderId,
    name: "OpenDocs",
    folderIds: [],
    pageIds: [welcome.id],
  };

  const folders: Record<string, DocFolder> = { [rootFolderId]: root };

  return {
    rootFolderId,
    folders,
    pages,
    selectedPageId: welcome.id,
    expandedFolderIds: { [rootFolderId]: true },
    theme: "light",
  };
}
