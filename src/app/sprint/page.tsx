"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useGameTimer } from "@/hooks/useGameTimer";
import { GameHeader, formatTime } from "@/components/game";
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

  useEffect(() => {
    if (authLoading || !user) return;
    
    loadSprintData(user.uid).then(({ bestTime: bt, leaderboard: lb }) => {
      if (bt) setBestTime(bt);
      setLeaderboard(lb);
    });
  }, [user, authLoading]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <GameHeader title="Sprint A → Z" />

      <main className="pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Layout 3 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
            
            {/* Colonne gauche - Lettre cible */}
            <div className="lg:col-span-3 order-1">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  {gameState === "playing" ? "Signe la lettre" : "Objectif"}
                </p>
                
                {gameState === "idle" && (
                  <div>
                    <p className="text-6xl sm:text-7xl font-black text-neutral-300 dark:text-neutral-700">
                      A → Z
                    </p>
                    <p className="text-sm text-neutral-500 mt-2">
                      26 lettres le plus vite possible
                    </p>
                  </div>
                )}

                {gameState === "countdown" && (
                  <motion.span
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[120px] sm:text-[150px] font-black leading-none text-orange-500"
                  >
                    {countdown}
                  </motion.span>
                )}

                {gameState === "playing" && (
                  <motion.span
                    key={currentLetter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-orange-500"
                  >
                    {currentLetter}
                  </motion.span>
                )}

                {gameState === "finished" && (
                  <div>
                    {isNewRecord ? (
                      <div>
                        <span className="text-6xl"></span>
                        <p className="text-2xl font-black text-orange-500 mt-2">
                          Nouveau record !
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-6xl">✓</span>
                        <p className="text-xl font-bold mt-2">Terminé !</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Timer */}
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    Temps
                  </p>
                  <p className={`text-4xl font-mono font-black ${
                    gameState === "finished" && isNewRecord ? "text-green-500" : ""
                  }`}>
                    {formatTime(gameState === "finished" && finalTime ? finalTime : elapsedTime)}
                  </p>
                </div>

                {/* Progress */}
                {gameState === "playing" && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Progression</span>
                      <span>{currentIndex + 1} / 26</span>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / 26) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Best time */}
                {bestTime && gameState !== "finished" && (
                  <div className="mt-4">
                    <p className="text-xs text-neutral-500">Ton record</p>
                    <p className="text-lg font-mono font-bold">{formatTime(bestTime)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne centrale - Webcam */}
            <div className="lg:col-span-6 order-2">
              <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-800">
                <video ref={videoRef} className="hidden" playsInline muted autoPlay />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
                  style={{ objectFit: "cover" }}
                />

                {/* État initial */}
                {!isStreaming && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-4">
                      <span className="text-4xl"></span>
                    </div>
                    <p className="text-neutral-500 mb-4 text-center">
                      Signe les 26 lettres le plus vite possible
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform"
                    >
                      Activer la caméra
                    </button>
                  </div>
                )}

                {/* Chargement */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mb-4" />
                    <p className="font-medium mb-1">{loadingStep}</p>
                    <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-500 text-white text-sm rounded-lg">
                    {error}
                  </div>
                )}

                {/* Overlays streaming */}
                {isStreaming && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                        En direct
                      </span>
                    </div>

                    {gameState === "countdown" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <motion.span
                          key={countdown}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-[150px] font-black text-white"
                        >
                          {countdown}
                        </motion.span>
                      </div>
                    )}

                    {gameState === "idle" && (
                      <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-black/50 text-white text-sm rounded-lg text-center">
                        Prêt ? Clique sur &quot;Commencer&quot;
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-4">
                {isStreaming && gameState === "idle" && (
                  <button
                    onClick={startGame}
                    className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
                  >
                    Commencer
                  </button>
                )}

                {gameState === "finished" && (
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold"
                  >
                    Rejouer
                  </button>
                )}

                {isStreaming && (gameState === "idle" || gameState === "finished") && (
                  <button
                    onClick={stopCamera}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors self-center"
                  >
                    Arrêter la caméra
                  </button>
                )}
              </div>
            </div>

            {/* Colonne droite - Résultat & Leaderboard */}
            <div className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Lettre détectée
                </p>
                
                <AnimatePresence mode="wait">
                  {displayedLetter && gameState === "playing" ? (
                    <motion.span
                      key={displayedLetter}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none ${
                        displayedLetter === currentLetter 
                          ? "text-green-500" 
                          : "text-neutral-900 dark:text-white"
                      }`}
                    >
                      {displayedLetter}
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-neutral-200 dark:text-neutral-800"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>

                {displayedLetter && gameState === "playing" && (
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    displayedLetter === currentLetter 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  }`}>
                    {displayedLetter === currentLetter ? "✓ Correct" : "→ Continue"}
                  </div>
                )}

                {/* Progress alphabet */}
                {gameState === "playing" && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                      Progression
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {ALPHABET.map((letter, i) => (
                        <span
                          key={letter}
                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                            i < currentIndex
                              ? "bg-green-500 text-white"
                              : i === currentIndex
                              ? "bg-orange-500 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                {leaderboard.length > 0 && (gameState === "idle" || gameState === "finished") && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                       Top 5
                    </p>
                    <div className="space-y-2">
                      {leaderboard.slice(0, 5).map((entry, i) => (
                        <div
                          key={`${entry.displayName}-${i}`}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            i === 0
                              ? "bg-yellow-50 dark:bg-yellow-900/20"
                              : i === 1
                              ? "bg-neutral-100 dark:bg-neutral-800/50"
                              : i === 2
                              ? "bg-orange-50 dark:bg-orange-900/20"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold w-5 text-sm">
                              {i === 0 ? "1." : i === 1 ? "2." : i === 2 ? "3." : `${i + 1}.`}
                            </span>
                            <span className="text-sm truncate max-w-[80px]">
                              {entry.displayName}
                            </span>
                          </div>
                          <span className="font-mono text-sm font-bold">{formatTime(entry.time)}</span>
                        </div>
                      ))}
                    </div>
                    
                    {leaderboard.length > 5 && (
                      <Link 
                        href="/leaderboard" 
                        className="block text-sm text-orange-500 hover:underline mt-3"
                      >
                        Voir tout →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
