"use client";

import type { PracticeMode } from "@/types/practice";

interface ModeSelectorProps {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}

/**
 * Sélecteur de mode (Libre / Challenge).
 */
export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6" role="tablist">
      <ModeButton 
        label="Libre" 
        active={mode === "free"} 
        onClick={() => onChange("free")} 
      />
      <ModeButton 
        label="Challenge" 
        active={mode === "challenge"} 
        onClick={() => onChange("challenge")} 
      />
    </div>
  );
}

function ModeButton({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
        active
          ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
