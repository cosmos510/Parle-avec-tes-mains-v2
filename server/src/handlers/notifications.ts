import { Server, Socket } from 'socket.io';
import { getFirestore } from '../firebase';

export function setupNotificationHandlers(
  io: Server,
  socket: Socket,
  onlineUsers: Map<string, Set<string>>,
  socketToUser: Map<string, string>
) {
  // Send duel invitation
  socket.on('notification:duel_invite', async (data: {
    fromId: string;
    fromName: string;
    toId: string;
    roomId: string;
  }) => {
    const { fromId, fromName, toId, roomId } = data;
    
    // Send to target user's room (all their connected devices)
    io.to(`user:${toId}`).emit('notification:duel_invite', {
      fromId,
      fromName,
      roomId,
      timestamp: Date.now()
    });
    
    console.log(`[Notification] Duel invite: ${fromId} -> ${toId} for room ${roomId}`);
    
    // Also store in Firestore for offline users
    if (!onlineUsers.has(toId)) {
      try {
        const db = getFirestore();
        await db.collection('users').doc(toId).collection('notifications').add({
          type: 'duel_invite',
          fromId,
          fromName,
          roomId,
          read: false,
          createdAt: new Date()
        });
        console.log(`[Notification] Stored offline notification for ${toId}`);
      } catch (error) {
        console.error('[Notification] Firestore error:', error);
      }
    }
  });

  // Send friend request notification
  socket.on('notification:friend_request', async (data: {
    fromId: string;
    fromName: string;
    toId: string;
  }) => {
    const { fromId, fromName, toId } = data;
    
    io.to(`user:${toId}`).emit('notification:friend_request', {
      fromId,
      fromName,
      timestamp: Date.now()
    });
    
    console.log(`[Notification] Friend request: ${fromId} -> ${toId}`);
  });

  // Friend request accepted notification
  socket.on('notification:friend_accepted', async (data: {
    fromId: string;
    fromName: string;
    toId: string;
  }) => {
    const { fromId, fromName, toId } = data;
    
    io.to(`user:${toId}`).emit('notification:friend_accepted', {
      fromId,
      fromName,
      timestamp: Date.now()
    });
    
    console.log(`[Notification] Friend accepted: ${fromId} -> ${toId}`);
  });

  // Mark notification as read
  socket.on('notification:mark_read', async (data: {
    odId: string;
    notificationId: string;
  }) => {
    try {
      const db = getFirestore();
      await db
        .collection('users')
        .doc(data.odId)
        .collection('notifications')
        .doc(data.notificationId)
        .update({ read: true });
    } catch (error) {
      console.error('[Notification] Mark read error:', error);
    }
  });

  // Get unread notifications count
  socket.on('notification:get_unread', async (data: { odId: string }, callback) => {
    try {
      const db = getFirestore();
      const snapshot = await db
        .collection('users')
        .doc(data.odId)
        .collection('notifications')
        .where('read', '==', false)
        .count()
        .get();
      
      callback({ count: snapshot.data().count });
    } catch (error) {
      console.error('[Notification] Get unread error:', error);
      callback({ count: 0 });
    }
  });
}
