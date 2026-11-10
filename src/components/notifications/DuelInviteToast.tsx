'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { X, Swords } from 'lucide-react';

export function DuelInviteToast() {
  const router = useRouter();
  const { duelInvites, clearDuelInvite } = useSocket();

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (duelInvites.length === 0) return;

    const timers = duelInvites.map((invite) => {
      return setTimeout(() => {
        clearDuelInvite(invite.roomId);
      }, 30000);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [duelInvites, clearDuelInvite]);

  const handleAccept = (roomId: string) => {
    clearDuelInvite(roomId);
    router.push(`/duel?room=${roomId}`);
  };

  const handleDecline = (roomId: string) => {
    clearDuelInvite(roomId);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {duelInvites.map((invite) => (
          <motion.div
            key={invite.roomId}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-4 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Swords className="w-5 h-5 text-orange-500" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  Invitation au duel !
                </p>
                <p className="text-sm text-neutral-500 truncate">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {invite.fromName}
                  </span>{' '}
                  te défie en duel
                </p>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAccept(invite.roomId)}
                    className="flex-1 py-2 px-3 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleDecline(invite.roomId)}
                    className="py-2 px-3 text-neutral-500 text-sm font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => handleDecline(invite.roomId)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
