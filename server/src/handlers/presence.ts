import { Server, Socket } from 'socket.io';
import { getFirestore } from '../firebase';

export function setupPresenceHandlers(
  io: Server,
  socket: Socket,
  onlineUsers: Map<string, Set<string>>,
  socketToUser: Map<string, string>
) {
  // User comes online
  socket.on('presence:online', async (data: { odId: string; token?: string }) => {
    const { odId } = data;
    
    // TODO: Verify token with Firebase Auth if needed
    // For now, trust the client
    
    // Track this socket for this user
    if (!onlineUsers.has(odId)) {
      onlineUsers.set(odId, new Set());
    }
    onlineUsers.get(odId)!.add(socket.id);
    socketToUser.set(socket.id, odId);
    
    // Join user's personal room for targeted notifications
    socket.join(`user:${odId}`);
    
    // Update Firestore presence
    try {
      const db = getFirestore();
      await db.collection('users').doc(odId).update({
        isOnline: true,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('[Presence] Firestore update error:', error);
    }
    
    // Broadcast to all that this user is online
    io.emit('user:online', { odId });
    console.log(`[Presence] User online: ${odId}`);
    
    // Send back list of currently online users
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit('presence:online_users', { users: onlineList });
  });

  // User goes offline (explicit)
  socket.on('presence:offline', async (data: { odId: string }) => {
    const { odId } = data;
    
    const userSockets = onlineUsers.get(odId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(odId);
        
        // Update Firestore
        try {
          const db = getFirestore();
          await db.collection('users').doc(odId).update({
            isOnline: false,
            lastSeen: new Date()
          });
        } catch (error) {
          console.error('[Presence] Firestore update error:', error);
        }
        
        io.emit('user:offline', { odId });
        console.log(`[Presence] User offline: ${odId}`);
      }
    }
    socketToUser.delete(socket.id);
  });

  // Get online status of specific users (for friends list)
  socket.on('presence:check', (data: { odIds: string[] }, callback) => {
    const statuses: Record<string, boolean> = {};
    for (const odId of data.odIds) {
      statuses[odId] = onlineUsers.has(odId);
    }
    callback({ statuses });
  });
}
