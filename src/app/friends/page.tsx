'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePresence } from '@/hooks/usePresence';
import { 
  getUserProfile,
  getFriendsWithStatus,
  getPendingRequests,
  ensureUserProfile,
  type UserProfile,
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
  const router = useRouter();
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    incoming: UserProfile[];
    outgoing: UserProfile[];
  }>({ incoming: [], outgoing: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  
  // Activer la présence
  usePresence('online');
  
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    loadData();
  }, [user, loading, router]);
  
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // S'assurer que le profil existe
      await ensureUserProfile(user);
      
      // Charger les amis et les demandes
      const [friendsList, requests] = await Promise.all([
        getFriendsWithStatus(user.uid),
        getPendingRequests(user.uid),
      ]);
      
      setFriends(friendsList);
      setPendingRequests(requests);
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
