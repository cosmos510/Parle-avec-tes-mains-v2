/**
 * Service de présence - Statut en ligne des utilisateurs
 * Utilise Firebase Realtime Database pour les mises à jour en temps réel
 */

import { ref, set, onValue, onDisconnect, get } from 'firebase/database';
import { realtimeDb } from './firebase';

// Types
export interface PresenceData {
  status: 'online' | 'offline' | 'in-game';
  lastSeen: number;
  currentRoom?: string;
}

/**
 * Met à jour le statut de présence d'un utilisateur
 */
export function setPresence(
  userId: string, 
  status: 'online' | 'offline' | 'in-game', 
  roomId?: string
): void {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  
  // Firebase n'accepte pas undefined, on omet la propriété si non définie
  const presenceData: PresenceData = {
    status,
    lastSeen: Date.now(),
  };
  
  if (roomId) {
    presenceData.currentRoom = roomId;
  }
  
  set(presenceRef, presenceData);
  
  // Configurer auto-offline à la déconnexion
  if (status !== 'offline') {
    onDisconnect(presenceRef).set({
      status: 'offline',
      lastSeen: Date.now(),
    });
  }
}

/**
 * Récupère le statut de présence d'un utilisateur
 */
export async function getPresence(userId: string): Promise<PresenceData | null> {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  const snapshot = await get(presenceRef);
  return snapshot.val() as PresenceData | null;
}

/**
 * Écoute les changements de présence d'un utilisateur en temps réel
 */
export function subscribeToPresence(
  userId: string, 
  callback: (presence: PresenceData | null) => void
): () => void {
  const presenceRef = ref(realtimeDb, `presence/${userId}`);
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    callback(snapshot.val() as PresenceData | null);
  });
  
  return unsubscribe;
}
