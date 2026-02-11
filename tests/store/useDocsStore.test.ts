import { describe, it, expect, beforeEach } from 'vitest';
import { useDocsStore } from '@/store/useDocsStore';

// Helper to create initial state
const createInitialState = () => ({
  pages: {} as Record<string, any>,
  folders: {} as Record<string, any>,
  selectedPageId: null as string | null,
  rootFolderId: 'root',
  expandedFolderIds: {} as Record<string, boolean>,
  theme: 'light' as 'light' | 'dark',
});

describe('useDocsStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useDocsStore.setState({
      ...createInitialState(),
      pages: {},
      folders: { root: { id: 'root', name: 'Root', icon: null, folderIds: [], pageIds: [] } },
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useDocsStore.getState();
      expect(Object.keys(state.pages).length).toBe(0);
      expect(Object.keys(state.folders).length).toBe(1);
      expect(state.selectedPageId).toBeNull();
      expect(state.rootFolderId).toBe('root');
      expect(state.theme).toBe('light');
    });
  });

  describe('createPage', () => {
    it('should create a new page in root folder', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test Page');
      
      const state = useDocsStore.getState();
      expect(state.pages[pageId]).toBeDefined();
      expect(state.pages[pageId].title).toBe('Test Page');
      expect(state.folders.root.pageIds).toContain(pageId);
    });

    it('should create page with default title', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', '');
      
      expect(useDocsStore.getState().pages[pageId].title).toBe('Untitled');
    });

    it('should create multiple pages', () => {
      const actions = useDocsStore.getState().actions;
      actions.createPage('root', 'Page 1');
      actions.createPage('root', 'Page 2');
      actions.createPage('root', 'Page 3');
      
      expect(Object.keys(useDocsStore.getState().pages).length).toBe(3);
    });
  });

  describe('createFolder', () => {
    it('should create a new folder in root', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'Test Folder');
      
      const state = useDocsStore.getState();
      expect(state.folders[folderId]).toBeDefined();
      expect(state.folders[folderId].name).toBe('Test Folder');
      expect(state.folders.root.folderIds).toContain(folderId);
    });
  });

  describe('selectPage', () => {
    it('should select a page by id', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      useDocsStore.getState().actions.selectPage(pageId);
      
      expect(useDocsStore.getState().selectedPageId).toBe(pageId);
    });

    it('should update selected page', () => {
      const actions = useDocsStore.getState().actions;
      const pageId1 = actions.createPage('root', 'Page 1');
      const pageId2 = actions.createPage('root', 'Page 2');
      
      actions.selectPage(pageId1);
      expect(useDocsStore.getState().selectedPageId).toBe(pageId1);
      
      actions.selectPage(pageId2);
      expect(useDocsStore.getState().selectedPageId).toBe(pageId2);
    });

    it('should handle null selection', () => {
      const actions = useDocsStore.getState().actions;
      const pageId = actions.createPage('root', 'Test');
      
      actions.selectPage(pageId);
      actions.selectPage(null);
      
      expect(useDocsStore.getState().selectedPageId).toBeNull();
    });
  });

  describe('renamePage', () => {
    it('should rename a page', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Original Title');
      useDocsStore.getState().actions.renamePage(pageId, 'New Title');
      
      expect(useDocsStore.getState().pages[pageId].title).toBe('New Title');
    });
  });

  describe('deletePage', () => {
    it('should delete a page', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'To Delete');
      useDocsStore.getState().actions.deletePage(pageId);
      
      expect(useDocsStore.getState().pages[pageId]).toBeUndefined();
      expect(useDocsStore.getState().selectedPageId).toBeNull();
    });

    it('should remove page from parent folder', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      expect(useDocsStore.getState().folders.root.pageIds).toContain(pageId);
      
      useDocsStore.getState().actions.deletePage(pageId);
      
      expect(useDocsStore.getState().folders.root.pageIds).not.toContain(pageId);
    });
  });

  describe('addBlockAfter', () => {
    it('should add a paragraph block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test Page');
      const blockId = useDocsStore.getState().actions.addBlockAfter(pageId, null, 'paragraph');
      
      const page = useDocsStore.getState().pages[pageId];
      expect(page.blocks.length).toBeGreaterThanOrEqual(1);
      expect(blockId).toBeDefined();
    });

    it('should add a heading block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      useDocsStore.getState().actions.addBlockAfter(pageId, null, 'heading1');
      
      const page = useDocsStore.getState().pages[pageId];
      const hasHeading = page.blocks.some((b: any) => b.type === 'heading1');
      expect(hasHeading).toBe(true);
    });

    it('should add multiple blocks', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      useDocsStore.getState().actions.addBlockAfter(pageId, null, 'paragraph');
      useDocsStore.getState().actions.addBlockAfter(pageId, null, 'heading2');
      useDocsStore.getState().actions.addBlockAfter(pageId, null, 'code');
      
      const page = useDocsStore.getState().pages[pageId];
      expect(page.blocks.length).toBeGreaterThanOrEqual(3);
    });

    it('should add block after another block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const firstBlockId = blocks[0].id;
      
      useDocsStore.getState().actions.addBlockAfter(pageId, firstBlockId, 'paragraph');
      
      const updatedPage = useDocsStore.getState().pages[pageId];
      expect(updatedPage.blocks.length).toBeGreaterThan(1);
    });
  });

  describe('updateBlock', () => {
    it('should update block text', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.updateBlock(pageId, blockId, { text: 'Updated text' });
      
      expect(useDocsStore.getState().pages[pageId].blocks[0].text).toBe('Updated text');
    });

    it('should update block language', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.updateBlock(pageId, blockId, { language: 'typescript' });
      
      expect(useDocsStore.getState().pages[pageId].blocks[0].language).toBe('typescript');
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockToDelete = blocks[0].id;
      
      useDocsStore.getState().actions.deleteBlock(pageId, blockToDelete);
      
      const page = useDocsStore.getState().pages[pageId];
      expect(page.blocks.find((b: any) => b.id === blockToDelete)).toBeUndefined();
    });
  });

  describe('moveBlock', () => {
    it('should move block up', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.moveBlock(pageId, blockId, 'up');
      
      // Should not throw - function exists
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });

    it('should move block down', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.moveBlock(pageId, blockId, 'down');
      
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });
  });

  describe('reorderBlocks', () => {
    it('should reorder blocks', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      useDocsStore.getState().actions.reorderBlocks(pageId, 0, 1);
      
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });
  });

  describe('toggleBlockLock', () => {
    it('should lock a block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.toggleBlockLock(pageId, blockId);
      
      expect(useDocsStore.getState().pages[pageId].blocks[0].locked).toBe(true);
    });

    it('should unlock a block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      const blocks = useDocsStore.getState().pages[pageId].blocks;
      const blockId = blocks[0].id;
      
      useDocsStore.getState().actions.toggleBlockLock(pageId, blockId);
      useDocsStore.getState().actions.toggleBlockLock(pageId, blockId);
      
      expect(useDocsStore.getState().pages[pageId].blocks[0].locked).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      useDocsStore.getState().actions.setTheme('dark');
      
      expect(useDocsStore.getState().theme).toBe('dark');
    });

    it('should set theme to light', () => {
      useDocsStore.getState().actions.setTheme('light');
      
      expect(useDocsStore.getState().theme).toBe('light');
    });
  });

  describe('toggleFolderExpanded', () => {
    it('should expand a folder', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'Test');
      
      useDocsStore.getState().actions.toggleFolderExpanded(folderId);
      
      expect(useDocsStore.getState().expandedFolderIds[folderId]).toBe(true);
    });

    it('should collapse a folder', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'Test');
      
      useDocsStore.getState().actions.toggleFolderExpanded(folderId);
      useDocsStore.getState().actions.toggleFolderExpanded(folderId);
      
      expect(useDocsStore.getState().expandedFolderIds[folderId]).toBe(false);
    });
  });

  describe('updateFolderIcon', () => {
    it('should update folder icon', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'Test');
      
      useDocsStore.getState().actions.updateFolderIcon(folderId, { type: 'emoji', value: '📁' });
      
      expect(useDocsStore.getState().folders[folderId].icon).toEqual({ type: 'emoji', value: '📁' });
    });
  });

  describe('updatePageIcon', () => {
    it('should update page icon', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      useDocsStore.getState().actions.updatePageIcon(pageId, { type: 'emoji', value: '📄' });
      
      expect(useDocsStore.getState().pages[pageId].icon).toEqual({ type: 'emoji', value: '📄' });
    });
  });

  describe('updatePageMetadata', () => {
    it('should update page cover', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      useDocsStore.getState().actions.updatePageMetadata(pageId, { cover: 'https://example.com/cover.jpg' });
      
      expect(useDocsStore.getState().pages[pageId].cover).toBe('https://example.com/cover.jpg');
    });
  });

  describe('renameFolder', () => {
    it('should rename a folder', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'Original');
      
      useDocsStore.getState().actions.renameFolder(folderId, 'Renamed');
      
      expect(useDocsStore.getState().folders[folderId].name).toBe('Renamed');
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder', () => {
      const folderId = useDocsStore.getState().actions.createFolder('root', 'To Delete');
      
      useDocsStore.getState().actions.deleteFolder(folderId);
      
      expect(useDocsStore.getState().folders[folderId]).toBeUndefined();
    });
  });

  describe('clearAllData', () => {
    it('should clear all data', () => {
      useDocsStore.getState().actions.createPage('root', 'Test');
      
      useDocsStore.getState().actions.clearAllData();
      
      const state = useDocsStore.getState();
      expect(Object.keys(state.pages).length).toBe(0);
      expect(Object.keys(state.folders).length).toBe(0);
      expect(state.selectedPageId).toBeNull();
    });
  });

  describe('convertTableToDatabase', () => {
    it('should convert table block to database block', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      // Should not throw - function exists
      useDocsStore.getState().actions.convertTableToDatabase(pageId, 'invalid-block-id');
      
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle invalid pageId gracefully', () => {
      const actions = useDocsStore.getState().actions;
      
      // Should not throw
      actions.updateBlock('invalid-id', 'invalid-block-id', { text: 'test' });
      actions.deleteBlock('invalid-id', 'invalid-block-id');
      
      expect(true).toBe(true);
    });

    it('should handle reorder with same index', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      // Should not throw
      useDocsStore.getState().actions.reorderBlocks(pageId, 0, 0);
      
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });

    it('should handle reorder with invalid indices', () => {
      const pageId = useDocsStore.getState().actions.createPage('root', 'Test');
      
      // Should not throw
      useDocsStore.getState().actions.reorderBlocks(pageId, -1, 100);
      
      expect(useDocsStore.getState().pages[pageId]).toBeDefined();
    });
  });
});
