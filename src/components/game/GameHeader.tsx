"use client";

import Link from "next/link";

interface GameHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Header fixe pour les pages de jeu avec bouton retour.
 */
export function GameHeader({ 
  title, 
  backHref = "/", 
  backLabel = "Retour" 
}: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link 
          href={backHref} 
          className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          ← {backLabel}
        </Link>
        <h1 className="font-bold">{title}</h1>
        <div className="w-16" />
      </nav>
    </header>
  );
}
