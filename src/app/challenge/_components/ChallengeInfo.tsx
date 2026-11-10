"use client";

import { formatTime } from "@/components/game";
import type { ChallengeResult } from "@/types/game";

interface ChallengeInfoProps {
  result: ChallengeResult;
  word: string;
}

/**
 * Affiche les infos du défi à relever.
 */
export function ChallengeInfo({ result, word }: ChallengeInfoProps) {
  return (
    <div className="mb-6 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
      <p className="text-sm text-orange-600 dark:text-orange-400">
        <strong>{result.odDisplayName}</strong> t&apos;a défié !
      </p>
      <p className="text-2xl font-black mt-1">
        Mot : <span className="text-orange-500">{word}</span>
      </p>
      <p className="text-sm text-neutral-500 mt-1">
        Son temps : {formatTime(result.odTime)}
      </p>
    </div>
  );
}
