"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useGameTimer } from "@/hooks/useGameTimer";
import { 
  GameHeader, 
  GameCountdown, 
  ProgressBar, 
  WebcamView, 
  LetterDisplay,
  Timer,
  formatTime 
} from "@/components/game";
import { SprintLeaderboard } from "./_components/SprintLeaderboard";
import { SprintFinished } from "./_components/SprintFinished";
import { saveSprintRecord, loadSprintData } from "./_lib/sprintService";
import type { GameState } from "@/types/game";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SprintPage() {
  const { user, loading: authLoading } = useRequireAuth();
  
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; displayName: string; time: number }>>([]);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);

  const { elapsedTime, startTimer, stopTimer, resetTimer } = useGameTimer();

  const {
    videoRef,
    canvasRef,
    isStreaming,
    isLoading,
    loadingStep,
    loadingProgress,
    error,
    predictedLetter,
    startCamera,
    stopCamera,
  } = useMediaPipeHands();

  const { displayedLetter, isValidated } = useLetterStabilization({
    predictedLetter,
    isActive: isStreaming && gameState === "playing",
  });

  const currentLetter = ALPHABET[currentIndex];

  // Charger données au montage
  useEffect(() => {
    if (authLoading || !user) return;
    
    loadSprintData(user.uid).then(({ bestTime: bt, leaderboard: lb }) => {
      if (bt) setBestTime(bt);
      setLeaderboard(lb);
    });
  }, [user, authLoading]);

  // Validation des lettres pendant le jeu
  useEffect(() => {
    if (gameState !== "playing" || !isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;

    if (displayedLetter === currentLetter) {
      setLastValidatedLetter(displayedLetter);
      
      if (currentIndex === ALPHABET.length - 1) {
        const time = stopTimer();
        setFinalTime(time);
        setGameState("finished");
        
        if (!bestTime || time < bestTime) {
          setIsNewRecord(true);
          setBestTime(time);
          if (user) saveSprintRecord(user, time);
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [isValidated, displayedLetter, currentLetter, currentIndex, bestTime, lastValidatedLetter, gameState, stopTimer, user]);

  // Démarrer le jeu
  const startGame = useCallback(() => {
    if (!isStreaming) return;
    
    setGameState("countdown");
    setCountdown(3);
    setCurrentIndex(0);
    setFinalTime(null);
    setIsNewRecord(false);
    setLastValidatedLetter(null);
    resetTimer();

    const countdownInterval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownInterval);
          setGameState("playing");
          startTimer();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [isStreaming, resetTimer, startTimer]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <GameHeader title="Sprint Alphabet" />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Zone de jeu */}
          <div className="mb-6">
            {/* Affichage selon l'état */}
            <div className="text-center mb-6">
              {gameState === "idle" && (
                <div>
                  <p className="text-neutral-500 mb-2">Signe les 26 lettres le plus vite possible</p>
                  <p className="text-6xl font-black text-neutral-300 dark:text-neutral-700">A → Z</p>
                </div>
              )}

              {gameState === "countdown" && <GameCountdown count={countdown} />}

              {gameState === "playing" && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{currentIndex + 1} / 26</p>
                  <LetterDisplay letter={currentLetter} />
                  <Timer timeMs={elapsedTime} className="mt-4" />
                </div>
              )}

              {gameState === "finished" && (
                <SprintFinished 
                  finalTime={finalTime || 0}
                  bestTime={bestTime}
                  isNewRecord={isNewRecord}
                />
              )}
            </div>

            {/* Barre de progression */}
            {gameState === "playing" && (
              <ProgressBar current={currentIndex} total={26} className="mb-6" />
            )}

            {/* Caméra */}
            <WebcamView
              videoRef={videoRef}
              canvasRef={canvasRef}
              isStreaming={isStreaming}
              isLoading={isLoading}
              loadingStep={loadingStep}
              loadingProgress={loadingProgress}
              error={error}
              onStartCamera={startCamera}
              detectedLetter={displayedLetter}
              targetLetter={currentLetter}
              isPlaying={gameState === "playing"}
            />

            {/* Boutons d'action */}
            <div className="flex justify-center gap-4 mt-6">
              {isStreaming && gameState === "idle" && (
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
                >
                  Commencer 🚀
                </button>
              )}

              {gameState === "finished" && (
                <div className="flex gap-3">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold"
                  >
                    Rejouer
                  </button>
                </div>
              )}

              {isStreaming && gameState !== "playing" && gameState !== "countdown" && (
                <button
                  onClick={stopCamera}
                  className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Arrêter la caméra
                </button>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <SprintLeaderboard entries={leaderboard} />

          {/* Rappel du record */}
          {bestTime && gameState === "idle" && (
            <p className="text-center text-neutral-500 mt-8">
              Ton record : <span className="font-bold">{formatTime(bestTime)}</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
