import { Server, Socket } from 'socket.io';
import { getFirestore, getAuth } from '../firebase';

// Cache pour les utilisateurs authentifiés (évite de re-vérifier à chaque événement)
const authenticatedSockets = new Map<string, string>(); // socketId -> odId

/**
 * Vérifie le token Firebase et retourne l'UID de l'utilisateur
 * @throws Error si le token est invalide
 */
async function verifyToken(token: string): Promise<string> {
  const auth = getAuth();
  const decodedToken = await auth.verifyIdToken(token);
  return decodedToken.uid;
}

/**
 * Middleware d'authentification pour les événements Socket.io
 * Vérifie que le socket est authentifié et que l'odId correspond
 */
function requireAuth(socket: Socket, odId: string): boolean {
  const authenticatedOdId = authenticatedSockets.get(socket.id);
  if (!authenticatedOdId || authenticatedOdId !== odId) {
    console.warn(`[Auth] Unauthorized socket ${socket.id} tried to act as ${odId}`);
    return false;
  }
  return true;
}

export function setupPresenceHandlers(
  io: Server,
  socket: Socket,
  onlineUsers: Map<string, Set<string>>,
  socketToUser: Map<string, string>
) {
  // User comes online - REQUIRES TOKEN VERIFICATION
  socket.on('presence:online', async (data: { odId: string; token?: string }) => {
    const { odId, token } = data;
    
    // Vérifier le token Firebase
    if (!token) {
      socket.emit('auth:error', { message: 'Token manquant' });
      console.warn(`[Auth] No token provided by socket ${socket.id}`);
      return;
    }
    
    try {
      const verifiedUid = await verifyToken(token);
      
      // Vérifier que l'odId correspond au token
      if (verifiedUid !== odId) {
        socket.emit('auth:error', { message: 'Token invalide pour cet utilisateur' });
        console.warn(`[Auth] Token mismatch: claimed ${odId}, actual ${verifiedUid}`);
        return;
      }
      
      // Marquer le socket comme authentifié
      authenticatedSockets.set(socket.id, odId);
      
    } catch (error) {
      socket.emit('auth:error', { message: 'Token invalide ou expiré' });
      console.warn(`[Auth] Invalid token for socket ${socket.id}:`, error);
      return;
    }
    
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
    
    // Vérifier l'authentification
    if (!requireAuth(socket, odId)) {
      socket.emit('auth:error', { message: 'Non autorisé' });
      return;
    }
    
    // Nettoyer le cache d'authentification
    authenticatedSockets.delete(socket.id);
    
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
    // Cette route est publique car elle ne modifie rien
    // et l'info de présence est semi-publique
    const statuses: Record<string, boolean> = {};
    for (const odId of data.odIds) {
      statuses[odId] = onlineUsers.has(odId);
    }
    callback({ statuses });
  });
  
  // Cleanup on disconnect
  socket.on('disconnect', () => {
    authenticatedSockets.delete(socket.id);
  });
}

// Export pour les autres handlers
export { authenticatedSockets, requireAuth };
