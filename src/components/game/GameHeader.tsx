"use client";

import Link from "next/link";

interface GameHeaderProps {
  title: string;
  rightContent?: React.ReactNode;
}

export function GameHeader({ title, rightContent }: GameHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/play"
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Modes de jeu</span>
        </Link>
        <h1 className="font-bold text-sm sm:text-base">{title}</h1>
        <div className="min-w-[80px] flex justify-end">
          {rightContent}
        </div>
      </nav>
    </header>
  );
}
