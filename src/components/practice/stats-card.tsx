"use client";

import { motion } from "framer-motion";

interface StatsCardProps {
  score: number;
  streak: number;
}

/**
 * Carte des statistiques de la session
 */
export function StatsCard({ score, streak }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
      role="region"
      aria-labelledby="stats-title"
    >
      <h3 id="stats-title" className="font-semibold mb-3">Cette session</h3>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-3xl font-bold text-primary" aria-label={`${score} points`}>{score}</div>
          <div className="text-xs text-muted-foreground">Points</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-orange-500" aria-label={`Série de ${streak}`}>{streak}</div>
          <div className="text-xs text-muted-foreground">Série</div>
        </div>
      </div>
    </motion.div>
  );
}
