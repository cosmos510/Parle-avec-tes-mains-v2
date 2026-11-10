"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { User } from "firebase/auth";
import type { DuelRoom } from "@/lib/duel-service";
import { setPlayerReady, startDuelCountdown } from "@/lib/duel-service";

interface DuelLobbyProps {
  room: DuelRoom;
  user: User;
  onLeave: () => void;
}

export function DuelLobby({ room, user, onLeave }: DuelLobbyProps) {
  const [copied, setCopied] = useState(false);

  const isHost = room.hostId === user.uid;
  const players = Object.values(room.players);
  const currentPlayer = room.players[user.uid];
  const opponent = players.find((p) => p.odId !== user.uid);
  const allReady = players.length === 2 && players.every((p) => p.isReady);

  const copyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/duel?room=${room.id}`;
    if (navigator.share) {
      navigator.share({
        title: "Duel LSF",
        text: "Rejoins-moi pour un duel de langue des signes !",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleReady = () => {
    setPlayerReady(room.id, user.uid, !currentPlayer?.isReady);
  };

  const startGame = () => {
    if (isHost && allReady) {
      startDuelCountdown(room.id);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Code de la room */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-sm text-neutral-500 mb-2">Code de la partie</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-black tracking-widest">
            {room.id}
          </span>
          <button
            onClick={copyCode}
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-orange-500 transition-colors"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </motion.div>

      {/* Joueurs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-8"
      >
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Joueurs ({players.length}/2)
        </p>

        {/* Joueur 1 (host) */}
        <div className={`p-4 rounded-xl border-2 ${
          currentPlayer?.isReady 
            ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
            : "border-neutral-200 dark:border-neutral-800"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">
                {currentPlayer?.displayName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-medium">
                  {currentPlayer?.displayName}
                  {isHost && <span className="text-xs text-neutral-500 ml-2">Host</span>}
                </p>
                <p className="text-xs text-neutral-500">Toi</p>
              </div>
            </div>
            {currentPlayer?.isReady && (
              <span className="text-sm font-medium text-green-500">Prêt</span>
            )}
          </div>
        </div>

        {/* Joueur 2 (opponent) */}
        {opponent ? (
          <div className={`p-4 rounded-xl border-2 ${
            opponent.isReady 
              ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
              : "border-neutral-200 dark:border-neutral-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">
                  {opponent.displayName?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium">{opponent.displayName}</p>
                  <p className="text-xs text-neutral-500">Adversaire</p>
                </div>
              </div>
              {opponent.isReady && (
                <span className="text-sm font-medium text-green-500">Prêt</span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-neutral-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-neutral-400">En attente d'un adversaire...</p>
                <p className="text-xs text-neutral-500">Partage le code</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mot du duel (caché) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 mb-8 text-center"
      >
        <p className="text-xs text-neutral-500 mb-1">Mot à signer</p>
        <p className="text-2xl font-black tracking-widest">
          {"•".repeat(room.word.length)}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          {room.word.length} lettres - révélé au départ
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {/* Bouton Prêt */}
        <button
          onClick={toggleReady}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            currentPlayer?.isReady
              ? "bg-green-500 text-white"
              : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
          }`}
        >
          {currentPlayer?.isReady ? "Prêt ✓" : "Je suis prêt"}
        </button>

        {/* Bouton Commencer (host seulement) */}
        {isHost && (
          <button
            onClick={startGame}
            disabled={!allReady}
            className="w-full py-4 rounded-xl border-2 border-orange-500 text-orange-500 font-bold text-lg hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allReady ? "Lancer la partie" : "En attente des joueurs..."}
          </button>
        )}

        {/* Partager */}
        {!opponent && (
          <button
            onClick={shareLink}
            className="w-full py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Inviter un ami
          </button>
        )}

        {/* Quitter */}
        <button
          onClick={onLeave}
          className="w-full py-3 text-sm text-neutral-500 hover:text-red-500 transition-colors"
        >
          Quitter la partie
        </button>
      </motion.div>
    </div>
  );
}
