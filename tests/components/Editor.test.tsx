import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@/components/Editor';
import { useDocsStore } from '@/store/useDocsStore';
import type { DocBlock } from '@/types/docs';

const createMockPage = (overrides: Partial<any> = {}) => ({
  id: 'test-page-1',
  title: 'Test Page',
  icon: null,
  cover: null,
  blocks: [],
  ...overrides,
});

describe('Editor', () => {
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
    it('should show "No page selected" when no page is selected', () => {
      render(<Editor />);
      expect(screen.getByText('No page selected.')).toBeInTheDocument();
    });

    it('should render page title when page is selected', () => {
      const page = createMockPage({ title: 'My Document' });
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      expect(screen.getByDisplayValue('My Document')).toBeInTheDocument();
    });

    it('should render blocks when page has blocks', () => {
      const page = createMockPage({
        blocks: [
          { id: 'block-1', type: 'paragraph', text: 'First paragraph' },
          { id: 'block-2', type: 'heading2', text: 'Section' },
        ],
      });
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      expect(screen.getByDisplayValue('First paragraph')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Section')).toBeInTheDocument();
    });
  });

  describe('Add text block button', () => {
    it('should show "Add text block" button', () => {
      const page = createMockPage();
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      expect(screen.getByText('+ Add text block')).toBeInTheDocument();
    });

    it('should call addBlock when "Add text block" clicked', async () => {
      const page = createMockPage();
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      const btn = screen.getByText('+ Add text block');
      await userEvent.click(btn);
      
      const state = useDocsStore.getState();
      expect(state.pages[page.id].blocks.length).toBe(1);
      expect(state.pages[page.id].blocks[0].type).toBe('paragraph');
    });
  });

  describe('Ask AI button', () => {
    it('should show "Ask AI to create..." button', () => {
      const page = createMockPage();
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      expect(screen.getByText('Ask AI to create...')).toBeInTheDocument();
    });

    it('should call addBlock with aiPrompt when "Ask AI" clicked', async () => {
      const page = createMockPage();
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      const btn = screen.getByText('Ask AI to create...');
      await userEvent.click(btn);
      
      const state = useDocsStore.getState();
      expect(state.pages[page.id].blocks.length).toBe(1);
      expect(state.pages[page.id].blocks[0].type).toBe('aiPrompt');
    });
  });

  describe('DndContext', () => {
    it('should have SortableContext for blocks', () => {
      const page = createMockPage({
        blocks: [
          { id: 'block-1', type: 'paragraph', text: 'First' },
          { id: 'block-2', type: 'paragraph', text: 'Second' },
        ],
      });
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      const { container } = render(<Editor />);
      expect(container.querySelector('[data-dnd-context="true"]')).toBeInTheDocument();
    });
  });

  describe('empty page with placeholder', () => {
    it('should show placeholder text for empty paragraph', () => {
      const page = createMockPage({
        blocks: [{ id: 'block-1', type: 'paragraph', text: '' }],
      });
      useDocsStore.setState({
        pages: { [page.id]: page },
        selectedPageId: page.id,
      });
      
      render(<Editor />);
      expect(screen.getByPlaceholderText('Write… (type / on empty block to insert)')).toBeInTheDocument();
    });
  });
});
