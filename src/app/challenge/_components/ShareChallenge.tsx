"use client";

import { useState } from "react";
import { formatTime } from "@/components/game";

interface ShareChallengeProps {
  shareUrl: string;
  finalTime: number;
}

/**
 * Interface de partage du défi.
 */
export function ShareChallenge({ shareUrl, finalTime }: ShareChallengeProps) {
  const [showCopied, setShowCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  const share = () => {
    const text = `🤟 Je te défie de signer ce mot plus vite que moi (${formatTime(finalTime)}) !\n\n`;
    
    if (navigator.share) {
      navigator.share({
        title: "Défi LSF",
        text,
        url: shareUrl,
      });
    } else {
      copyUrl();
    }
  };

  return (
    <div className="w-full max-w-sm">
      <p className="text-sm text-neutral-500 mb-2 text-center">
        Partage ce lien pour défier tes amis
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm"
        />
        <button
          onClick={copyUrl}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold text-sm"
        >
          {showCopied ? "✓" : "Copier"}
        </button>
      </div>
      <button
        onClick={share}
        className="w-full mt-3 px-6 py-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-full font-semibold hover:border-orange-500 transition-colors"
      >
        Partager 📤
      </button>
    </div>
  );
}
