"use client";

import { motion } from "framer-motion";

interface LetterDisplayProps {
  letter: string;
  size?: "md" | "lg" | "xl";
  animated?: boolean;
}

/**
 * Affichage d'une lettre cible avec animation optionnelle.
 */
export function LetterDisplay({ 
  letter, 
  size = "lg",
  animated = true 
}: LetterDisplayProps) {
  const sizeClasses = {
    md: "text-6xl",
    lg: "text-8xl",
    xl: "text-9xl",
  };

  if (animated) {
    return (
      <motion.p
        key={letter}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${sizeClasses[size]} font-black text-orange-500`}
      >
        {letter}
      </motion.p>
    );
  }

  return (
    <p className={`${sizeClasses[size]} font-black text-orange-500`}>
      {letter}
    </p>
  );
}
