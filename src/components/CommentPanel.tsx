import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Comment } from '@/hooks/useComments';

interface CommentPanelProps {
  comments: Comment[];
  currentUserId: string;
  onAddReply: (parentId: string, content: string) => void;
  onUpdateComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onResolveComment: (id: string) => void;
  onUnresolveComment: (id: string) => void;
  onClose?: () => void;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function CommentPanel({
  comments,
  currentUserId,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  onUnresolveComment,
  onClose,
}: CommentPanelProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    onAddReply(parentId, replyContent.trim());
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleEdit = (id: string) => {
    if (!editContent.trim()) return;
    onUpdateComment(id, editContent.trim());
    setEditContent('');
    setEditingId(null);
  };

  return (
    <div className="flex h-full w-80 flex-col bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close comments"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-lg border p-3 ${
                    comment.resolvedAt
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: comment.author.color }}
                    >
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.resolvedAt && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-800 dark:text-green-200">
                            Resolved
                          </span>
                        )}
                      </div>

                      {editingId === comment.id ? (
                        <div className="mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows={2}
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(comment.id)}
                              className="rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      )}

                      <div className="mt-2 flex items-center gap-2">
                        {comment.author.id === currentUserId && !comment.resolvedAt && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(comment.id);
                                setEditContent(comment.content);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {!comment.resolvedAt && (
                          <button
                            type="button"
                            onClick={() => onResolveComment(comment.id)}
                            className="text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                          >
                            Resolve
                          </button>
                        )}
                        {comment.resolvedAt && (
                          <button
                            type="button"
                            onClick={() => onUnresolveComment(comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-blue-500 hover:text-blue-700"
                        >
                          Reply
                        </button>
                      </div>

                      {replyingTo === comment.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows={2}
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReply(comment.id)}
                              className="rounded-md bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {comment.replies.length > 0 && (
                        <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-3 dark:border-gray-600">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="rounded bg-white p-2 dark:bg-gray-700">
                              <div className="flex items-center gap-2">
                                <div
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                                  style={{ backgroundColor: reply.author.color }}
                                >
                                  {reply.author.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-gray-900 dark:text-white">
                                  {reply.author.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentPanel;
