import { io, Socket } from 'socket.io-client';

// Socket server URL - configure in .env.local
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  // Don't create socket if no URL configured
  if (!SOCKET_URL) {
    console.warn('[Socket] NEXT_PUBLIC_SOCKET_URL not configured, skipping socket connection');
    return null;
  }
  
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 5000, // Reduced timeout
      transports: ['websocket', 'polling'],
    });

    // Debug logs
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });
  }

  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (s && !s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// Type definitions for socket events
export interface SocketEvents {
  // Presence
  'presence:online': (data: { odId: string }) => void;
  'presence:offline': (data: { odId: string }) => void;
  'presence:online_users': (data: { users: string[] }) => void;
  'user:online': (data: { odId: string }) => void;
  'user:offline': (data: { odId: string }) => void;

  // Duel
  'duel:player_joined': (data: { odId: string; displayName: string; playerCount: number }) => void;
  'duel:player_ready': (data: { odId: string; ready: boolean }) => void;
  'duel:all_ready': () => void;
  'duel:countdown': (data: { count: number }) => void;
  'duel:start': (data: { word: string; startedAt: number }) => void;
  'duel:player_scored': (data: { odId: string; time: number }) => void;
  'duel:finished': (data: { winner: string; results: Array<{ odId: string; time: number }> }) => void;
  'duel:player_left': (data: { odId: string; playerCount: number }) => void;
  'duel:room_closed': () => void;

  // Notifications
  'notification:duel_invite': (data: { fromId: string; fromName: string; roomId: string; timestamp: number }) => void;
  'notification:friend_request': (data: { fromId: string; fromName: string; timestamp: number }) => void;
  'notification:friend_accepted': (data: { fromId: string; fromName: string; timestamp: number }) => void;
}
