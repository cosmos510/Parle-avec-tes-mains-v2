'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  subscribeToDuelInvites, 
  respondToDuelInvite,
  type DuelInvite 
} from '@/lib/duel-invite-service';

/**
 * Hook pour écouter et gérer les invitations de duel
 */
export function useDuelInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<DuelInvite[]>([]);
  
  useEffect(() => {
    if (!user) {
      setInvites([]);
      return;
    }
    
    const unsubscribe = subscribeToDuelInvites(user.uid, (newInvites) => {
      setInvites(newInvites);
    });
    
    return () => {
      unsubscribe();
    };
  }, [user]);
  
  const acceptInvite = useCallback(async (inviteId: string): Promise<string | null> => {
    if (!user) return null;
    return respondToDuelInvite(user.uid, inviteId, 'accepted');
  }, [user]);
  
  const declineInvite = useCallback(async (inviteId: string): Promise<void> => {
    if (!user) return;
    await respondToDuelInvite(user.uid, inviteId, 'declined');
  }, [user]);
  
  return {
    invites,
    hasInvites: invites.length > 0,
    acceptInvite,
    declineInvite,
  };
}
