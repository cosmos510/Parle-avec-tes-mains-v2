"use client";

import { motion } from "framer-motion";
import { formatTime } from "@/components/game";

interface SprintFinishedProps {
  finalTime: number;
  bestTime: number | null;
  isNewRecord: boolean;
}

/**
 * Affichage du résultat final du sprint.
 */
export function SprintFinished({ finalTime, bestTime, isNewRecord }: SprintFinishedProps) {
  return (
    <div>
      {isNewRecord && (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-lg text-orange-500 font-bold mb-2"
        >
          Nouveau record !
        </motion.p>
      )}
      <p className="text-6xl font-black">{formatTime(finalTime)}</p>
      {bestTime && !isNewRecord && (
        <p className="text-neutral-500 mt-2">
          Record : {formatTime(bestTime)}
        </p>
      )}
    </div>
  );
}
