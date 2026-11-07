"use client";

import { motion } from "framer-motion";

interface DetectionOverlayProps {
  letter: string;
  confidence: number;
  progress: number;
  isValidated: boolean;
  isCorrect: boolean;
}

/**
 * Overlay affichant la lettre détectée avec la progression
 */
export function DetectionOverlay({
  letter,
  confidence,
  progress,
  isValidated,
  isCorrect,
}: DetectionOverlayProps) {
  const showSuccess = isValidated && isCorrect;

  return (
    <motion.div
      key={letter}
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute top-4 right-4"
    >
      <div
        className={`
          px-6 py-4 rounded-2xl backdrop-blur-sm border shadow-xl
          ${
            showSuccess
              ? "bg-green-500/90 border-green-400 text-white"
              : "bg-card/90 border-border/50"
          }
        `}
      >
        <div className="text-center">
          <span className="text-4xl font-bold">{letter}</span>
          <div className="text-xs mt-1 opacity-80">{confidence}% confiance</div>

          {/* Barre de progression */}
          {!isValidated && (
            <div className="mt-2">
              <div className="h-1.5 w-20 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs mt-1 opacity-60">Maintenez...</div>
            </div>
          )}

          {isValidated && (
            <div className="text-xs mt-2 text-green-400 font-medium">
              ✓ Validé !
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Placeholder quand aucune main n'est détectée
 */
export function NoHandPlaceholder() {
  return (
    <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
      <span className="text-sm text-muted-foreground">Montrez votre main 👋</span>
    </div>
  );
}
