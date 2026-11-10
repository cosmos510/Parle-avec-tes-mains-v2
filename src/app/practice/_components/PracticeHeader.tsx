"use client";

import Link from "next/link";

interface PracticeHeaderProps {
  score: number;
  streak: number;
}

/**
 * Header de la page practice avec score et streak.
 */
export function PracticeHeader({ score, streak }: PracticeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-5xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded"
        >
          ← Retour
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-sm">
            <span className="font-bold text-neutral-900 dark:text-white">{score}</span>
            <span className="text-neutral-400 ml-1 hidden sm:inline">pts</span>
          </span>
          {streak > 2 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
              {streak}
            </span>
          )}
        </div>
      </nav>
    </header>
  );
}
