'use client';

import { useRouter } from 'next/navigation';
import { useDuelInvites } from '@/hooks/useDuelInvites';
import { Swords, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function DuelInviteNotification() {
  const router = useRouter();
  const { invites, acceptInvite, declineInvite } = useDuelInvites();
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      const roomId = await acceptInvite(inviteId);
      if (roomId) {
        router.push(`/duel?room=${roomId}`);
      }
    } catch (error) {
      console.error('Erreur acceptation invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await declineInvite(inviteId);
    } catch (error) {
      console.error('Erreur refus invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  if (invites.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {invites.map((invite) => (
        <div 
          key={invite.id}
          className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Swords className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">
                Invitation de duel
              </h4>
              <p className="text-sm text-neutral-500">
                {invite.fromDisplayName} te defie
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleAccept(invite.id)}
                  disabled={processingId === invite.id}
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {processingId === invite.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Accepter'
                  )}
                </button>
                <button
                  onClick={() => handleDecline(invite.id)}
                  disabled={processingId === invite.id}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm"
                >
                  Refuser
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleDecline(invite.id)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 -mt-1 -mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
