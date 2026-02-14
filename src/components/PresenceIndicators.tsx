import { motion, AnimatePresence } from 'framer-motion';
import type { UserPresence } from '@/hooks/useRealtimeSync';

interface PresenceIndicatorsProps {
  presence: UserPresence[];
  currentUserId: string;
  maxVisible?: number;
}

export function PresenceIndicators({ presence, currentUserId, maxVisible = 4 }: PresenceIndicatorsProps) {
  const otherUsers = presence.filter((p) => p.userId !== currentUserId);
  const visibleUsers = otherUsers.slice(0, maxVisible);
  const hiddenCount = otherUsers.length - maxVisible;

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'editing':
        return 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900';
      case 'viewing':
        return '';
      case 'idle':
        return 'opacity-50';
      default:
        return '';
    }
  };

  if (otherUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence mode="popLayout">
        {visibleUsers.map((user) => (
          <motion.div
            key={user.userId}
            initial={{ opacity: 0, scale: 0.5, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -10 }}
            transition={{ duration: 0.2 }}
            className="group relative"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md transition-all ${getStatusColor(user.status)}`}
              style={{ backgroundColor: user.userColor }}
              title={`${user.userName} - ${user.status}`}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block dark:bg-gray-700">
              {user.userName}
              <span className="ml-1 opacity-70">({user.status})</span>
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700 shadow-md dark:bg-gray-600 dark:text-gray-200"
          title={`${hiddenCount} more users`}
        >
          +{hiddenCount}
        </motion.div>
      )}
    </div>
  );
}

export default PresenceIndicators;
