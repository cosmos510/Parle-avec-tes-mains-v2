import { Server, Socket } from 'socket.io';
import { getFirestore } from '../firebase';
import { authenticatedSockets } from './presence';

/**
 * Vérifie que le socket est authentifié pour l'utilisateur donné
 */
function requireAuth(socket: Socket, odId: string): boolean {
  const authenticatedOdId = authenticatedSockets.get(socket.id);
  if (!authenticatedOdId || authenticatedOdId !== odId) {
    console.warn(`[Duel Auth] Unauthorized socket ${socket.id} tried to act as ${odId}`);
    return false;
  }
  return true;
}

interface DuelRoomState {
  id: string;
  players: Map<string, { odId: string; socketId: string; ready: boolean; score?: number }>;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  word?: string;
  startedAt?: number;
  hostId?: string;
}

// Word list for duels
const DUEL_WORDS = [
  'BONJOUR', 'MERCI', 'CHAT', 'CHIEN', 'MAISON',
  'SOLEIL', 'LUNE', 'ARBRE', 'FLEUR', 'OISEAU',
  'PAIN', 'EAU', 'CAFE', 'LIVRE', 'ECOLE'
];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getRandomWord(): string {
  return DUEL_WORDS[Math.floor(Math.random() * DUEL_WORDS.length)];
}

export function setupDuelHandlers(
  io: Server,
  socket: Socket,
  duelRooms: Map<string, DuelRoomState>,
  socketToUser: Map<string, string>
) {
  // Create a duel room
  socket.on('duel:create', (data: { odId: string; displayName: string }, callback) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      callback({ success: false, error: 'Non autorisé' });
      return;
    }
    
    const roomId = generateRoomCode();
    const word = getRandomWord();
    
    const room: DuelRoomState = {
      id: roomId,
      players: new Map(),
      status: 'waiting',
      word,
      hostId: data.odId
    };
    
    room.players.set(data.odId, {
      odId: data.odId,
      socketId: socket.id,
      ready: false
    });
    
    duelRooms.set(roomId, room);
    socket.join(`duel:${roomId}`);
    
    console.log(`[Duel] Room created: ${roomId} by ${data.odId}`);
    
    callback({ 
      success: true, 
      roomId,
      wordLength: word.length
    });
  });

  // Join a duel room
  socket.on('duel:join', (data: { roomId: string; odId: string; displayName: string }, callback) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      callback({ success: false, error: 'Non autorisé' });
      return;
    }
    
    const room = duelRooms.get(data.roomId);
    
    if (!room) {
      callback({ success: false, error: 'Room not found' });
      return;
    }
    
    if (room.players.size >= 2) {
      callback({ success: false, error: 'Room is full' });
      return;
    }
    
    if (room.status !== 'waiting') {
      callback({ success: false, error: 'Game already started' });
      return;
    }
    
    room.players.set(data.odId, {
      odId: data.odId,
      socketId: socket.id,
      ready: false
    });
    
    socket.join(`duel:${data.roomId}`);
    
    // Notify room
    io.to(`duel:${data.roomId}`).emit('duel:player_joined', {
      odId: data.odId,
      displayName: data.displayName,
      playerCount: room.players.size
    });
    
    console.log(`[Duel] ${data.odId} joined room ${data.roomId}`);
    
    callback({ 
      success: true,
      wordLength: room.word?.length
    });
  });

  // Player ready toggle
  socket.on('duel:ready', (data: { roomId: string; odId: string; ready: boolean }) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      return;
    }
    
    const room = duelRooms.get(data.roomId);
    if (!room) return;
    
    const player = room.players.get(data.odId);
    if (player) {
      player.ready = data.ready;
      
      io.to(`duel:${data.roomId}`).emit('duel:player_ready', {
        odId: data.odId,
        ready: data.ready
      });
      
      // Check if all players ready
      const allReady = room.players.size === 2 && 
        Array.from(room.players.values()).every(p => p.ready);
      
      if (allReady) {
        io.to(`duel:${data.roomId}`).emit('duel:all_ready');
      }
    }
  });

  // Start countdown (host only)
  socket.on('duel:start', (data: { roomId: string; odId: string }) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      return;
    }
    
    const room = duelRooms.get(data.roomId);
    if (!room || room.hostId !== data.odId) return;
    
    const allReady = room.players.size === 2 && 
      Array.from(room.players.values()).every(p => p.ready);
    
    if (!allReady) return;
    
    room.status = 'countdown';
    
    // 3-2-1 countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      io.to(`duel:${data.roomId}`).emit('duel:countdown', { count });
      count--;
      
      if (count < 0) {
        clearInterval(countdownInterval);
        room.status = 'playing';
        room.startedAt = Date.now();
        
        io.to(`duel:${data.roomId}`).emit('duel:start', {
          word: room.word,
          startedAt: room.startedAt
        });
        
        console.log(`[Duel] Game started in room ${data.roomId}: ${room.word}`);
      }
    }, 1000);
  });

  // Player scores (signed the word)
  socket.on('duel:score', async (data: { roomId: string; odId: string; time: number }) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      return;
    }
    
    const room = duelRooms.get(data.roomId);
    if (!room || room.status !== 'playing') return;
    
    const player = room.players.get(data.odId);
    if (player && player.score === undefined) {
      player.score = data.time;
      
      io.to(`duel:${data.roomId}`).emit('duel:player_scored', {
        odId: data.odId,
        time: data.time
      });
      
      // Check if game is over
      const allScored = Array.from(room.players.values()).every(p => p.score !== undefined);
      if (allScored) {
        room.status = 'finished';
        
        const results = Array.from(room.players.entries()).map(([odId, p]) => ({
          odId,
          time: p.score!
        })).sort((a, b) => a.time - b.time);
        
        const winner = results[0];
        
        io.to(`duel:${data.roomId}`).emit('duel:finished', {
          winner: winner.odId,
          results
        });
        
        console.log(`[Duel] Game finished in room ${data.roomId}, winner: ${winner.odId}`);
        
        // Update Firestore with results
        try {
          const db = getFirestore();
          const batch = db.batch();
          
          for (const result of results) {
            const userRef = db.collection('users').doc(result.odId);
            batch.update(userRef, {
              'duelStats.totalDuels': require('firebase-admin').firestore.FieldValue.increment(1),
              ...(result.odId === winner.odId && {
                'duelStats.wins': require('firebase-admin').firestore.FieldValue.increment(1)
              })
            });
          }
          
          await batch.commit();
        } catch (error) {
          console.error('[Duel] Firestore update error:', error);
        }
        
        // Clean up room after delay
        setTimeout(() => {
          duelRooms.delete(data.roomId);
          console.log(`[Duel] Room ${data.roomId} cleaned up`);
        }, 60000);
      }
    }
  });

  // Leave room
  socket.on('duel:leave', (data: { roomId: string; odId: string }) => {
    // Vérifier l'authentification
    if (!requireAuth(socket, data.odId)) {
      return;
    }
    
    const room = duelRooms.get(data.roomId);
    if (!room) return;
    
    room.players.delete(data.odId);
    socket.leave(`duel:${data.roomId}`);
    
    io.to(`duel:${data.roomId}`).emit('duel:player_left', {
      odId: data.odId,
      playerCount: room.players.size
    });
    
    // If room empty or host left, close it
    if (room.players.size === 0 || data.odId === room.hostId) {
      io.to(`duel:${data.roomId}`).emit('duel:room_closed');
      duelRooms.delete(data.roomId);
      console.log(`[Duel] Room ${data.roomId} closed`);
    }
  });
}
