'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { setPresence } from '@/lib/presence-service';

/**
 * Hook pour gérer la présence utilisateur
 * Met automatiquement le statut en ligne quand l'utilisateur est connecté
 */
export function usePresence(status: 'online' | 'in-game' = 'online', roomId?: string) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Mettre le statut
    setPresence(user.uid, status, roomId);
    
    // Gérer la fermeture de la page
    const handleBeforeUnload = () => {
      setPresence(user.uid, 'offline');
    };
    
    // Gérer la visibilité de la page
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPresence(user.uid, 'offline');
      } else {
        setPresence(user.uid, status, roomId);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Mettre hors ligne au démontage
      setPresence(user.uid, 'offline');
    };
  }, [user, status, roomId]);
}
