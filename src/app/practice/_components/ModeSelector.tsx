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
  const modes: PracticeMode[] = ["free", "challenge"];

  const handleKeyDown = (e: React.KeyboardEvent, current: PracticeMode) => {
    const idx = modes.indexOf(current);
    if (e.key === "ArrowRight") onChange(modes[(idx + 1) % modes.length]);
    if (e.key === "ArrowLeft") onChange(modes[(idx - 1 + modes.length) % modes.length]);
  };

  return (
    <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6" role="tablist">
      <ModeButton 
        label="Libre" 
        active={mode === "free"} 
        onClick={() => onChange("free")}
        onKeyDown={(e) => handleKeyDown(e, "free")}
      />
      <ModeButton 
        label="Challenge" 
        active={mode === "challenge"} 
        onClick={() => onChange("challenge")}
        onKeyDown={(e) => handleKeyDown(e, "challenge")}
      />
    </div>
  );
}

function ModeButton({ 
  label, 
  active, 
  onClick,
  onKeyDown
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="tab"
      tabIndex={active ? 0 : -1}
      aria-selected={active}
      aria-label={label}
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
