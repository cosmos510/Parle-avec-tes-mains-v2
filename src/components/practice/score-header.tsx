"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ScoreHeaderProps {
  score: number;
  streak: number;
}

/**
 * Header avec le score et la série
 */
export function ScoreHeader({ score, streak }: ScoreHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40" role="banner">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">Accueil</span>
        </Link>

        <div className="flex items-center gap-4" role="status" aria-live="polite">
          {/* Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="font-bold text-primary" aria-label={`Score: ${score} points`}>{score}</span>
          </div>

          {/* Streak (visible si > 2) */}
          {streak > 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20"
            >
              <span className="text-orange-500" aria-hidden="true">🔥</span>
              <span className="font-bold text-orange-500" aria-label={`Série de ${streak}`}>{streak}</span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
