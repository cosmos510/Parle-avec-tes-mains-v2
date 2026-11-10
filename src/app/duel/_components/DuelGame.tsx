"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "firebase/auth";
import type { DuelRoom } from "@/lib/duel-service";
import { updatePlayerProgress, finishDuel } from "@/lib/duel-service";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { formatTime } from "@/components/game";

interface DuelGameProps {
  room: DuelRoom;
  user: User;
}

export function DuelGame({ room, user }: DuelGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);

  const word = room.word;
  const currentLetter = word[currentIndex];
  const isCountdown = room.status === "countdown";
  const isPlaying = room.status === "playing";

  const opponent = Object.values(room.players).find((p) => p.odId !== user.uid);
  const myProgress = room.players[user.uid]?.progress || 0;
  const opponentProgress = opponent?.progress || 0;

  const {
    videoRef,
    canvasRef,
    isStreaming,
    isLoading,
    predictedLetter,
    startCamera,
  } = useMediaPipeHands();

  const { displayedLetter, isValidated } = useLetterStabilization({
    predictedLetter,
    isActive: isStreaming && isPlaying,
    stabilizationTime: 400, // Plus rapide pour le duel
  });

  // Countdown animé 3-2-1
  useEffect(() => {
    if (!isCountdown) {
      setCountdownValue(3);
      return;
    }

    setCountdownValue(3);
    
    const timer1 = setTimeout(() => setCountdownValue(2), 1000);
    const timer2 = setTimeout(() => setCountdownValue(1), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isCountdown]);

  // Timer local
  useEffect(() => {
    if (!isPlaying || !room.startTime) return;

    const interval = setInterval(() => {
      setLocalTime(Date.now() - room.startTime!);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, room.startTime]);

  // Démarrer la caméra automatiquement
  useEffect(() => {
    if (!isStreaming && !isLoading) {
      startCamera();
    }
  }, [isStreaming, isLoading, startCamera]);

  // Validation des lettres
  useEffect(() => {
    if (!isPlaying || !isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;
    if (currentIndex >= word.length) return;

    if (displayedLetter === currentLetter) {
      setLastValidatedLetter(displayedLetter);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      // Mettre à jour la progression
      updatePlayerProgress(room.id, user.uid, newIndex, displayedLetter);

      // Vérifier si terminé
      if (newIndex >= word.length) {
        const finishTime = Date.now() - room.startTime!;
        finishDuel(room.id, user.uid, finishTime);
      }
    }
  }, [isValidated, displayedLetter, currentLetter, currentIndex, word, isPlaying, room, user, lastValidatedLetter]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Countdown overlay */}
      <AnimatePresence>
        {isCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            role="alert"
            aria-live="assertive"
            aria-label={`Démarrage dans ${countdownValue}`}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-white/60 text-xl mb-4">Prépare-toi...</p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdownValue}
                  initial={{ scale: 2, opacity: 0, y: -50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: 50 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    duration: 0.4 
                  }}
                  className="text-[150px] font-black text-white block"
                >
                  {countdownValue}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
        {/* Colonne gauche - Mot et progression */}
        <div className="lg:col-span-3 order-1">
          <div className="lg:sticky lg:top-20 space-y-6">
            {/* Timer */}
            <div role="timer" aria-label="Temps écoulé">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                Temps
              </p>
              <p className="text-4xl font-mono font-black" aria-live="off">
                {formatTime(localTime)}
              </p>
            </div>

            {/* Mot */}
            <div role="region" aria-label="Mot à signer">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                Mot à signer
              </p>
              <div className="flex gap-1 flex-wrap" aria-label={`Mot: ${word}, progression: ${currentIndex} sur ${word.length}`}>
                {word.split("").map((letter, i) => (
                  <span
                    key={i}
                    className={`text-3xl sm:text-4xl font-black ${
                      i < currentIndex
                        ? "text-green-500"
                        : i === currentIndex
                        ? "text-orange-500"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                    aria-label={i < currentIndex ? `${letter} validée` : i === currentIndex ? `${letter} en cours` : letter}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-3" role="region" aria-label="Progression">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-neutral-500">Toi</span>
                  <span className="font-medium">{myProgress}/{word.length}</span>
                </div>
                <div 
                  className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={myProgress}
                  aria-valuemin={0}
                  aria-valuemax={word.length}
                  aria-label="Ta progression"
                >
                  <motion.div
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(myProgress / word.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {opponent && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-500">{opponent.displayName}</span>
                    <span className="font-medium">{opponentProgress}/{word.length}</span>
                  </div>
                  <div 
                    className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={opponentProgress}
                    aria-valuemin={0}
                    aria-valuemax={word.length}
                    aria-label={`Progression de ${opponent.displayName}`}
                  >
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(opponentProgress / word.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne centrale - Webcam */}
        <div className="lg:col-span-6 order-2">
          <div 
            className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-800"
            role="img"
            aria-label="Flux webcam pour la reconnaissance des signes"
          >
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
              style={{ objectFit: "cover" }}
              aria-hidden="true"
            />

            {/* Loading */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div 
                  className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mb-4"
                  role="status"
                  aria-label="Chargement de la caméra"
                />
                <p className="text-neutral-500">Chargement...</p>
              </div>
            )}

            {/* Live indicator */}
            {isStreaming && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                  En direct
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite - Lettre à signer */}
        <div className="lg:col-span-3 order-3">
          <div className="lg:sticky lg:top-20">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
              Signe cette lettre
            </p>
            
            <motion.span
              key={currentLetter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-orange-500"
              role="status"
              aria-live="polite"
              aria-label={currentLetter ? `Signe la lettre ${currentLetter}` : "Terminé"}
            >
              {currentLetter || "✓"}
            </motion.span>

            {/* Détection */}
            {displayedLetter && (
              <div className="mt-4" role="status" aria-live="polite">
                <p className="text-xs text-neutral-500 mb-1">Détecté</p>
                <span 
                  className={`text-4xl font-black ${
                    displayedLetter === currentLetter ? "text-green-500" : "text-neutral-400"
                  }`}
                  aria-label={`Lettre détectée: ${displayedLetter}${displayedLetter === currentLetter ? ", correct !" : ""}`}
                >
                  {displayedLetter}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
