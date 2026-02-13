import { useMemo, useState } from "react";
import { useDocsStore } from "@/store/useDocsStore";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { SlashMenu } from "@/components/SlashMenu";
import { PageHeader } from "@/components/PageHeader";
import type { BlockType, DocBlock, HeadingBlock } from "@/types/docs";
import { Sparkles, Grid3X3 } from "lucide-react";
import { hasConvertToDatabaseMarker, isValidBlockType } from "@/utils/blockHelpers";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function groupBlocksForLayout(blocks: DocBlock[]): (DocBlock | DocBlock[])[] {
  const groups: (DocBlock | DocBlock[])[] = [];
  let currentGrid: DocBlock[] = [];
  
  for (const block of blocks) {
    if (block.layout === "grid") {
      currentGrid.push(block);
    } else {
      if (currentGrid.length > 0) {
        groups.push([...currentGrid]);
        currentGrid = [];
      }
      groups.push(block);
    }
  }
  
  if (currentGrid.length > 0) {
    groups.push(currentGrid);
  }
  
  return groups;
}

export function Editor() {
  const { state, actions } = useDocsStore();
  const page = state.selectedPageId ? state.pages[state.selectedPageId] : undefined;
  const dark = state.theme === "dark";

  const [slashBlockId, setSlashBlockId] = useState<string | null>(null);

  const blocks = page?.blocks ?? [];

  const slashIndex = useMemo(() => {
    if (!slashBlockId) return -1;
    return blocks.findIndex((b) => b.id === slashBlockId);
  }, [blocks, slashBlockId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1 || !page) return;
    actions.reorderBlocks(page.id, oldIndex, newIndex);
  }

  if (!page) {
    return (
      <div className="p-10 text-sm text-zinc-600 dark:text-zinc-300">
        No page selected.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {(() => {
              const grouped = groupBlocksForLayout(blocks);
              let blockIndex = 0;
              
              return grouped.map((group, groupIdx) => {
                if (Array.isArray(group)) {
                  const gridItems = group;
                  const result = (
                    <div key={`grid-${groupIdx}`} className="grid grid-cols-2 gap-4">
                      {gridItems.map((b) => {
                        const idx = blockIndex++;
                        return (
                          <div key={b.id} className="min-w-0">
                            <BlockRenderer
                              block={b}
                              dark={dark}
                              dragId={b.id}
                              onUpdate={(patch) => {
                                if (hasConvertToDatabaseMarker(patch)) {
                                  actions.convertTableToDatabase(page.id, b.id);
                                  return;
                                }
                                actions.updateBlock(page.id, b.id, patch);
                              }}
                              onDelete={() => actions.deleteBlock(page.id, b.id)}
                              onMove={(dir) => actions.moveBlock(page.id, b.id, dir)}
                              onToggleLock={() => actions.toggleBlockLock(page.id, b.id)}
                              onSlash={() => setSlashBlockId(b.id)}
                              onAddBlock={(type) => {
                                if (type === "grid") {
                                  actions.addBlockAfter(page.id, b.id, "paragraph", { layout: "grid" });
                                } else if (isValidBlockType(type)) {
                                  actions.addBlockAfter(page.id, b.id, type);
                                }
                              }}
                            />
                            {slashIndex === idx && (
                              <SlashMenu
                                onClose={() => setSlashBlockId(null)}
                                onSelect={(t: BlockType) => {
                                  const id = actions.addBlockAfter(page.id, b.id, t);
                                  if (t === "heading2") actions.updateBlock(page.id, id, { text: "New section" } as Partial<HeadingBlock>);
                                  setSlashBlockId(null);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                  return result;
                } else {
                  const b = group;
                  const idx = blockIndex++;
                  return (
                    <div key={b.id}>
                      <BlockRenderer
                        block={b}
                        dark={dark}
                        dragId={b.id}
                        onUpdate={(patch) => {
                          if (hasConvertToDatabaseMarker(patch)) {
                            actions.convertTableToDatabase(page.id, b.id);
                            return;
                          }
                          actions.updateBlock(page.id, b.id, patch);
                        }}
                        onDelete={() => actions.deleteBlock(page.id, b.id)}
                        onMove={(dir) => actions.moveBlock(page.id, b.id, dir)}
                        onToggleLock={() => actions.toggleBlockLock(page.id, b.id)}
                        onSlash={() => setSlashBlockId(b.id)}
                        onAddBlock={(type) => {
                          if (type === "grid") {
                            actions.addBlockAfter(page.id, b.id, "paragraph", { layout: "grid" });
                          } else if (isValidBlockType(type)) {
                            actions.addBlockAfter(page.id, b.id, type);
                          }
                        }}
                      />
                      {slashIndex === idx && (
                        <SlashMenu
                          onClose={() => setSlashBlockId(null)}
                          onSelect={(t: BlockType) => {
                            const id = actions.addBlockAfter(page.id, b.id, t);
                            if (t === "heading2") actions.updateBlock(page.id, id, { text: "New section" } as Partial<HeadingBlock>);
                            setSlashBlockId(null);
                          }}
                        />
                      )}
                    </div>
                  );
                }
              });
            })()}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 shadow-sm transition-all active:scale-95"
          onClick={() => actions.addBlockAfter(page.id, blocks.at(-1)?.id ?? null, "paragraph")}
        >
          + Add text block
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900 shadow-sm transition-all active:scale-95"
          onClick={() => actions.addBlockAfter(page.id, blocks.at(-1)?.id ?? null, "paragraph", { layout: "grid" })}
        >
          <Grid3X3 className="h-4 w-4" />
          Add grid block
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95 group"
          onClick={() => actions.addBlockAfter(page.id, blocks.at(-1)?.id ?? null, "aiPrompt")}
        >
          <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
          Ask AI to create...
        </button>
      </div>

      <div className="h-24" />
    </div>
  );
}
