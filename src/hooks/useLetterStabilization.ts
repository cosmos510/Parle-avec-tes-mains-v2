"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { STABILIZATION } from "@/lib/constants";
import type { StabilizationState } from "@/types/practice";

interface UseLetterStabilizationProps {
  predictedLetter: string | null;
  isActive: boolean;
  /** Durée de stabilisation personnalisée en ms (défaut: STABILIZATION.VALIDATION_DURATION_MS) */
  stabilizationTime?: number;
}

interface UseLetterStabilizationReturn extends StabilizationState {
  /** Réinitialiser l'état de stabilisation */
  reset: () => void;
}

/**
 * Hook gérant la stabilisation de la détection de lettres.
 */
export function useLetterStabilization({
  predictedLetter,
  isActive,
  stabilizationTime,
}: UseLetterStabilizationProps): UseLetterStabilizationReturn {
  const validationDuration = stabilizationTime ?? STABILIZATION.VALIDATION_DURATION_MS;
  const [displayedLetter, setDisplayedLetter] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isValidated, setIsValidated] = useState(false);

  const currentLetterRef = useRef<string | null>(null);
  const stabilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayDelayRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (stabilityTimerRef.current) {
      clearInterval(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    if (displayDelayRef.current) {
      clearTimeout(displayDelayRef.current);
      displayDelayRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    currentLetterRef.current = null;
    setDisplayedLetter(null);
    setProgress(0);
    setIsValidated(false);
  }, [clearTimers]);

  useEffect(() => {
    // Si pas actif ou pas de lettre, reset
    if (!isActive || !predictedLetter) {
      // Utiliser setTimeout pour éviter setState synchrone
      const timer = setTimeout(reset, 0);
      return () => clearTimeout(timer);
    }

    // Si c'est une nouvelle lettre
    if (predictedLetter !== currentLetterRef.current) {
      clearTimers();
      currentLetterRef.current = predictedLetter;
      
      // Reset immédiat via timeout
      setTimeout(() => {
        setProgress(0);
        setIsValidated(false);
      }, 0);

      // Attendre avant d'afficher
      displayDelayRef.current = setTimeout(() => {
        if (currentLetterRef.current !== predictedLetter) return;

        setDisplayedLetter(predictedLetter);

        const startTime = Date.now();
        stabilityTimerRef.current = setInterval(() => {
          if (currentLetterRef.current !== predictedLetter) {
            clearTimers();
            return;
          }

          const elapsed = Date.now() - startTime;
          const newProgress = Math.min(
            100,
            (elapsed / validationDuration) * 100
          );
          setProgress(newProgress);

          if (newProgress >= 100) {
            setIsValidated(true);
            if (stabilityTimerRef.current) {
              clearInterval(stabilityTimerRef.current);
              stabilityTimerRef.current = null;
            }
          }
        }, STABILIZATION.UPDATE_INTERVAL_MS);
      }, STABILIZATION.DISPLAY_DELAY_MS);
    }

    return () => {
      clearTimers();
    };
  }, [predictedLetter, isActive, clearTimers, reset]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    displayedLetter,
    progress,
    isValidated,
    reset,
  };
}
