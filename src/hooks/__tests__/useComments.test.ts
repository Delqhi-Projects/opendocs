import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComments } from '../useComments';

describe('useComments', () => {
  const defaultOptions = {
    currentUserId: 'user-1',
    currentUserName: 'Test User',
    currentUserAvatar: 'https://example.com/avatar.png',
  };

  beforeEach(() => {
    // Clear any stored state
  });

  describe('initialization', () => {
    it('should initialize with empty comments', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      expect(result.current.comments).toEqual([]);
      expect(result.current.unresolvedCount).toBe(0);
    });

    it('should initialize with provided comments', () => {
      const initialComments = [
        {
          id: 'comment-1',
          blockId: 'block-1',
          content: 'Test comment',
          author: { id: 'user-2', name: 'Other User', color: '#FF6B6B' },
          createdAt: new Date(),
          replies: [],
        },
      ];

      const { result } = renderHook(() =>
        useComments({ ...defaultOptions, initialComments })
      );

      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].content).toBe('Test comment');
    });
  });

  describe('addComment', () => {
    it('should add a new comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'New comment',
        });
      });

      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].content).toBe('New comment');
      expect(result.current.comments[0].blockId).toBe('block-1');
      expect(result.current.comments[0].author.id).toBe('user-1');
    });

    it('should increment unresolvedCount when adding comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      expect(result.current.unresolvedCount).toBe(0);

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'New comment',
        });
      });

      expect(result.current.unresolvedCount).toBe(1);
    });

    it('should add reply to existing comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      // Add parent comment
      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Parent comment',
        });
      });

      const parentId = result.current.comments[0].id;

      // Add reply
      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Reply content',
          parentId,
        });
      });

      expect(result.current.comments[0].replies).toHaveLength(1);
      expect(result.current.comments[0].replies[0].content).toBe('Reply content');
      expect(result.current.comments[0].replies[0].parentId).toBe(parentId);
    });

    it('should generate unique id for new comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      let comment1Id: string;
      let comment2Id: string;

      act(() => {
        comment1Id = result.current.addComment({
          blockId: 'block-1',
          content: 'First',
        }).id;
        comment2Id = result.current.addComment({
          blockId: 'block-1',
          content: 'Second',
        }).id;
      });

      expect(comment1Id!).not.toBe(comment2Id!);
    });
  });

  describe('updateComment', () => {
    it('should update comment content', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Original content',
        });
      });

      const commentId = result.current.comments[0].id;

      act(() => {
        result.current.updateComment({
          id: commentId,
          content: 'Updated content',
        });
      });

      expect(result.current.comments[0].content).toBe('Updated content');
      expect(result.current.comments[0].updatedAt).toBeTruthy();
    });

    it('should update reply content', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Parent',
        });
      });

      const parentId = result.current.comments[0].id;

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Reply original',
          parentId,
        });
      });

      const replyId = result.current.comments[0].replies[0].id;

      act(() => {
        result.current.updateComment({
          id: replyId,
          content: 'Reply updated',
        });
      });

      expect(result.current.comments[0].replies[0].content).toBe('Reply updated');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'To be deleted',
        });
      });

      const commentId = result.current.comments[0].id;

      act(() => {
        result.current.deleteComment(commentId);
      });

      expect(result.current.comments).toHaveLength(0);
    });

    it('should delete reply from parent', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Parent',
        });
      });

      const parentId = result.current.comments[0].id;

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Reply',
          parentId,
        });
      });

      const replyId = result.current.comments[0].replies[0].id;

      act(() => {
        result.current.deleteComment(replyId);
      });

      expect(result.current.comments[0].replies).toHaveLength(0);
    });
  });

  describe('resolveComment', () => {
    it('should resolve comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'To be resolved',
        });
      });

      const commentId = result.current.comments[0].id;

      act(() => {
        result.current.resolveComment(commentId);
      });

      expect(result.current.comments[0].resolvedAt).toBeTruthy();
      expect(result.current.comments[0].resolvedBy).toBe('user-1');
      expect(result.current.unresolvedCount).toBe(0);
    });
  });

  describe('unresolveComment', () => {
    it('should unresolve comment', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'To be resolved',
        });
      });

      const commentId = result.current.comments[0].id;

      act(() => {
        result.current.resolveComment(commentId);
      });

      expect(result.current.unresolvedCount).toBe(0);

      act(() => {
        result.current.unresolveComment(commentId);
      });

      expect(result.current.comments[0].resolvedAt).toBeUndefined();
      expect(result.current.comments[0].resolvedBy).toBeUndefined();
      expect(result.current.unresolvedCount).toBe(1);
    });
  });

  describe('blockComments', () => {
    it('should return comments for specific block', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({ blockId: 'block-1', content: 'Comment 1' });
        result.current.addComment({ blockId: 'block-2', content: 'Comment 2' });
        result.current.addComment({ blockId: 'block-1', content: 'Comment 3' });
      });

      const block1Comments = result.current.blockComments('block-1');
      const block2Comments = result.current.blockComments('block-2');

      expect(block1Comments).toHaveLength(2);
      expect(block2Comments).toHaveLength(1);
    });

    it('should not include replies in blockComments', () => {
      const { result } = renderHook(() => useComments(defaultOptions));

      act(() => {
        result.current.addComment({ blockId: 'block-1', content: 'Parent' });
      });

      const parentId = result.current.comments[0].id;

      act(() => {
        result.current.addComment({
          blockId: 'block-1',
          content: 'Reply',
          parentId,
        });
      });

      const blockComments = result.current.blockComments('block-1');

      // Only parent comment should be returned
      expect(blockComments).toHaveLength(1);
      expect(blockComments[0].parentId).toBeUndefined();
    });
  });
});
