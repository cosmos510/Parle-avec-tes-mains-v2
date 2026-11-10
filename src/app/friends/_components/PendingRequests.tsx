'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
} from '@/lib/friends-service';
import { 
  Check, 
  X, 
  Loader2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface SimpleFriendProfile {
  odId: string;
  displayName: string;
  photoURL?: string;
}

interface PendingRequestsProps {
  incoming: SimpleFriendProfile[];
  outgoing: SimpleFriendProfile[];
  onUpdate: () => void;
}

export function PendingRequests({ incoming, outgoing, onUpdate }: PendingRequestsProps) {
  const { user } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const handleAccept = async (fromUserId: string) => {
    if (!user) return;
    
    setProcessingId(fromUserId);
    try {
      await acceptFriendRequest(user.uid, fromUserId);
      onUpdate();
    } catch (error) {
      console.error('Erreur acceptation:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDecline = async (fromUserId: string) => {
    if (!user) return;
    
    setProcessingId(fromUserId);
    try {
      await declineFriendRequest(user.uid, fromUserId);
      onUpdate();
    } catch (error) {
      console.error('Erreur refus:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleCancel = async (toUserId: string) => {
    if (!user) return;
    
    setProcessingId(toUserId);
    try {
      await cancelFriendRequest(user.uid, toUserId);
      onUpdate();
    } catch (error) {
      console.error('Erreur annulation:', error);
    } finally {
      setProcessingId(null);
    }
  };
  
  const hasNoRequests = incoming.length === 0 && outgoing.length === 0;
  
  if (hasNoRequests) {
    return (
      <div className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
        <h3 className="text-lg font-semibold mb-2">
          Aucune demande en attente
        </h3>
        <p className="text-neutral-500">
          Les demandes d'amis recues et envoyees apparaitront ici.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Demandes reçues */}
      {incoming.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" />
            Demandes recues ({incoming.length})
          </h3>
          <div className="space-y-3">
            {incoming.map((request) => (
              <div 
                key={request.odId}
                className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {request.photoURL ? (
                        <img 
                          src={request.photoURL} 
                          alt={request.displayName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        request.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {request.displayName}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Veut etre ton ami
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(request.odId)}
                      disabled={processingId === request.odId}
                      className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      {processingId === request.odId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDecline(request.odId)}
                      disabled={processingId === request.odId}
                      className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Demandes envoyées */}
      {outgoing.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Demandes envoyees ({outgoing.length})
          </h3>
          <div className="space-y-3">
            {outgoing.map((request) => (
              <div 
                key={request.odId}
                className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                      {request.photoURL ? (
                        <img 
                          src={request.photoURL} 
                          alt={request.displayName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        request.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {request.displayName}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        En attente de reponse
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleCancel(request.odId)}
                    disabled={processingId === request.odId}
                    className="px-3 py-2 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm flex items-center gap-1"
                  >
                    {processingId === request.odId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Annuler
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
