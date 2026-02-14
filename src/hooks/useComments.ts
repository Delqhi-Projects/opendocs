import { useState, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';

export interface CommentAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
}

export interface Comment {
  id: string;
  blockId: string;
  content: string;
  author: CommentAuthor;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  parentId?: string;
  replies: Comment[];
}

export interface CreateCommentInput {
  blockId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  id: string;
  content: string;
}

interface UseCommentsOptions {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  initialComments?: Comment[];
}

interface UseCommentsReturn {
  comments: Comment[];
  blockComments: (blockId: string) => Comment[];
  unresolvedCount: number;
  addComment: (input: CreateCommentInput) => Comment;
  updateComment: (input: UpdateCommentInput) => void;
  deleteComment: (id: string) => void;
  resolveComment: (id: string) => void;
  unresolveComment: (id: string) => void;
}

function generateUserColor(userId: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

export function useComments(options: UseCommentsOptions): UseCommentsReturn {
  const { currentUserId, currentUserName, currentUserAvatar, initialComments = [] } = options;

  const [comments, setComments] = useState<Comment[]>(initialComments);

  const author: CommentAuthor = useMemo(() => ({
    id: currentUserId,
    name: currentUserName,
    avatarUrl: currentUserAvatar,
    color: generateUserColor(currentUserId),
  }), [currentUserId, currentUserName, currentUserAvatar]);

  const blockComments = useCallback((blockId: string) => {
    return comments.filter((c) => c.blockId === blockId && !c.parentId);
  }, [comments]);

  const unresolvedCount = useMemo(() => {
    return comments.filter((c) => !c.resolvedAt && !c.parentId).length;
  }, [comments]);

  const addComment = useCallback((input: CreateCommentInput): Comment => {
    const newComment: Comment = {
      id: nanoid(),
      blockId: input.blockId,
      content: input.content,
      author,
      createdAt: new Date(),
      parentId: input.parentId,
      replies: [],
    };

    setComments((prev) => {
      if (input.parentId) {
        return prev.map((c) => {
          if (c.id === input.parentId) {
            return { ...c, replies: [...c.replies, newComment] };
          }
          return c;
        });
      }
      return [...prev, newComment];
    });

    return newComment;
  }, [author]);

  const updateComment = useCallback((input: UpdateCommentInput) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === input.id) {
        return { ...c, content: input.content, updatedAt: new Date() };
      }
      if (c.replies.some((r) => r.id === input.id)) {
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === input.id ? { ...r, content: input.content, updatedAt: new Date() } : r
          ),
        };
      }
      return c;
    }));
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== id),
      }));
    });
  }, []);

  const resolveComment = useCallback((id: string) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) {
        return { ...c, resolvedAt: new Date(), resolvedBy: currentUserId };
      }
      return c;
    }));
  }, [currentUserId]);

  const unresolveComment = useCallback((id: string) => {
    setComments((prev) => prev.map((c) => {
      if (c.id === id) {
        const { resolvedAt: _, resolvedBy: __, ...rest } = c;
        return rest as Comment;
      }
      return c;
    }));
  }, []);

  return {
    comments,
    blockComments,
    unresolvedCount,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
  };
}

export default useComments;
