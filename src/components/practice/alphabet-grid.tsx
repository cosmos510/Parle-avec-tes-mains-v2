"use client";

import { motion } from "framer-motion";
import { ASL_ALPHABET } from "@/lib/constants";

interface AlphabetGridProps {
  targetLetter: string | null;
  detectedLetter: string | null;
  onSelectLetter?: (letter: string) => void;
  isInteractive?: boolean;
}

/**
 * Grille de l'alphabet ASL
 */
export function AlphabetGrid({
  targetLetter,
  detectedLetter,
  onSelectLetter,
  isInteractive = false,
}: AlphabetGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="p-5 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
    >
      <h3 className="font-semibold mb-3">Alphabet</h3>
      <div className="grid grid-cols-6 gap-1.5">
        {ASL_ALPHABET.map((letter) => {
          const isTarget = targetLetter === letter;
          const isDetected = detectedLetter === letter;

          return (
            <motion.button
              key={letter}
              whileHover={isInteractive ? { scale: 1.1 } : undefined}
              whileTap={isInteractive ? { scale: 0.95 } : undefined}
              onClick={() => isInteractive && onSelectLetter?.(letter)}
              disabled={!isInteractive}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all
                ${
                  isDetected
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110"
                    : isTarget
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-pulse"
                    : "bg-muted/30 hover:bg-muted/50 text-foreground"
                }
                ${isInteractive ? "cursor-pointer" : "cursor-default"}
              `}
            >
              {letter}
            </motion.button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        J et Z nécessitent un mouvement
      </p>
    </motion.div>
  );
}
