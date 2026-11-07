"use client";

import { motion } from "framer-motion";
import type { Challenge } from "@/types/practice";

interface ChallengeDisplayProps {
  challenge: Challenge;
  progress: string[];
}

/**
 * Affichage du challenge actuel avec les lettres à compléter
 */
export function ChallengeDisplay({ challenge, progress }: ChallengeDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <p className="text-sm text-muted-foreground mb-2">{challenge.hint}</p>
      <div className="flex items-center justify-center gap-2">
        {challenge.word.split("").map((letter, i) => {
          const isCompleted = !!progress[i];
          const isActive = i === progress.length;

          return (
            <motion.div
              key={i}
              initial={{ scale: 0.8 }}
              animate={{
                scale: isCompleted ? 1.1 : 1,
                backgroundColor: isCompleted ? "var(--primary)" : "var(--muted)",
              }}
              className={`
                w-14 h-16 rounded-xl flex items-center justify-center text-2xl font-bold
                ${
                  isCompleted
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : isActive
                    ? "bg-card border-2 border-primary/50 text-foreground animate-pulse"
                    : "bg-muted/50 text-muted-foreground"
                }
              `}
            >
              {progress[i] || letter}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
