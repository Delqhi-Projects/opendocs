import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/Sidebar';
import { useDocsStore } from '@/store/useDocsStore';

describe('Sidebar', () => {
  beforeEach(() => {
    useDocsStore.setState({
      pages: {},
      folders: {},
      selectedPageId: null,
      rootFolderId: 'root',
      expandedFolderIds: {},
      theme: 'light',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render sidebar', () => {
      render(<Sidebar />);
      expect(screen.getByText('OpenDocs')).toBeInTheDocument();
    });

    it('should show search input', () => {
      render(<Sidebar />);
      expect(screen.getByPlaceholderText('Search pages...')).toBeInTheDocument();
    });

    it('should show "New page" button', () => {
      render(<Sidebar />);
      expect(screen.getByText('New page')).toBeInTheDocument();
    });
  });

  describe('theme toggle', () => {
    it('should show sun/moon icon', () => {
      render(<Sidebar />);
      expect(screen.getByTitle('Toggle theme')).toBeInTheDocument();
    });

    it('should toggle theme when clicked', async () => {
      useDocsStore.setState({ theme: 'light' });
      render(<Sidebar />);
      
      const toggleBtn = screen.getByTitle('Toggle theme');
      await userEvent.click(toggleBtn);
      
      expect(useDocsStore.getState().theme).toBe('dark');
    });
  });

  describe('create page', () => {
    it('should create new page when button clicked', async () => {
      render(<Sidebar />);
      
      const newPageBtn = screen.getByText('New page');
      await userEvent.click(newPageBtn);
      
      const state = useDocsStore.getState();
      const pageId = Object.keys(state.pages)[0];
      expect(pageId).toBeDefined();
      expect(state.pages[pageId].title).toBe('New page');
    });
  });

  describe('create folder', () => {
    it('should create new folder when button clicked', async () => {
      render(<Sidebar />);
      
      const newFolderBtn = screen.getByTitle('New folder');
      await userEvent.click(newFolderBtn);
      
      const state = useDocsStore.getState();
      const folderId = Object.keys(state.folders)[0];
      expect(folderId).toBeDefined();
      expect(state.folders[folderId].name).toBe('New folder');
    });
  });

  describe('clear local data', () => {
    it('should show "Clear local data" button', () => {
      render(<Sidebar />);
      expect(screen.getByText('Clear local data')).toBeInTheDocument();
    });

    it('should clear all data when clicked', async () => {
      // Create some data first
      useDocsStore.setState({
        pages: { 'page-1': { id: 'page-1', title: 'Test', icon: null, cover: null, blocks: [] } },
        folders: { 'folder-1': { id: 'folder-1', name: 'Folder', icon: null, folderIds: [], pageIds: [] } },
        selectedPageId: 'page-1',
        rootFolderId: 'root',
        expandedFolderIds: {},
        theme: 'light',
      });
      
      render(<Sidebar />);
      
      const clearBtn = screen.getByText('Clear local data');
      await userEvent.click(clearBtn);
      
      const state = useDocsStore.getState();
      expect(Object.keys(state.pages).length).toBe(0);
      expect(Object.keys(state.folders).length).toBe(0);
      expect(state.selectedPageId).toBeNull();
    });
  });

  describe('page selection', () => {
    it('should highlight selected page', async () => {
      useDocsStore.setState({
        pages: {
          'page-1': { id: 'page-1', title: 'My Page', icon: null, cover: null, blocks: [] },
        },
        selectedPageId: 'page-1',
      });
      
      render(<Sidebar />);
      const pageItem = screen.getByText('My Page');
      expect(pageItem.closest('button')).toHaveClass('bg-indigo-50');
    });

    it('should change selected page when clicked', async () => {
      useDocsStore.setState({
        pages: {
          'page-1': { id: 'page-1', title: 'Page 1', icon: null, cover: null, blocks: [] },
          'page-2': { id: 'page-2', title: 'Page 2', icon: null, cover: null, blocks: [] },
        },
        selectedPageId: 'page-1',
      });
      
      render(<Sidebar />);
      
      const page2 = screen.getByText('Page 2');
      await userEvent.click(page2);
      
      expect(useDocsStore.getState().selectedPageId).toBe('page-2');
    });
  });

  describe('folder expansion', () => {
    it('should show expand/collapse chevron', async () => {
      useDocsStore.setState({
        folders: {
          'folder-1': { 
            id: 'folder-1', 
            name: 'My Folder', 
            icon: null, 
            folderIds: [], 
            pageIds: [] 
          },
        },
      });
      
      render(<Sidebar />);
      expect(screen.getByTitle('Toggle folder')).toBeInTheDocument();
    });

    it('should expand folder when chevron clicked', async () => {
      useDocsStore.setState({
        folders: {
          'folder-1': { 
            id: 'folder-1', 
            name: 'My Folder', 
            icon: null, 
            folderIds: [], 
            pageIds: [] 
          },
        },
      });
      
      render(<Sidebar />);
      
      const chevron = screen.getByTitle('Toggle folder');
      await userEvent.click(chevron);
      
      expect(useDocsStore.getState().expandedFolderIds['folder-1']).toBe(true);
    });

    it('should show nested pages when folder expanded', async () => {
      useDocsStore.setState({
        pages: {
          'page-1': { id: 'page-1', title: 'Nested Page', icon: null, cover: null, blocks: [] },
        },
        folders: {
          'folder-1': { 
            id: 'folder-1', 
            name: 'My Folder', 
            icon: null, 
            folderIds: [], 
            pageIds: ['page-1'] 
          },
        },
        expandedFolderIds: { 'folder-1': true },
      });
      
      render(<Sidebar />);
      expect(screen.getByText('Nested Page')).toBeInTheDocument();
    });
  });

  describe('page search', () => {
    it('should filter pages by search term', async () => {
      useDocsStore.setState({
        pages: {
          'page-1': { id: 'page-1', title: 'Important Doc', icon: null, cover: null, blocks: [] },
          'page-2': { id: 'page-2', title: 'Random Note', icon: null, cover: null, blocks: [] },
        },
      });
      
      render(<Sidebar />);
      
      const searchInput = screen.getByPlaceholderText('Search pages...');
      await userEvent.type(searchInput, 'Important');
      
      expect(screen.getByText('Important Doc')).toBeInTheDocument();
      expect(screen.queryByText('Random Note')).not.toBeInTheDocument();
    });
  });

  describe('add page to folder', () => {
    it('should show add page button on folder hover', async () => {
      useDocsStore.setState({
        folders: {
          'folder-1': { 
            id: 'folder-1', 
            name: 'My Folder', 
            icon: null, 
            folderIds: [], 
            pageIds: [] 
          },
        },
      });
      
      render(<Sidebar />);
      
      const folderRow = screen.getByText('My Folder').closest('div');
      fireEvent.mouseEnter(folderRow!);
      
      await waitFor(() => {
        expect(screen.getByTitle('New page in folder')).toBeInTheDocument();
      });
    });

    it('should create page in folder when add clicked', async () => {
      useDocsStore.setState({
        folders: {
          'folder-1': { 
            id: 'folder-1', 
            name: 'My Folder', 
            icon: null, 
            folderIds: [], 
            pageIds: [] 
          },
        },
      });
      
      render(<Sidebar />);
      
      const folderRow = screen.getByText('My Folder').closest('div');
      fireEvent.mouseEnter(folderRow!);
      
      await waitFor(async () => {
        const addBtn = screen.getByTitle('New page in folder');
        await userEvent.click(addBtn);
      });
      
      const state = useDocsStore.getState();
      expect(state.folders['folder-1'].pageIds.length).toBe(1);
    });
  });
});
