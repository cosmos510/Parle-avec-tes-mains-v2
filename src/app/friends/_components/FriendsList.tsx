'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  removeFriend, 
  sendDuelInvite,
  type FriendInfo 
} from '@/lib/friends-service';
import { createDuelRoom } from '@/lib/duel-service';
import { 
  Users, 
  Swords, 
  UserMinus, 
  Loader2,
  Circle
} from 'lucide-react';

interface FriendsListProps {
  friends: FriendInfo[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function FriendsList({ friends, isLoading, onRefresh }: FriendsListProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  const handleInviteDuel = async (friend: FriendInfo) => {
    if (!user) return;
    
    setInvitingId(friend.odId);
    try {
      // Créer une room
      const roomId = await createDuelRoom(user);
      
      // Envoyer l'invitation
      await sendDuelInvite(user, friend.odId, roomId);
      
      // Rediriger vers la room
      router.push(`/duel?room=${roomId}`);
    } catch (error) {
      console.error('Erreur invitation:', error);
      alert('Erreur lors de l\'invitation');
    } finally {
      setInvitingId(null);
    }
  };
  
  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    if (!confirm('Retirer cet ami de ta liste ?')) return;
    
    setRemovingId(friendId);
    try {
      await removeFriend(user.uid, friendId);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression ami:', error);
    } finally {
      setRemovingId(null);
    }
  };
  
  const getStatusColor = (status: FriendInfo['status']) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'in-game': return 'text-yellow-500';
      case 'offline': return 'text-neutral-400';
    }
  };
  
  const getStatusText = (status: FriendInfo['status']) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'in-game': return 'En partie';
      case 'offline': return 'Hors ligne';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }
  
  if (friends.length === 0) {
    return (
      <div className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
        <h3 className="text-lg font-semibold mb-2">
          Pas encore d'amis
        </h3>
        <p className="text-neutral-500">
          Recherche des joueurs pour les ajouter en ami et les defier en duel.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <div 
          key={friend.odId}
          className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                {friend.photoURL ? (
                  <img 
                    src={friend.photoURL} 
                    alt={friend.displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  friend.displayName.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Info */}
              <div>
                <h4 className="font-semibold">
                  {friend.displayName}
                </h4>
                <div className="flex items-center gap-1.5 text-sm">
                  <Circle className={`w-2 h-2 fill-current ${getStatusColor(friend.status)}`} />
                  <span className={getStatusColor(friend.status)}>
                    {getStatusText(friend.status)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {friend.status !== 'in-game' && (
                <button
                  onClick={() => handleInviteDuel(friend)}
                  disabled={invitingId === friend.odId || friend.status === 'offline'}
                  className="px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {invitingId === friend.odId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      Defier
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => handleRemoveFriend(friend.odId)}
                disabled={removingId === friend.odId}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {removingId === friend.odId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserMinus className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
