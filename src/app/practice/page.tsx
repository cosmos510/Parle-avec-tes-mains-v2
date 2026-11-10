"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { recordLetterValidation, recordChallengeComplete } from "@/lib/progression";
import { ASL_ALPHABET, CHALLENGES, SCORING } from "@/lib/constants";
import { GameHeader } from "@/components/game";
import type { PracticeMode } from "@/types/practice";

export default function PracticePage() {
  const { user, loading: authLoading, refreshProfile } = useRequireAuth();

  const [mode, setMode] = useState<PracticeMode>("free");
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState<string[]>([]);
  const [targetLetter, setTargetLetter] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);
  const [xpNotification, setXpNotification] = useState<{ xp: number; message: string } | null>(null);

  const {
    videoRef, canvasRef, isStreaming, isLoading, loadingStep,
    loadingProgress, error, predictedLetter, confidence, startCamera, stopCamera,
  } = useMediaPipeHands();

  const { displayedLetter, progress: stableProgress, isValidated } = useLetterStabilization({
    predictedLetter,
    isActive: isStreaming,
  });

  const pickRandomLetter = useCallback(() => {
    const letter = ASL_ALPHABET[Math.floor(Math.random() * ASL_ALPHABET.length)];
    setTargetLetter(letter);
  }, []);

  const handleModeChange = useCallback((newMode: PracticeMode) => {
    setMode(newMode);
    if (newMode === "free") {
      pickRandomLetter();
    } else {
      setChallengeProgress([]);
    }
  }, [pickRandomLetter]);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setChallengeProgress([]);
    setCurrentChallenge(0);
    setLastValidatedLetter(null);
    if (mode === "free") pickRandomLetter();
  }, [mode, pickRandomLetter]);

  useEffect(() => {
    if (mode === "free" && !targetLetter) {
      pickRandomLetter();
    }
  }, [mode, targetLetter, pickRandomLetter]);

  const showXpGain = useCallback((xp: number, message: string) => {
    setXpNotification({ xp, message });
    setTimeout(() => setXpNotification(null), 2000);
  }, []);

  const saveProgression = useCallback(async (letter: string, isChallenge = false, word?: string) => {
    if (!user) return;
    
    try {
      if (isChallenge && word) {
        const result = await recordChallengeComplete(user.uid, word, true);
        showXpGain(result.xpGained, "Challenge terminé !");
      } else {
        const result = await recordLetterValidation(user.uid, letter);
        let message = `+${result.xpGained} XP`;
        if (result.letterMastered) message = `${letter} maîtrisée ! +${result.xpGained} XP`;
        if (result.newLevel) message += " Niveau supérieur !";
        showXpGain(result.xpGained, message);
      }
      refreshProfile();
    } catch (error) {
      console.error("Error saving progression:", error);
    }
  }, [user, showXpGain, refreshProfile]);

  useEffect(() => {
    if (!isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;

    setLastValidatedLetter(displayedLetter);

    if (mode === "free" && targetLetter && displayedLetter === targetLetter) {
      setScore((s) => s + SCORING.FREE_MODE_SUCCESS);
      setStreak((s) => s + 1);
      triggerCelebration();
      saveProgression(displayedLetter);
      setTimeout(pickRandomLetter, 1500);
    }

    if (mode === "challenge") {
      const challenge = CHALLENGES[currentChallenge];
      const expectedLetter = challenge.word[challengeProgress.length];

      if (displayedLetter === expectedLetter) {
        const newProgress = [...challengeProgress, displayedLetter];
        setChallengeProgress(newProgress);
        setStreak((s) => s + 1);

        if (newProgress.length === challenge.word.length) {
          setScore((s) => s + SCORING.CHALLENGE_COMPLETE + streak * SCORING.STREAK_BONUS_PER);
          triggerCelebration();
          saveProgression(displayedLetter, true, challenge.word);
          setTimeout(() => {
            setChallengeProgress([]);
            setCurrentChallenge((c) => (c + 1) % CHALLENGES.length);
          }, 2000);
        } else {
          saveProgression(displayedLetter);
        }
      }
    }
  }, [isValidated, displayedLetter, lastValidatedLetter, mode, targetLetter, challengeProgress, currentChallenge, streak, pickRandomLetter, triggerCelebration, saveProgression]);

  const isCorrectLetter = (() => {
    if (!displayedLetter) return false;
    if (mode === "free") return displayedLetter === targetLetter;
    if (mode === "challenge") {
      const expected = CHALLENGES[currentChallenge].word[challengeProgress.length];
      return displayedLetter === expected;
    }
    return false;
  })();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Toasts */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm shadow-lg"
            role="status"
            aria-live="polite"
          >
            ✓ Bien joué !
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {xpNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-20 left-1/2 z-50 px-4 py-2 bg-orange-500 text-white rounded-full font-semibold text-sm shadow-lg"
            role="status"
            aria-live="polite"
          >
            {xpNotification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <GameHeader 
        title="Pratique libre"
        rightContent={
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-500">{score} pts</span>
            <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
              {streak} série
            </span>
          </div>
        }
      />

      <main className="pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Mode selector */}
          <div 
            className="flex justify-center gap-2 py-6 border-b border-neutral-200 dark:border-neutral-800"
            role="tablist"
            aria-label="Modes de pratique"
          >
            <button
              onClick={() => handleModeChange("free")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                mode === "free"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
              role="tab"
              aria-selected={mode === "free"}
              aria-controls="practice-panel"
              id="tab-free"
            >
              Lettre aléatoire
            </button>
            <button
              onClick={() => handleModeChange("challenge")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                mode === "challenge"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
              role="tab"
              aria-selected={mode === "challenge"}
              aria-controls="practice-panel"
              id="tab-challenge"
            >
              Épeler un mot
            </button>
          </div>

          {/* Layout 3 colonnes */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6"
            role="tabpanel"
            id="practice-panel"
            aria-labelledby={mode === "free" ? "tab-free" : "tab-challenge"}
          >
            
            {/* Colonne gauche - Lettre cible */}
            <div className="lg:col-span-3 order-1">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  {mode === "free" ? "Signe cette lettre" : "Épelle le mot"}
                </p>
                
                {mode === "free" && targetLetter && (
                  <motion.div
                    key={targetLetter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    aria-live="polite"
                    aria-label={`Lettre cible : ${targetLetter}`}
                  >
                    <span className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-orange-500">
                      {targetLetter}
                    </span>
                  </motion.div>
                )}

                {mode === "challenge" && (
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500">
                      {CHALLENGES[currentChallenge].hint}
                    </p>
                    <div className="flex gap-2 flex-wrap" role="list" aria-label="Progression du mot">
                      {CHALLENGES[currentChallenge].word.split("").map((letter, i) => (
                        <span
                          key={i}
                          className={`text-4xl sm:text-5xl font-black ${
                            i < challengeProgress.length
                              ? "text-green-500"
                              : i === challengeProgress.length
                              ? "text-orange-500"
                              : "text-neutral-300 dark:text-neutral-700"
                          }`}
                          role="listitem"
                          aria-label={`Lettre ${letter}${i < challengeProgress.length ? ", complétée" : i === challengeProgress.length ? ", en cours" : ", à venir"}`}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mode === "free" && (
                  <button
                    onClick={pickRandomLetter}
                    className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label="Choisir une autre lettre aléatoire"
                  >
                    Autre lettre
                  </button>
                )}

                {/* Stats mobile */}
                <div className="flex gap-4 mt-6 lg:mt-8 lg:flex-col">
                  <div>
                    <p className="text-3xl font-black">{score}</p>
                    <p className="text-xs text-neutral-500">Points</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black">{streak}</p>
                    <p className="text-xs text-neutral-500">Série</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne centrale - Webcam */}
            <div className="lg:col-span-6 order-2">
              <div 
                className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-800"
                role="region"
                aria-label="Zone de la caméra pour la détection des signes"
              >
                <video ref={videoRef} className="hidden" playsInline muted autoPlay aria-hidden="true" />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
                  style={{ objectFit: "cover" }}
                  aria-label="Flux vidéo avec détection de la main"
                  role="img"
                />

                {/* État initial */}
                {!isStreaming && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-4" aria-hidden="true">
                      <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-neutral-500 mb-4 text-center">
                      Active ta webcam pour commencer
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      aria-label="Activer la caméra pour commencer la pratique"
                    >
                      Activer la caméra
                    </button>
                  </div>
                )}

                {/* Chargement */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6" role="status" aria-live="polite" aria-busy="true">
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mb-4" aria-hidden="true" />
                    <p className="font-medium mb-1">{loadingStep}</p>
                    <div 
                      className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={loadingProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progression du chargement"
                    >
                      <div 
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-3">
                      Le premier chargement peut prendre quelques secondes
                    </p>
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-500 text-white text-sm rounded-lg" role="alert" aria-live="assertive">
                    {error}
                  </div>
                )}

                {/* Overlays quand streaming */}
                {isStreaming && (
                  <>
                    {/* LIVE */}
                    <div className="absolute top-4 left-4 flex items-center gap-2" role="status" aria-live="polite">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                      <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                        En direct
                      </span>
                    </div>

                    {/* Instruction si pas de main */}
                    {!displayedLetter && (
                      <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-black/50 text-white text-sm rounded-lg text-center">
                        Montre ta main devant la caméra
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              {isStreaming && (
                <div className="flex justify-center gap-4 mt-4" role="group" aria-label="Actions de contrôle">
                  <button
                    onClick={stopCamera}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label="Arrêter la caméra"
                  >
                    Arrêter la caméra
                  </button>
                  <button
                    onClick={resetGame}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                    aria-label="Recommencer la session"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </div>

            {/* Colonne droite - Résultat */}
            <div className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Lettre détectée
                </p>
                
                <AnimatePresence mode="wait">
                  {displayedLetter ? (
                    <motion.div
                      key={displayedLetter}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      role="status"
                      aria-live="polite"
                      aria-label={`Lettre détectée : ${displayedLetter}`}
                    >
                      <span className={`text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none ${
                        isValidated && isCorrectLetter 
                          ? "text-green-500" 
                          : isCorrectLetter
                          ? "text-orange-500"
                          : "text-neutral-900 dark:text-white"
                      }`}>
                        {displayedLetter}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-neutral-200 dark:text-neutral-800"
                      aria-label="Aucune lettre détectée"
                    >
                      ?
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Indicateurs */}
                {displayedLetter && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>Confiance</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{confidence}%</span>
                    </div>
                    
                    {!isValidated && (
                      <div>
                        <div 
                          className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={stableProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Progression de la validation du geste"
                        >
                          <div
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${stableProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          Maintiens la position...
                        </p>
                      </div>
                    )}

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      isCorrectLetter 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    }`}>
                      {isCorrectLetter ? "✓ Correct" : "→ Continue"}
                    </div>
                  </div>
                )}

                {/* Alphabet */}
                <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3" id="alphabet-label">
                    Alphabet
                  </p>
                  <div 
                    className="grid grid-cols-6 lg:grid-cols-5 gap-1.5"
                    role="listbox"
                    aria-labelledby="alphabet-label"
                    aria-activedescendant={targetLetter ? `letter-${targetLetter}` : undefined}
                  >
                    {ASL_ALPHABET.map((letter) => {
                      const isTarget = targetLetter === letter;
                      const isDetected = displayedLetter === letter;

                      return (
                        <button
                          key={letter}
                          id={`letter-${letter}`}
                          onClick={() => mode === "free" && setTargetLetter(letter)}
                          disabled={mode !== "free"}
                          className={`aspect-square rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                            isDetected
                              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                              : isTarget
                              ? "bg-orange-500 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          } ${mode === "free" ? "cursor-pointer" : "cursor-default"}`}
                          role="option"
                          aria-selected={isTarget}
                          aria-label={`Lettre ${letter}${isTarget ? ", cible actuelle" : ""}${isDetected ? ", détectée" : ""}`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 mt-3" aria-hidden="true">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-orange-500" />
                      cible
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-neutral-900 dark:bg-white" />
                      détecté
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
