/**
 * Service de gestion des amis
 * Gère les profils utilisateurs, demandes d'amis et liste d'amis
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getPresence } from './presence-service';
import type { User } from 'firebase/auth';

// Types
export interface UserProfile {
  odId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  friends: string[];
  friendRequests: {
    incoming: string[];
    outgoing: string[];
  };
  stats?: {
    gamesPlayed: number;
    wins: number;
  };
}

export interface FriendInfo {
  odId: string;
  displayName: string;
  photoURL?: string;
  status: 'online' | 'offline' | 'in-game';
  lastSeen?: number;
}

// Re-export des types des autres services
export type { PresenceData } from './presence-service';
export type { DuelInvite } from './duel-invite-service';

// Re-export des fonctions des autres services pour faciliter les imports
export { setPresence, subscribeToPresence } from './presence-service';
export { 
  sendDuelInvite, 
  subscribeToDuelInvites, 
  respondToDuelInvite, 
  cancelDuelInvite 
} from './duel-invite-service';

// ========== PROFILS UTILISATEURS ==========

/**
 * Crée ou met à jour le profil utilisateur avec les champs nécessaires pour le système d'amis
 */
export async function ensureUserProfile(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const profile: UserProfile = {
      odId: user.uid,
      displayName: user.displayName || 'Joueur',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      createdAt: Timestamp.now(),
      friends: [],
      friendRequests: {
        incoming: [],
        outgoing: [],
      },
    };
    await setDoc(userRef, profile);
  } else {
    // Mettre à jour les infos de base si elles ont changé
    await updateDoc(userRef, {
      displayName: user.displayName || 'Joueur',
      photoURL: user.photoURL || null,
    });
  }
}

/**
 * Récupère le profil d'un utilisateur par son ID
 */
export async function getUserProfile(odId: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', odId);
  const snapshot = await getDoc(userRef);
  
  if (snapshot.exists()) {
    const data = snapshot.data() as UserProfile;
    // S'assurer que odId est toujours défini
    return {
      ...data,
      odId: data.odId || snapshot.id,
    };
  }
  return null;
}

/**
 * Recherche des utilisateurs via l'API sécurisée côté serveur
 */
export async function searchUsers(searchTerm: string, currentUserId: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  try {
    const response = await fetch('/api/users/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm, currentUserId }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API recherche:', response.status, errorData);
      throw new Error(errorData.details || errorData.error || 'Erreur recherche');
    }
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Erreur recherche utilisateurs:', error);
    return [];
  }
}

// ========== GESTION DES DEMANDES D'AMIS ==========

/**
 * Helper pour récupérer le token d'authentification
 */
async function getAuthToken(): Promise<string> {
  const { getAuth } = await import('firebase/auth');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('Non connecté');
  return user.getIdToken();
}

/**
 * Envoie une demande d'ami via l'API serveur
 */
export async function sendFriendRequest(fromUserId: string, toUserId: string): Promise<{ status: 'pending' | 'accepted'; message: string }> {
  const token = await getAuthToken();
  
  const response = await fetch('/api/friends/request', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ toUserId }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de l\'envoi');
  }
  
  return { status: data.status, message: data.message };
}

/**
 * Accepte une demande d'ami via l'API serveur
 */
export async function acceptFriendRequest(userId: string, fromUserId: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch('/api/friends/respond', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fromUserId, action: 'accept' }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de l\'acceptation');
  }
}

/**
 * Refuse une demande d'ami via l'API serveur
 */
export async function declineFriendRequest(userId: string, fromUserId: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch('/api/friends/respond', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fromUserId, action: 'decline' }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du refus');
  }
}

/**
 * Annule une demande d'ami envoyée via l'API serveur
 */
export async function cancelFriendRequest(userId: string, toUserId: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch('/api/friends/remove', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ odId: toUserId, type: 'outgoing' }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de l\'annulation');
  }
}

/**
 * Supprime un ami de la liste via l'API serveur
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch('/api/friends/remove', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ odId: friendId, type: 'friend' }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de la suppression');
  }
}

// ========== RÉCUPÉRATION DES DONNÉES ==========

/**
 * Récupère la liste des amis avec leur statut de présence
 */
export async function getFriendsWithStatus(userId: string): Promise<FriendInfo[]> {
  const profile = await getUserProfile(userId);
  
  if (!profile?.friends?.length) {
    return [];
  }
  
  // Récupérer tous les profils et présences EN PARALLÈLE
  const friendsData = await Promise.all(
    profile.friends.map(async (friendId) => {
      const [friendProfile, presence] = await Promise.all([
        getUserProfile(friendId),
        getPresence(friendId),
      ]);
      return { friendProfile, presence };
    })
  );
  
  const friends: FriendInfo[] = friendsData
    .filter(({ friendProfile }) => friendProfile !== null)
    .map(({ friendProfile, presence }) => ({
      odId: friendProfile!.odId,
      displayName: friendProfile!.displayName,
      photoURL: friendProfile!.photoURL,
      status: presence?.status || 'offline',
      lastSeen: presence?.lastSeen,
    }));
  
  // Trier: en ligne > en jeu > hors ligne
  return friends.sort((a, b) => {
    const statusOrder = { 'online': 0, 'in-game': 1, 'offline': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

/**
 * Récupère les demandes d'amis en attente (reçues et envoyées)
 */
export async function getPendingRequests(userId: string): Promise<{
  incoming: UserProfile[];
  outgoing: UserProfile[];
}> {
  const profile = await getUserProfile(userId);
  
  if (!profile) {
    return { incoming: [], outgoing: [] };
  }
  
  const incomingIds = profile.friendRequests?.incoming || [];
  const outgoingIds = profile.friendRequests?.outgoing || [];
  
  // Récupérer tous les profils EN PARALLÈLE
  const [incomingProfiles, outgoingProfiles] = await Promise.all([
    Promise.all(incomingIds.map(id => getUserProfile(id))),
    Promise.all(outgoingIds.map(id => getUserProfile(id))),
  ]);
  
  const incoming = incomingProfiles.filter((u): u is UserProfile => u !== null && !!u.odId);
  const outgoing = outgoingProfiles.filter((u): u is UserProfile => u !== null && !!u.odId);
  
  return { incoming, outgoing };
}
