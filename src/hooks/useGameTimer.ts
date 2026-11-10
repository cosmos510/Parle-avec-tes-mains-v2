"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseGameTimerReturn {
  elapsedTime: number;
  startTimer: () => void;
  stopTimer: () => number;
  resetTimer: () => void;
  formatTime: (ms: number) => string;
}

/**
 * Hook pour gérer un timer de jeu avec précision milliseconde.
 */
export function useGameTimer(): UseGameTimerReturn {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    setElapsedTime(0);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Date.now() - startTimeRef.current);
      }
    }, 10);
  }, [clearTimer]);

  const stopTimer = useCallback((): number => {
    clearTimer();
    const finalTime = startTimeRef.current 
      ? Date.now() - startTimeRef.current 
      : elapsedTime;
    return finalTime;
  }, [clearTimer, elapsedTime]);

  const resetTimer = useCallback(() => {
    clearTimer();
    startTimeRef.current = null;
    setElapsedTime(0);
  }, [clearTimer]);

  const formatTime = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    elapsedTime,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
}
