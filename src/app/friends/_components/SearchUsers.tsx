'use client';

import { useState, useCallback } from 'react';
import { 
  searchUsers, 
  sendFriendRequest,
  getUserProfile,
  type UserProfile 
} from '@/lib/friends-service';
import { 
  Search, 
  UserPlus, 
  Loader2,
  Check,
  Clock
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect } from 'react';

interface SearchUsersProps {
  currentUserId: string;
  onRequestSent: () => void;
}

export function SearchUsers({ currentUserId, onRequestSent }: SearchUsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Charger le profil courant pour vérifier les amis/demandes existantes
  useEffect(() => {
    getUserProfile(currentUserId).then(setCurrentUserProfile);
  }, [currentUserId]);
  
  // Recherche automatique
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setResults([]);
      return;
    }
    
    const doSearch = async () => {
      setIsSearching(true);
      try {
        const users = await searchUsers(debouncedSearch, currentUserId);
        setResults(users);
      } catch (error) {
        console.error('Erreur recherche:', error);
      } finally {
        setIsSearching(false);
      }
    };
    
    doSearch();
  }, [debouncedSearch, currentUserId]);
  
  const handleSendRequest = async (toUserId: string) => {
    setSendingTo(toUserId);
    try {
      await sendFriendRequest(currentUserId, toUserId);
      setSentRequests(prev => new Set(prev).add(toUserId));
      onRequestSent();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setSendingTo(null);
    }
  };
  
  const getRelationStatus = (userId: string): 'friend' | 'pending' | 'sent' | 'none' => {
    if (currentUserProfile?.friends?.includes(userId)) return 'friend';
    if (currentUserProfile?.friendRequests?.incoming?.includes(userId)) return 'pending';
    if (currentUserProfile?.friendRequests?.outgoing?.includes(userId) || sentRequests.has(userId)) return 'sent';
    return 'none';
  };
  
  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher par pseudo ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:border-orange-500 focus:outline-none transition-colors"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-neutral-400" />
        )}
      </div>
      
      {/* Résultats */}
      {searchTerm.length < 2 ? (
        <div className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
          <p className="text-neutral-500">
            Entre au moins 2 caracteres pour rechercher
          </p>
        </div>
      ) : results.length === 0 && !isSearching ? (
        <div className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-neutral-500">
            Aucun utilisateur trouve pour "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((user) => {
            const status = getRelationStatus(user.odId);
            
            return (
              <div 
                key={user.odId}
                className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'Utilisateur'}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (user.displayName || user.email || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    {/* Info */}
                    <div>
                      <h4 className="font-semibold">
                        {user.displayName || 'Utilisateur'}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action */}
                  <div>
                    {status === 'friend' && (
                      <span className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="w-4 h-4" />
                        Ami
                      </span>
                    )}
                    
                    {status === 'pending' && (
                      <span className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Clock className="w-4 h-4" />
                        Demande recue
                      </span>
                    )}
                    
                    {status === 'sent' && (
                      <span className="flex items-center gap-1 text-neutral-500 text-sm">
                        <Clock className="w-4 h-4" />
                        Demande envoyee
                      </span>
                    )}
                    
                    {status === 'none' && (
                      <button
                        onClick={() => handleSendRequest(user.odId)}
                        disabled={sendingTo === user.odId}
                        className="px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                      >
                        {sendingTo === user.odId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Ajouter
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
