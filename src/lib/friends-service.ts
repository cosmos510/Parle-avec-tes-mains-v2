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
export async function searchUsers(searchTerm: string, _currentUserId?: string): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/users/search', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ searchTerm }),
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
 * Récupère les amis et demandes en attente en une seule requête API
 */
export async function getFriendsAndPending(userId: string): Promise<{
  friends: Omit<FriendInfo, 'status' | 'lastSeen'>[];
  pending: {
    incoming: { odId: string; displayName: string; photoURL?: string }[];
    outgoing: { odId: string; displayName: string; photoURL?: string }[];
  };
}> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch('/api/friends/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur chargement amis');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur getFriendsAndPending:', error);
    return { friends: [], pending: { incoming: [], outgoing: [] } };
  }
}

/**
 * @deprecated Utiliser getFriendsAndPending
 */
export async function getFriends(userId: string): Promise<Omit<FriendInfo, 'status' | 'lastSeen'>[]> {
  const data = await getFriendsAndPending(userId);
  return data.friends;
}

/**
 * @deprecated Utiliser getFriendsAndPending
 */
export async function getFriendsWithStatus(userId: string): Promise<FriendInfo[]> {
  const friends = await getFriends(userId);
  return friends.map(friend => ({
    ...friend,
    status: 'offline' as const,
    lastSeen: undefined,
  }));
}

/**
 * @deprecated Utiliser getFriendsAndPending
 */
export async function getPendingRequests(userId: string): Promise<{
  incoming: UserProfile[];
  outgoing: UserProfile[];
}> {
  const data = await getFriendsAndPending(userId);
  // Convertir en UserProfile (ajouter les champs manquants)
  return {
    incoming: data.pending.incoming.map(p => ({
      ...p,
      email: '',
      createdAt: Timestamp.now(),
      friends: [],
      friendRequests: { incoming: [], outgoing: [] },
    })),
    outgoing: data.pending.outgoing.map(p => ({
      ...p,
      email: '',
      createdAt: Timestamp.now(),
      friends: [],
      friendRequests: { incoming: [], outgoing: [] },
    })),
  };
}
