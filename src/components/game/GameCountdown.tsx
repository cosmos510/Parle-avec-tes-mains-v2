"use client";

import { motion } from "framer-motion";

interface GameCountdownProps {
  count: number;
}

/**
 * Affichage animé du compte à rebours (3, 2, 1).
 */
export function GameCountdown({ count }: GameCountdownProps) {
  return (
    <motion.p
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-8xl font-black text-orange-500"
    >
      {count}
    </motion.p>
  );
}
