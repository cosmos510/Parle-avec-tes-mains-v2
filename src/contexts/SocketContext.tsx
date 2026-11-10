'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';

interface DuelInvite {
  fromId: string;
  fromName: string;
  roomId: string;
  timestamp: number;
}

interface FriendNotification {
  type: 'request' | 'accepted';
  fromId: string;
  fromName: string;
  timestamp: number;
}

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  
  // Notifications
  duelInvites: DuelInvite[];
  friendNotifications: FriendNotification[];
  clearDuelInvite: (roomId: string) => void;
  clearFriendNotification: (fromId: string) => void;
  
  // Presence
  checkOnlineStatus: (odIds: string[]) => Promise<Record<string, boolean>>;
  
  // Duel actions
  createDuelRoom: (displayName: string) => Promise<{ roomId: string; wordLength: number } | null>;
  joinDuelRoom: (roomId: string, displayName: string) => Promise<{ wordLength: number } | null>;
  setReady: (roomId: string, ready: boolean) => void;
  startDuel: (roomId: string) => void;
  submitScore: (roomId: string, time: number) => void;
  leaveDuelRoom: (roomId: string) => void;
  
  // Notification actions
  sendDuelInvite: (toId: string, roomId: string, displayName: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [duelInvites, setDuelInvites] = useState<DuelInvite[]>([]);
  const [friendNotifications, setFriendNotifications] = useState<FriendNotification[]>([]);
  
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        disconnectSocket();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    const s = getSocket();
    
    // Always update Firebase presence when user is authenticated
    import('@/lib/presence-service').then(({ setPresence }) => {
      setPresence(user.uid, 'online');
    });
    
    // If socket is not available (no URL configured), skip socket setup
    if (!s) {
      console.log('[SocketContext] Socket not available, using Firebase presence only');
      return;
    }
    
    socketRef.current = s;
    setSocket(s);

    // Connection handlers
    const onConnect = () => {
      setIsConnected(true);
      // Announce presence via socket
      s.emit('presence:online', { 
        odId: user.uid,
        displayName: user.displayName 
      });
      // Also update Firebase for backwards compatibility
      import('@/lib/presence-service').then(({ setPresence }) => {
        setPresence(user.uid, 'online');
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Presence handlers
    const onOnlineUsers = (data: { users: string[] }) => {
      setOnlineUsers(new Set(data.users));
    };

    const onUserOnline = (data: { odId: string }) => {
      setOnlineUsers(prev => new Set([...prev, data.odId]));
    };

    const onUserOffline = (data: { odId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(data.odId);
        return next;
      });
    };

    // Notification handlers
    const onDuelInvite = (data: DuelInvite) => {
      setDuelInvites(prev => [...prev, data]);
      // Play notification sound if available
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}
    };

    const onFriendRequest = (data: { fromId: string; fromName: string; timestamp: number }) => {
      setFriendNotifications(prev => [...prev, { ...data, type: 'request' }]);
    };

    const onFriendAccepted = (data: { fromId: string; fromName: string; timestamp: number }) => {
      setFriendNotifications(prev => [...prev, { ...data, type: 'accepted' }]);
    };

    // Setup listeners
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('presence:online_users', onOnlineUsers);
    s.on('user:online', onUserOnline);
    s.on('user:offline', onUserOffline);
    s.on('notification:duel_invite', onDuelInvite);
    s.on('notification:friend_request', onFriendRequest);
    s.on('notification:friend_accepted', onFriendAccepted);

    // Connect
    connectSocket();

    // Cleanup
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('presence:online_users', onOnlineUsers);
      s.off('user:online', onUserOnline);
      s.off('user:offline', onUserOffline);
      s.off('notification:duel_invite', onDuelInvite);
      s.off('notification:friend_request', onFriendRequest);
      s.off('notification:friend_accepted', onFriendAccepted);
      
      // Announce offline before disconnect
      s.emit('presence:offline', { odId: user.uid });
    };
  }, [user]);

  // Clear notifications
  const clearDuelInvite = useCallback((roomId: string) => {
    setDuelInvites(prev => prev.filter(inv => inv.roomId !== roomId));
  }, []);

  const clearFriendNotification = useCallback((fromId: string) => {
    setFriendNotifications(prev => prev.filter(n => n.fromId !== fromId));
  }, []);

  // Check online status of multiple users
  const checkOnlineStatus = useCallback((odIds: string[]): Promise<Record<string, boolean>> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        // Fallback: check against local state
        const result: Record<string, boolean> = {};
        odIds.forEach(id => {
          result[id] = onlineUsers.has(id);
        });
        resolve(result);
        return;
      }
      
      socketRef.current.emit('presence:check', { odIds }, (response: { statuses: Record<string, boolean> }) => {
        resolve(response.statuses);
      });
    });
  }, [onlineUsers]);

  // Duel actions
  const createDuelRoom = useCallback((displayName: string): Promise<{ roomId: string; wordLength: number } | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected || !user) {
        resolve(null);
        return;
      }
      
      socketRef.current.emit('duel:create', { odId: user.uid, displayName }, (response: { success: boolean; roomId?: string; wordLength?: number }) => {
        if (response.success && response.roomId && response.wordLength) {
          resolve({ roomId: response.roomId, wordLength: response.wordLength });
        } else {
          resolve(null);
        }
      });
    });
  }, [user]);

  const joinDuelRoom = useCallback((roomId: string, displayName: string): Promise<{ wordLength: number } | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected || !user) {
        resolve(null);
        return;
      }
      
      socketRef.current.emit('duel:join', { roomId, odId: user.uid, displayName }, (response: { success: boolean; wordLength?: number; error?: string }) => {
        if (response.success && response.wordLength) {
          resolve({ wordLength: response.wordLength });
        } else {
          console.error('[Duel] Join failed:', response.error);
          resolve(null);
        }
      });
    });
  }, [user]);

  const setReady = useCallback((roomId: string, ready: boolean) => {
    if (!socketRef.current?.connected || !user) return;
    socketRef.current.emit('duel:ready', { roomId, odId: user.uid, ready });
  }, [user]);

  const startDuel = useCallback((roomId: string) => {
    if (!socketRef.current?.connected || !user) return;
    socketRef.current.emit('duel:start', { roomId, odId: user.uid });
  }, [user]);

  const submitScore = useCallback((roomId: string, time: number) => {
    if (!socketRef.current?.connected || !user) return;
    socketRef.current.emit('duel:score', { roomId, odId: user.uid, time });
  }, [user]);

  const leaveDuelRoom = useCallback((roomId: string) => {
    if (!socketRef.current?.connected || !user) return;
    socketRef.current.emit('duel:leave', { roomId, odId: user.uid });
  }, [user]);

  // Send duel invite
  const sendDuelInvite = useCallback((toId: string, roomId: string, displayName: string) => {
    if (!socketRef.current?.connected || !user) return;
    socketRef.current.emit('notification:duel_invite', {
      fromId: user.uid,
      fromName: displayName,
      toId,
      roomId
    });
  }, [user]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    onlineUsers,
    duelInvites,
    friendNotifications,
    clearDuelInvite,
    clearFriendNotification,
    checkOnlineStatus,
    createDuelRoom,
    joinDuelRoom,
    setReady,
    startDuel,
    submitScore,
    leaveDuelRoom,
    sendDuelInvite,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
