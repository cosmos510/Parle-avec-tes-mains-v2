"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { GameHeader } from "@/components/game";
import { DuelLobby } from "./_components/DuelLobby";
import { DuelGame } from "./_components/DuelGame";
import { DuelResult } from "./_components/DuelResult";
import {
  createDuelRoom,
  joinDuelRoom,
  subscribeToDuelRoom,
  leaveDuelRoom,
  type DuelRoom,
} from "@/lib/duel-service";

export default function DuelPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DuelContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
    </div>
  );
}

function DuelContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("room");
  const { user, loading: authLoading } = useRequireAuth();

  const [room, setRoom] = useState<DuelRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState(roomCode || "");

  // S'abonner aux changements de la room
  useEffect(() => {
    if (!room?.id) return;

    const unsubscribe = subscribeToDuelRoom(room.id, (updatedRoom) => {
      if (updatedRoom) {
        setRoom(updatedRoom);
      } else {
        // Room supprimée
        setRoom(null);
        setError("La room a été fermée");
      }
    });

    return () => unsubscribe();
  }, [room?.id]);

  // Auto-join si room code dans l'URL
  useEffect(() => {
    if (roomCode && user && !room) {
      handleJoinRoom(roomCode);
    }
  }, [roomCode, user]);

  const handleCreateRoom = async () => {
    if (!user) return;

    setIsCreating(true);
    setError(null);

    try {
      const roomId = await createDuelRoom(user);
      const newRoom = await joinDuelRoom(roomId, user);
      setRoom(newRoom);
    } catch (err) {
      setError("Erreur lors de la création de la room");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (code?: string) => {
    if (!user) return;

    const codeToJoin = code || joinCode.toUpperCase().trim();
    if (!codeToJoin || codeToJoin.length !== 6) {
      setError("Code invalide (6 caractères)");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const joinedRoom = await joinDuelRoom(codeToJoin, user);
      if (joinedRoom) {
        setRoom(joinedRoom);
      } else {
        setError("Room introuvable");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la connexion");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = useCallback(async () => {
    if (!room || !user) return;

    const isHost = room.hostId === user.uid;
    await leaveDuelRoom(room.id, user.uid, isHost);
    setRoom(null);
  }, [room, user]);

  if (authLoading) return <LoadingSpinner />;

  // Écran de résultat
  if (room?.status === "finished") {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <GameHeader title="Duel terminé" />
        <main className="pt-20 pb-8 px-4">
          <DuelResult room={room} odId={user!.uid} onPlayAgain={handleLeaveRoom} />
        </main>
      </div>
    );
  }

  // En jeu (countdown ou playing)
  if (room && (room.status === "countdown" || room.status === "playing")) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <GameHeader title="Duel en cours" />
        <main className="pt-14 pb-8 px-4">
          <DuelGame room={room} user={user!} />
        </main>
      </div>
    );
  }

  // Lobby (waiting)
  if (room?.status === "waiting") {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <GameHeader title="Duel" />
        <main className="pt-20 pb-8 px-4">
          <DuelLobby room={room} user={user!} onLeave={handleLeaveRoom} />
        </main>
      </div>
    );
  }

  // Écran d'accueil - créer ou rejoindre
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <GameHeader title="Duel en temps réel" />

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black mb-4">Duel</h1>
            <p className="text-neutral-500">
              Affronte un ami en temps réel. Le premier à signer le mot gagne.
            </p>
          </motion.div>

          {/* Créer une room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreating ? "Création..." : "Créer une partie"}
            </button>
          </motion.div>

          {/* Séparateur */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-sm text-neutral-500">ou</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Rejoindre une room */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-neutral-500 mb-3">Rejoindre avec un code</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-center font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => handleJoinRoom()}
                disabled={isJoining || joinCode.length !== 6}
                className="px-6 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-orange-500 transition-colors font-medium disabled:opacity-50"
              >
                {isJoining ? "..." : "Rejoindre"}
              </button>
            </div>
          </motion.div>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-center text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800"
          >
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-4">
              Comment ça marche
            </p>
            <ol className="space-y-3 text-sm text-neutral-500">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>Crée une partie et partage le code</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>Attendez que les deux joueurs soient prêts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>Signez le mot le plus vite possible</span>
              </li>
            </ol>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
