"use client";

import { motion } from "framer-motion";
import type { PracticeMode } from "@/types/practice";
import { CHALLENGES } from "@/lib/constants";

interface TargetDisplayProps {
  mode: PracticeMode;
  targetLetter: string | null;
  currentChallenge: number;
  challengeProgress: string[];
}

/**
 * Affiche la cible actuelle (lettre en mode libre, mot en mode challenge).
 */
export function TargetDisplay({ 
  mode, 
  targetLetter, 
  currentChallenge, 
  challengeProgress 
}: TargetDisplayProps) {
  if (mode === "free" && targetLetter) {
    return (
      <div className="text-center">
        <p className="text-xs sm:text-sm text-neutral-500 mb-1">Signe la lettre</p>
        <motion.span
          key={targetLetter}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block text-6xl sm:text-7xl md:text-8xl font-black text-orange-500"
        >
          {targetLetter}
        </motion.span>
      </div>
    );
  }

  if (mode === "challenge") {
    const word = CHALLENGES[currentChallenge].word;
    return (
      <div className="text-center">
        <p className="text-xs sm:text-sm text-neutral-500 mb-1">Épelle</p>
        <div className="flex justify-center gap-1 sm:gap-2">
          {word.split("").map((letter, i) => (
            <span
              key={i}
              className={`text-3xl sm:text-4xl md:text-5xl font-black ${
                i < challengeProgress.length
                  ? "text-green-500"
                  : i === challengeProgress.length
                  ? "text-orange-500"
                  : "text-neutral-300 dark:text-neutral-700"
              }`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
