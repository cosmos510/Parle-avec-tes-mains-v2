import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './firebase';
import { setupPresenceHandlers } from './handlers/presence';
import { setupDuelHandlers } from './handlers/duel';
import { setupNotificationHandlers } from './handlers/notifications';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS config
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://parle-avec-tes-mains.vercel.app'
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Firebase Admin
initializeFirebase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount
  });
});

// Track online users: Map<odId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>();

// Track user sockets: Map<socketId, odId>
const socketToUser = new Map<string, string>();

// Track duel rooms: Map<roomId, DuelRoomState>
interface DuelRoomState {
  id: string;
  players: Map<string, { odId: string; socketId: string; ready: boolean }>;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  word?: string;
  startedAt?: number;
}
const duelRooms = new Map<string, DuelRoomState>();

// Socket connection handler
io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // Setup handlers
  setupPresenceHandlers(io, socket, onlineUsers, socketToUser);
  setupDuelHandlers(io, socket, duelRooms, socketToUser);
  setupNotificationHandlers(io, socket, onlineUsers, socketToUser);

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Disconnected: ${socket.id} - ${reason}`);
    
    const odId = socketToUser.get(socket.id);
    if (odId) {
      const userSockets = onlineUsers.get(odId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(odId);
          // Broadcast user went offline
          io.emit('user:offline', { odId });
          console.log(`[Presence] User offline: ${odId}`);
        }
      }
      socketToUser.delete(socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📡 Allowed origins: ${allowedOrigins.join(', ')}`);
});
