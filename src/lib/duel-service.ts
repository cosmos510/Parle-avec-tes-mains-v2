/**
 * Service pour les duels en temps réel avec Firebase Realtime Database
 */

import { ref, set, onValue, update, remove, get, onDisconnect } from 'firebase/database';
import { realtimeDb } from './firebase';
import type { User } from 'firebase/auth';

/**
 * Vérifie si la Realtime Database est configurée
 */
function checkRealtimeDbConfigured(): void {
  if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    throw new Error(
      "Firebase Realtime Database non configurée. Ajoute NEXT_PUBLIC_FIREBASE_DATABASE_URL dans ton .env.local"
    );
  }
}

// Types
export interface DuelPlayer {
  odId: string;
  displayName: string;
  photoURL: string | null;
  progress: number; // 0-26 lettres complétées
  currentLetter: string | null;
  finishTime: number | null;
  isReady: boolean;
  isConnected: boolean;
}

export interface DuelRoom {
  id: string;
  hostId: string;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  word: string;
  players: Record<string, DuelPlayer>;
  startTime: number | null;
  createdAt: number;
}

// Mots pour les duels (5-8 lettres)
const DUEL_WORDS = [
  "SIGNE", "MAINS", "PARLE", "JOUER", "AMIS",
  "SUPER", "BRAVO", "MERCI", "SALUT", "COOL",
  "LEARN", "HANDS", "PEACE", "HELLO", "WORLD"
];

/**
 * Génère un code de room court (6 caractères)
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crée une nouvelle room de duel
 */
export async function createDuelRoom(user: User): Promise<string> {
  checkRealtimeDbConfigured();
  
  const roomId = generateRoomCode();
  const word = DUEL_WORDS[Math.floor(Math.random() * DUEL_WORDS.length)];
  
  const roomRef = ref(realtimeDb, `duels/${roomId}`);
  
  const room: DuelRoom = {
    id: roomId,
    hostId: user.uid,
    status: 'waiting',
    word,
    players: {
      [user.uid]: {
        odId: user.uid,
        displayName: user.displayName || 'Joueur 1',
        photoURL: user.photoURL || null,
        progress: 0,
        currentLetter: null,
        finishTime: null,
        isReady: false,
        isConnected: true,
      }
    },
    startTime: null,
    createdAt: Date.now(),
  };
  
  await set(roomRef, room);
  
  // Auto-suppression si le joueur se déconnecte
  const playerRef = ref(realtimeDb, `duels/${roomId}/players/${user.uid}/isConnected`);
  onDisconnect(playerRef).set(false);
  
  return roomId;
}

/**
 * Rejoint une room existante
 */
export async function joinDuelRoom(roomId: string, user: User): Promise<DuelRoom | null> {
  checkRealtimeDbConfigured();
  
  const roomRef = ref(realtimeDb, `duels/${roomId}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const room = snapshot.val() as DuelRoom;
  
  // Vérifier si la room est pleine (max 2 joueurs)
  const playerCount = Object.keys(room.players || {}).length;
  if (playerCount >= 2 && !room.players[user.uid]) {
    throw new Error('Room pleine');
  }
  
  // Vérifier si la partie n'a pas déjà commencé
  if (room.status !== 'waiting') {
    throw new Error('Partie déjà en cours');
  }
  
  // Ajouter le joueur
  const playerRef = ref(realtimeDb, `duels/${roomId}/players/${user.uid}`);
  const player: DuelPlayer = {
    odId: user.uid,
    displayName: user.displayName || 'Joueur 2',
    photoURL: user.photoURL || null,
    progress: 0,
    currentLetter: null,
    finishTime: null,
    isReady: false,
    isConnected: true,
  };
  
  await set(playerRef, player);
  
  // Auto-déconnexion
  const connectedRef = ref(realtimeDb, `duels/${roomId}/players/${user.uid}/isConnected`);
  onDisconnect(connectedRef).set(false);
  
  return { ...room, players: { ...room.players, [user.uid]: player } };
}

/**
 * Marque le joueur comme prêt
 */
export async function setPlayerReady(roomId: string, odId: string, ready: boolean): Promise<void> {
  const playerRef = ref(realtimeDb, `duels/${roomId}/players/${odId}/isReady`);
  await set(playerRef, ready);
}

/**
 * Lance le countdown (host seulement)
 */
export async function startDuelCountdown(roomId: string): Promise<void> {
  const roomRef = ref(realtimeDb, `duels/${roomId}`);
  await update(roomRef, {
    status: 'countdown',
  });
  
  // Après 3 secondes, passer en mode playing
  setTimeout(async () => {
    await update(roomRef, {
      status: 'playing',
      startTime: Date.now(),
    });
  }, 3000);
}

/**
 * Met à jour la progression d'un joueur
 */
export async function updatePlayerProgress(
  roomId: string, 
  odId: string, 
  progress: number, 
  currentLetter: string | null
): Promise<void> {
  const playerRef = ref(realtimeDb, `duels/${roomId}/players/${odId}`);
  await update(playerRef, {
    progress,
    currentLetter,
  });
}

/**
 * Marque un joueur comme ayant terminé
 */
export async function finishDuel(roomId: string, odId: string, finishTime: number): Promise<void> {
  const playerRef = ref(realtimeDb, `duels/${roomId}/players/${odId}`);
  await update(playerRef, {
    finishTime,
    progress: -1, // -1 = terminé
  });
  
  // Vérifier si tous ont terminé
  const roomRef = ref(realtimeDb, `duels/${roomId}`);
  const snapshot = await get(roomRef);
  const room = snapshot.val() as DuelRoom;
  
  const allFinished = Object.values(room.players).every(p => p.finishTime !== null);
  if (allFinished) {
    await update(roomRef, { status: 'finished' });
  }
}

/**
 * Écoute les changements d'une room
 */
export function subscribeToDuelRoom(
  roomId: string, 
  callback: (room: DuelRoom | null) => void
): () => void {
  const roomRef = ref(realtimeDb, `duels/${roomId}`);
  
  const unsubscribe = onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as DuelRoom);
    } else {
      callback(null);
    }
  });
  
  return unsubscribe;
}

/**
 * Quitte une room (supprime le joueur ou la room entière si host)
 */
export async function leaveDuelRoom(roomId: string, odId: string, isHost: boolean): Promise<void> {
  if (isHost) {
    // Supprimer toute la room
    const roomRef = ref(realtimeDb, `duels/${roomId}`);
    await remove(roomRef);
  } else {
    // Supprimer juste le joueur
    const playerRef = ref(realtimeDb, `duels/${roomId}/players/${odId}`);
    await remove(playerRef);
  }
}

/**
 * Nettoie les rooms abandonnées (plus de 10 minutes)
 */
export async function cleanupOldRooms(): Promise<void> {
  const duelsRef = ref(realtimeDb, 'duels');
  const snapshot = await get(duelsRef);
  
  if (!snapshot.exists()) return;
  
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  snapshot.forEach((child) => {
    const room = child.val() as DuelRoom;
    if (now - room.createdAt > tenMinutes && room.status === 'waiting') {
      remove(ref(realtimeDb, `duels/${child.key}`));
    }
  });
}
