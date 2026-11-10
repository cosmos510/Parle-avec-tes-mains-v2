"use client";

interface GameBackgroundProps {
  variant?: "practice" | "sprint" | "duel";
  children: React.ReactNode;
}

/**
 * Fond subtil pour les pages de jeu
 * Juste un léger gradient, pas de fioritures
 */
export function GameBackground({ variant = "practice", children }: GameBackgroundProps) {
  const gradientColors = {
    practice: "from-orange-50/30 to-transparent",
    sprint: "from-blue-50/30 to-transparent", 
    duel: "from-purple-50/30 to-transparent",
  };

  const darkGradientColors = {
    practice: "dark:from-orange-950/10 dark:to-transparent",
    sprint: "dark:from-blue-950/10 dark:to-transparent",
    duel: "dark:from-purple-950/10 dark:to-transparent",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative">
      {/* Gradient très subtil en haut */}
      <div 
        className={`absolute inset-x-0 top-0 h-96 bg-gradient-to-b ${gradientColors[variant]} ${darkGradientColors[variant]} pointer-events-none`} 
        aria-hidden="true"
      />
      
      {/* Contenu */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
