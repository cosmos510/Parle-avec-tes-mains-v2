'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/contexts/SocketContext';
import { 
  getFriendsAndPending,
  ensureUserProfile,
  type FriendInfo
} from '@/lib/friends-service';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Clock } from 'lucide-react';
import { FriendsList } from './_components/FriendsList';
import { SearchUsers } from './_components/SearchUsers';
import { PendingRequests } from './_components/PendingRequests';
import { DuelInviteNotification } from './_components/DuelInviteNotification';

export default function FriendsPage() {
  const { user, loading } = useAuth();
  const { onlineUsers } = useSocket();
  const router = useRouter();
  const [friendsBase, setFriendsBase] = useState<Omit<FriendInfo, 'status' | 'lastSeen'>[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    incoming: { odId: string; displayName: string; photoURL?: string }[];
    outgoing: { odId: string; displayName: string; photoURL?: string }[];
  }>({ incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  
  // Combiner les données d'amis avec le statut en ligne du socket (temps réel)
  const friends: FriendInfo[] = useMemo(() => {
    return friendsBase.map(friend => ({
      ...friend,
      status: onlineUsers.has(friend.odId) ? 'online' as const : 'offline' as const,
      lastSeen: undefined,
    })).sort((a, b) => {
      // En ligne d'abord
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (b.status === 'online' && a.status !== 'online') return 1;
      return 0;
    });
  }, [friendsBase, onlineUsers]);
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, loading]);
  
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // S'assurer que le profil existe
      await ensureUserProfile(user);
      
      // Charger amis + demandes en une seule requête
      const data = await getFriendsAndPending(user.uid);
      
      setFriendsBase(data.friends);
      setPendingRequests(data.pending);
    } catch (error) {
      console.error('Erreur chargement données amis:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
      </main>
    );
  }
  
  if (!user) {
    return null;
  }
  
  const totalPending = pendingRequests.incoming.length;
  
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      <Navbar />
      
      {/* Notification d'invitation de duel */}
      <DuelInviteNotification />
      
      <main className="flex-1 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/play" 
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              ← Retour au hub
            </Link>
          </div>
          
          <h1 className="text-2xl font-black mb-8">Amis</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl p-1 mb-6">
              <TabsTrigger value="friends">
                <Users className="w-4 h-4 mr-2" />
                Amis ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                <Clock className="w-4 h-4 mr-2" />
                En attente
                {totalPending > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalPending}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends">
              <FriendsList 
                friends={friends} 
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>
            
            <TabsContent value="search">
              <SearchUsers 
                currentUserId={user.uid}
                onRequestSent={loadData}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <PendingRequests 
                incoming={pendingRequests.incoming}
                outgoing={pendingRequests.outgoing}
                onUpdate={loadData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
