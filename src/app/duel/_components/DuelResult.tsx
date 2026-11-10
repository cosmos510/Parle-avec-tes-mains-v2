"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { DuelRoom } from "@/lib/duel-service";
import { formatTime } from "@/components/game";

interface DuelResultProps {
  room: DuelRoom;
  odId: string;
  onPlayAgain: () => void;
}

export function DuelResult({ room, odId, onPlayAgain }: DuelResultProps) {
  const players = Object.values(room.players);
  const me = room.players[odId];
  const opponent = players.find((p) => p.odId !== odId);

  // Déterminer le gagnant
  const getResult = () => {
    if (!me?.finishTime) return "lose";
    if (!opponent?.finishTime) return "win";
    if (me.finishTime < opponent.finishTime) return "win";
    if (me.finishTime > opponent.finishTime) return "lose";
    return "tie";
  };

  const result = getResult();

  const resultConfig = {
    win: {
      title: "Victoire !",
      subtitle: "Tu as été le plus rapide",
      bgClass: "bg-green-50 dark:bg-green-900/20",
      textClass: "text-green-500",
    },
    lose: {
      title: "Défaite",
      subtitle: "Ton adversaire a été plus rapide",
      bgClass: "bg-orange-50 dark:bg-orange-900/20",
      textClass: "text-orange-500",
    },
    tie: {
      title: "Égalité !",
      subtitle: "Même temps, incroyable !",
      bgClass: "bg-neutral-50 dark:bg-neutral-900",
      textClass: "text-neutral-900 dark:text-white",
    },
  };

  const config = resultConfig[result];

  return (
    <div className="max-w-md mx-auto">
      {/* Résultat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-8 rounded-2xl ${config.bgClass} text-center mb-8`}
      >
        <h1 className={`text-4xl font-black mb-2 ${config.textClass}`}>
          {config.title}
        </h1>
        <p className="text-neutral-500">{config.subtitle}</p>
      </motion.div>

      {/* Comparaison des temps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8"
      >
        <p className="text-xs text-neutral-500 uppercase tracking-wider">
          Résultats
        </p>

        {/* Mon temps */}
        <div className={`p-4 rounded-xl border-2 ${
          result === "win" ? "border-green-500" : "border-neutral-200 dark:border-neutral-800"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold">
                {me?.displayName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="font-medium">{me?.displayName}</p>
                <p className="text-xs text-neutral-500">Toi</p>
              </div>
            </div>
            <p className={`text-2xl font-mono font-black ${
              result === "win" ? "text-green-500" : ""
            }`}>
              {me?.finishTime ? formatTime(me.finishTime) : "DNF"}
            </p>
          </div>
        </div>

        {/* Temps adversaire */}
        {opponent && (
          <div className={`p-4 rounded-xl border-2 ${
            result === "lose" ? "border-green-500" : "border-neutral-200 dark:border-neutral-800"
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
              <p className={`text-2xl font-mono font-black ${
                result === "lose" ? "text-green-500" : ""
              }`}>
                {opponent.finishTime ? formatTime(opponent.finishTime) : "DNF"}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Mot */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 mb-8 text-center"
      >
        <p className="text-xs text-neutral-500 mb-1">Mot du duel</p>
        <p className="text-3xl font-black tracking-widest">{room.word}</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={onPlayAgain}
          className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Nouvelle partie
        </button>

        <Link
          href="/play"
          className="block w-full py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors font-medium text-center"
        >
          Retour aux modes de jeu
        </Link>
      </motion.div>
    </div>
  );
}
