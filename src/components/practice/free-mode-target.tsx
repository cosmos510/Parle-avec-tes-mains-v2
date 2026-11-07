"use client";

import { motion } from "framer-motion";

interface FreeModeTargetProps {
  letter: string;
}

/**
 * Affichage de la lettre cible en mode libre
 */
export function FreeModeTarget({ letter }: FreeModeTargetProps) {
  return (
    <motion.div
      key={letter}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center mb-8"
    >
      <p className="text-sm text-muted-foreground mb-3">Signez cette lettre :</p>
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="inline-flex items-center justify-center w-24 h-28 rounded-2xl bg-gradient-to-b from-primary to-accent text-white text-5xl font-bold shadow-xl shadow-primary/30"
      >
        {letter}
      </motion.div>
    </motion.div>
  );
}
