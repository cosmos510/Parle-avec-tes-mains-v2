"use client";

import { formatTime } from "@/components/game";

interface SprintLeaderboardEntry {
  rank: number;
  displayName: string;
  time: number;
}

interface SprintLeaderboardProps {
  entries: SprintLeaderboardEntry[];
}

/**
 * Affichage du top 10 du sprint.
 */
export function SprintLeaderboard({ entries }: SprintLeaderboardProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4">Top 10</h2>
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={`${entry.displayName}-${i}`}
            className={`flex items-center justify-between p-3 rounded-xl ${getRowStyle(i)}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold w-6">{getRankIcon(i)}</span>
              <span className="font-medium">{entry.displayName}</span>
            </div>
            <span className="font-mono font-bold">{formatTime(entry.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRankIcon(index: number): string {
  if (index === 0) return "1.";
  if (index === 1) return "2.";
  if (index === 2) return "3.";
  return `${index + 1}.`;
}

function getRowStyle(index: number): string {
  if (index === 0) {
    return "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800";
  }
  if (index === 1) {
    return "bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700";
  }
  if (index === 2) {
    return "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800";
  }
  return "border border-neutral-200 dark:border-neutral-800";
}
