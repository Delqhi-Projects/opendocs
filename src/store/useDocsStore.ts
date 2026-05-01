import { create } from 'zustand';
import { Document, Block } from '@/types/docs';

interface DocsState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDocuments: (docs: Document[]) => void;
  setCurrentDocument: (doc: Document | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addBlock: (documentId: string, block: Block, index?: number) => void;
  updateBlock: (documentId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (documentId: string, blockId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDocsStore = create<DocsState>((set) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,

  setDocuments: (docs) => set({ documents: docs }),
  
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
    ),
    currentDocument: state.currentDocument?.id === id
      ? { ...state.currentDocument, ...updates, updatedAt: new Date() }
      : state.currentDocument,
  })),
  
  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter((doc) => doc.id !== id),
    currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
  })),
  
  addBlock: (documentId, block, index) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === documentId
        ? {
            ...doc,
            content: index !== undefined
              ? [...doc.content.slice(0, index), block, ...doc.content.slice(index)]
              : [...doc.content, block],
            updatedAt: new Date(),
          }
        : doc
    ),
    currentDocument: state.currentDocument?.id === documentId
      ? {
          ...state.currentDocument,
          content: index !== undefined
            ? [...state.currentDocument.content.slice(0, index), block, ...state.currentDocument.content.slice(index)]
            : [...state.currentDocument.content, block],
          updatedAt: new Date(),
        }
      : state.currentDocument,
  })),
  
  updateBlock: (documentId, blockId, updates) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === documentId
        ? {
            ...doc,
            content: doc.content.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
            updatedAt: new Date(),
          }
        : doc
    ),
    currentDocument: state.currentDocument?.id === documentId
      ? {
          ...state.currentDocument,
          content: state.currentDocument.content.map((block) =>
            block.id === blockId ? { ...block, ...updates } : block
          ),
          updatedAt: new Date(),
        }
      : state.currentDocument,
  })),
  
  deleteBlock: (documentId, blockId) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === documentId
        ? {
            ...doc,
            content: doc.content.filter((block) => block.id !== blockId),
            updatedAt: new Date(),
          }
        : doc
    ),
    currentDocument: state.currentDocument?.id === documentId
      ? {
          ...state.currentDocument,
          content: state.currentDocument.content.filter((block) => block.id !== blockId),
          updatedAt: new Date(),
        }
      : state.currentDocument,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
}));
