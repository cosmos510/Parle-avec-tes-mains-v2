"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/components/game";
import type { ChallengeResult as ChallengeResultType } from "@/types/game";

interface ChallengeResultProps {
  finalTime: number;
  opponentResult: ChallengeResultType | null;
}

/**
 * Affiche le résultat du défi avec comparaison.
 */
export function ChallengeResult({ finalTime, opponentResult }: ChallengeResultProps) {
  const comparison = getComparison(finalTime, opponentResult);

  return (
    <div>
      {comparison && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-4"
        >
          <span className="text-4xl">{comparison.emoji}</span>
          <p className={`text-lg font-semibold ${comparison.colorClass}`}>
            {comparison.text}
          </p>
        </motion.div>
      )}
      <p className="text-neutral-500 mb-1">Ton temps</p>
      <p className="text-6xl font-black">{formatTime(finalTime)}</p>
      {opponentResult && (
        <p className="text-neutral-500 mt-2">
          vs {formatTime(opponentResult.odTime)} ({opponentResult.odDisplayName})
        </p>
      )}
    </div>
  );
}

function getComparison(finalTime: number, opponentResult: ChallengeResultType | null) {
  if (!opponentResult) return null;

  const diff = finalTime - opponentResult.odTime;

  if (diff < 0) {
    return {
      emoji: "🎉",
      text: `Tu as battu ${opponentResult.odDisplayName} de ${formatTime(Math.abs(diff))} !`,
      colorClass: "text-green-500",
    };
  } else if (diff > 0) {
    return {
      emoji: "😅",
      text: `${opponentResult.odDisplayName} t'a battu de ${formatTime(diff)}`,
      colorClass: "text-orange-500",
    };
  } else {
    return {
      emoji: "🤝",
      text: "Égalité parfaite !",
      colorClass: "",
    };
  }
}
