"use client";

interface SessionStatsProps {
  score: number;
  streak: number;
}

/**
 * Statistiques de la session en cours.
 */
export function SessionStats({ score, streak }: SessionStatsProps) {
  return (
    <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
      <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Session</h2>
      <div className="flex justify-around sm:grid sm:grid-cols-2 gap-2 sm:gap-4 text-center">
        <div>
          <p className="text-2xl sm:text-3xl font-black">{score}</p>
          <p className="text-[10px] sm:text-xs text-neutral-500">Points</p>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-black">{streak}</p>
          <p className="text-[10px] sm:text-xs text-neutral-500">Série</p>
        </div>
      </div>
    </section>
  );
}
