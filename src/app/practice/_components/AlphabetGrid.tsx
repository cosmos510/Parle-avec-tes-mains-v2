"use client";

import { ASL_ALPHABET } from "@/lib/constants";
import type { PracticeMode } from "@/types/practice";

interface AlphabetGridProps {
  mode: PracticeMode;
  targetLetter: string | null;
  displayedLetter: string | null;
  onSelectLetter: (letter: string) => void;
}

/**
 * Grille de l'alphabet avec sélection de lettre cible.
 */
export function AlphabetGrid({ 
  mode, 
  targetLetter, 
  displayedLetter, 
  onSelectLetter 
}: AlphabetGridProps) {
  return (
    <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
      <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Alphabet</h2>
      <div className="grid grid-cols-9 sm:grid-cols-6 gap-1 sm:gap-1.5">
        {ASL_ALPHABET.map((letter) => {
          const isTarget = targetLetter === letter;
          const isDetected = displayedLetter === letter;

          return (
            <button
              key={letter}
              onClick={() => mode === "free" && onSelectLetter(letter)}
              disabled={mode !== "free"}
              className={`aspect-square rounded sm:rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isDetected
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : isTarget
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              } ${mode === "free" ? "cursor-pointer active:scale-95" : "cursor-default"}`}
            >
              {letter}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-neutral-500 mt-2 sm:mt-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-orange-500" />
          cible
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-neutral-900 dark:bg-white" />
          détecté
        </span>
      </div>
    </section>
  );
}
