"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

/**
 * Barre de progression animée.
 */
export function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={`h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-orange-500"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
