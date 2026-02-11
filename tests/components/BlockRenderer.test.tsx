import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { useDocsStore } from '@/store/useDocsStore';
import type { DocBlock } from '@/types/docs';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: ({ id }: { id: string }) => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const createMockBlock = (overrides: Partial<DocBlock> = {}): DocBlock => ({
  id: 'test-block-1',
  type: 'paragraph',
  text: 'Test paragraph content',
  ...overrides,
} as DocBlock);

describe('BlockRenderer', () => {
  beforeEach(() => {
    useDocsStore.setState({
      pages: {},
      folders: {},
      selectedPageId: 'test-page',
      rootFolderId: 'root',
      expandedFolderIds: {},
      theme: 'light',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('paragraph block', () => {
    it('should render paragraph block with text', () => {
      const block = createMockBlock({ type: 'paragraph', text: 'Hello World' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Hello World')).toBeInTheDocument();
    });

    it('should show hover toolbar on mouse enter', async () => {
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        expect(screen.getByTitle('Drag to move')).toBeInTheDocument();
      });
    });

    it('should call onUpdate when text changes', async () => {
      const onUpdate = vi.fn();
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={onUpdate}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const textarea = screen.getByDisplayValue('Test paragraph content');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Updated text');
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  describe('heading blocks', () => {
    it('should render heading1 block', () => {
      const block = createMockBlock({ type: 'heading1', text: 'Heading 1' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Heading 1')).toBeInTheDocument();
    });

    it('should render heading2 block', () => {
      const block = createMockBlock({ type: 'heading2', text: 'Heading 2' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Heading 2')).toBeInTheDocument();
    });

    it('should render heading3 block', () => {
      const block = createMockBlock({ type: 'heading3', text: 'Heading 3' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Heading 3')).toBeInTheDocument();
    });
  });

  describe('code block', () => {
    it('should render code block with language selector', () => {
      const block = createMockBlock({ type: 'code', language: 'typescript', code: 'const x = 1;' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('typescript')).toBeInTheDocument();
      expect(screen.getByDisplayValue('const x = 1;')).toBeInTheDocument();
    });
  });

  describe('callout block', () => {
    it('should render callout block with tone selector', () => {
      const block = createMockBlock({ 
        type: 'callout', 
        tone: 'info', 
        title: 'Info',
        text: 'Callout text' 
      });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Info')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Callout text')).toBeInTheDocument();
    });
  });

  describe('checklist block', () => {
    it('should render checklist block with items', () => {
      const block = {
        ...createMockBlock({ type: 'checklist' }),
        items: [
          { id: 'item-1', text: 'Task 1', checked: false },
          { id: 'item-2', text: 'Task 2', checked: true },
        ],
      } as DocBlock & { items: Array<{ id: string; text: string; checked: boolean }> };
       
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  describe('quote block', () => {
    it('should render quote block', () => {
      const block = createMockBlock({ type: 'quote', text: 'A great quote' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('A great quote')).toBeInTheDocument();
    });
  });

  describe('divider block', () => {
    it('should render divider block', () => {
      const block = createMockBlock({ type: 'divider' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('image block', () => {
    it('should render image block with URL input', () => {
      const block = createMockBlock({ type: 'image', url: 'https://example.com/image.jpg' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('https://example.com/image.jpg')).toBeInTheDocument();
    });
  });

  describe('video block', () => {
    it('should render video block with URL input', () => {
      const block = createMockBlock({ type: 'video', url: 'https://youtube.com/watch?v=abc123' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('https://youtube.com/watch?v=abc123')).toBeInTheDocument();
    });
  });

  describe('link block', () => {
    it('should render link block with URL input', () => {
      const block = createMockBlock({ type: 'link', url: 'https://example.com' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    });
  });

  describe('file block', () => {
    it('should render file block with name and URL', () => {
      const block = createMockBlock({ type: 'file', name: 'Document.pdf', url: 'https://example.com/doc.pdf' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('Document.pdf')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/doc.pdf')).toBeInTheDocument();
    });
  });

  describe('mermaid block', () => {
    it('should render mermaid block with code input', () => {
      const block = createMockBlock({ type: 'mermaid', code: 'graph TD; A-->B;' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByDisplayValue('graph TD; A-->B;')).toBeInTheDocument();
    });
  });

  describe('horizontal block', () => {
    it('should render horizontal layout block', () => {
      const block = createMockBlock({ type: 'horizontal', blocks: [] });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByText('horizontal')).toBeInTheDocument();
    });
  });

  describe('toolbar actions', () => {
    it('should show side toolbar on hover', async () => {
      const onAddBlock = vi.fn();
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={onAddBlock}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        expect(screen.getByTitle('Add block below')).toBeInTheDocument();
      });
    });

    it('should call onDelete when delete button clicked', async () => {
      const onDelete = vi.fn();
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={onDelete}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        const deleteBtn = screen.getByTitle('Delete');
        fireEvent.click(deleteBtn);
        expect(onDelete).toHaveBeenCalled();
      });
    });

    it('should call onMove up when up arrow clicked', async () => {
      const onMove = vi.fn();
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={onMove}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        const upBtn = screen.getByTitle('Move up');
        fireEvent.click(upBtn);
        expect(onMove).toHaveBeenCalledWith('up');
      });
    });

    it('should call onMove down when down arrow clicked', async () => {
      const onMove = vi.fn();
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={onMove}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        const downBtn = screen.getByTitle('Move down');
        fireEvent.click(downBtn);
        expect(onMove).toHaveBeenCalledWith('down');
      });
    });

    it('should call onToggleLock when lock button clicked', async () => {
      const onToggleLock = vi.fn();
      const block = createMockBlock({ type: 'paragraph', locked: false });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={onToggleLock}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        const lockBtn = screen.getByTitle('Lock');
        fireEvent.click(lockBtn);
        expect(onToggleLock).toHaveBeenCalled();
      });
    });
  });

  describe('dark mode', () => {
    it('should apply dark mode styles', () => {
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={true}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const textarea = screen.getByDisplayValue('Test paragraph content');
      expect(textarea).toHaveClass('dark:bg-zinc-900');
    });
  });

  describe('locked block', () => {
    it('should disable inputs when locked', () => {
      const block = createMockBlock({ type: 'paragraph', locked: true });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const textarea = screen.getByDisplayValue('Test paragraph content');
      expect(textarea).toBeDisabled();
    });
  });

  describe('BlockChatModal integration', () => {
    it('should open chat modal when chat button clicked', async () => {
      const block = createMockBlock({ type: 'paragraph' });
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      const container = screen.getByTestId(`block-${block.id}`);
      fireEvent.mouseEnter(container);
      await waitFor(() => {
        const chatBtn = screen.getByTitle('Chat');
        fireEvent.click(chatBtn);
      });
      expect(screen.getByText('Block Chat • paragraph')).toBeInTheDocument();
    });
  });

  describe('unsupported block type', () => {
    it('should show unsupported message for unknown types', () => {
      const block = { ...createMockBlock(), type: 'unknown' as any };
      render(
        <BlockRenderer
          block={block}
          dark={false}
          dragId={block.id}
          onUpdate={() => {}}
          onDelete={() => {}}
          onMove={() => {}}
          onToggleLock={() => {}}
          onSlash={() => {}}
          onAddBlock={() => {}}
        />
      );
      expect(screen.getByText('Unsupported block type: unknown')).toBeInTheDocument();
    });
  });
});
