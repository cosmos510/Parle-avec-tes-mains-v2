"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ASL_ALPHABET } from "@/lib/constants";
import { SIGN_HINTS } from "../_lib/constants";

interface HelpPanelProps {
  isDisabled: boolean;
}

/**
 * Panneau d'aide avec descriptions des signes.
 */
export function HelpPanel({ isDisabled }: HelpPanelProps) {
  const [showHints, setShowHints] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  return (
    <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h2 className="font-bold text-sm sm:text-base">Aide</h2>
        <button
          onClick={() => !isDisabled && setShowHints(!showHints)}
          disabled={isDisabled}
          className={`text-[10px] sm:text-xs px-2 py-0.5 rounded transition-colors ${
            isDisabled
              ? "text-neutral-300 cursor-not-allowed"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          {showHints ? "Masquer" : "Voir"}
        </button>
      </div>

      {isDisabled ? (
        <p className="text-[10px] sm:text-xs text-neutral-400 italic">
          Masqué pendant que tu signes
        </p>
      ) : showHints ? (
        <div className="space-y-2 sm:space-y-3">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-0.5 sm:gap-1">
            {ASL_ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`aspect-square rounded text-[10px] sm:text-xs font-medium transition-colors ${
                  selectedLetter === letter
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {selectedLetter && (
              <motion.div
                key={selectedLetter}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-2 sm:p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800"
              >
                <p className="text-lg sm:text-2xl font-black">{selectedLetter}</p>
                <p className="text-[10px] sm:text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                  {SIGN_HINTS[selectedLetter]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-[10px] sm:text-xs text-neutral-400">
          Comment signer ?
        </p>
      )}
    </section>
  );
}
