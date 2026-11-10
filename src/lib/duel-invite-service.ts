/**
 * Service d'invitations de duel
 * Permet d'inviter des amis à rejoindre une partie en temps réel
 */

import { ref, set, onValue, remove, get } from 'firebase/database';
import { realtimeDb } from './firebase';
import type { User } from 'firebase/auth';

// Types
export interface DuelInvite {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromPhotoURL?: string;
  roomId: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

/**
 * Envoie une invitation de duel à un ami
 * L'invitation expire automatiquement après 60 secondes
 */
export async function sendDuelInvite(
  fromUser: User,
  toUserId: string,
  roomId: string
): Promise<string> {
  const inviteId = `${fromUser.uid}_${toUserId}_${Date.now()}`;
  const inviteRef = ref(realtimeDb, `duelInvites/${toUserId}/${inviteId}`);
  
  const invite: DuelInvite = {
    id: inviteId,
    fromUserId: fromUser.uid,
    fromDisplayName: fromUser.displayName || 'Joueur',
    roomId,
    timestamp: Date.now(),
    status: 'pending',
  };
  
  // Ajouter photoURL seulement si défini (Firebase n'accepte pas undefined)
  if (fromUser.photoURL) {
    invite.fromPhotoURL = fromUser.photoURL;
  }
  
  await set(inviteRef, invite);
  
  // Auto-suppression après 60 secondes
  setTimeout(() => {
    remove(inviteRef);
  }, 60000);
  
  return inviteId;
}

/**
 * Écoute les invitations de duel entrantes en temps réel
 */
export function subscribeToDuelInvites(
  userId: string,
  callback: (invites: DuelInvite[]) => void
): () => void {
  const invitesRef = ref(realtimeDb, `duelInvites/${userId}`);
  
  const unsubscribe = onValue(invitesRef, (snapshot) => {
    if (snapshot.exists()) {
      const invites: DuelInvite[] = [];
      snapshot.forEach((child) => {
        const invite = child.val() as DuelInvite;
        if (invite.status === 'pending') {
          invites.push(invite);
        }
      });
      callback(invites);
    } else {
      callback([]);
    }
  });
  
  return unsubscribe;
}

/**
 * Répond à une invitation de duel
 * Retourne le roomId si accepté, null sinon
 */
export async function respondToDuelInvite(
  userId: string,
  inviteId: string,
  response: 'accepted' | 'declined'
): Promise<string | null> {
  const inviteRef = ref(realtimeDb, `duelInvites/${userId}/${inviteId}`);
  const snapshot = await get(inviteRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const invite = snapshot.val() as DuelInvite;
  
  // Supprimer l'invitation
  await remove(inviteRef);
  
  if (response === 'accepted') {
    return invite.roomId;
  }
  
  return null;
}

/**
 * Annule une invitation envoyée
 */
export async function cancelDuelInvite(toUserId: string, inviteId: string): Promise<void> {
  const inviteRef = ref(realtimeDb, `duelInvites/${toUserId}/${inviteId}`);
  await remove(inviteRef);
}
