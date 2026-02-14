import { motion, AnimatePresence } from 'framer-motion';
import type { CursorPosition } from '@/hooks/useRealtimeSync';

interface CursorOverlayProps {
  cursors: CursorPosition[];
  currentUserId: string;
}

export function CursorOverlay({ cursors, currentUserId }: CursorOverlayProps) {
  const otherCursors = cursors.filter((c) => c.userId !== currentUserId);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {otherCursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: cursor.position.x,
              y: cursor.position.y,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="absolute"
            style={{ left: 0, top: 0 }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: cursor.userColor }}
              aria-label={`${cursor.userName}'s cursor`}
            >
              <title>{cursor.userName}'s cursor</title>
              <path
                d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
                fill="currentColor"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
            <div
              className="absolute left-4 top-4 rounded-md px-2 py-1 text-xs font-medium text-white shadow-md"
              style={{ backgroundColor: cursor.userColor }}
            >
              {cursor.userName}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default CursorOverlay;
