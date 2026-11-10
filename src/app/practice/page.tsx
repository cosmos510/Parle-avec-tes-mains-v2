"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { recordLetterValidation, recordChallengeComplete } from "@/lib/progression";
import { ASL_ALPHABET, CHALLENGES, SCORING } from "@/lib/constants";
import type { PracticeMode } from "@/types/practice";

import { PracticeHeader } from "./_components/PracticeHeader";
import { ModeSelector } from "./_components/ModeSelector";
import { TargetDisplay } from "./_components/TargetDisplay";
import { PracticeWebcam } from "./_components/PracticeWebcam";
import { AlphabetGrid } from "./_components/AlphabetGrid";
import { SessionStats } from "./_components/SessionStats";
import { HelpPanel } from "./_components/HelpPanel";

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

  // Sélectionner une lettre aléatoire
  const pickRandomLetter = useCallback(() => {
    const letter = ASL_ALPHABET[Math.floor(Math.random() * ASL_ALPHABET.length)];
    setTargetLetter(letter);
  }, []);

  // Changer de mode
  const handleModeChange = useCallback((newMode: PracticeMode) => {
    setMode(newMode);
    if (newMode === "free") {
      pickRandomLetter();
    } else {
      setChallengeProgress([]);
    }
  }, [pickRandomLetter]);

  // Célébration
  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);
  }, []);

  // Reset
  const resetGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setChallengeProgress([]);
    setCurrentChallenge(0);
    setLastValidatedLetter(null);
    if (mode === "free") pickRandomLetter();
  }, [mode, pickRandomLetter]);

  // Init
  useEffect(() => {
    if (mode === "free" && !targetLetter) {
      pickRandomLetter();
    }
  }, [mode, targetLetter, pickRandomLetter]);

  // Notification XP
  const showXpGain = useCallback((xp: number, message: string) => {
    setXpNotification({ xp, message });
    setTimeout(() => setXpNotification(null), 2000);
  }, []);

  // Sauvegarder progression
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
        if (result.newLevel) message += " 🎉 Niveau supérieur !";
        showXpGain(result.xpGained, message);
      }
      refreshProfile();
    } catch (error) {
      console.error("Error saving progression:", error);
    }
  }, [user, showXpGain, refreshProfile]);

  // Validation des lettres
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

  // Est-ce la bonne lettre ?
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
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-orange-500 rounded-full animate-spin" />
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
          >
            {xpNotification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <PracticeHeader score={score} streak={streak} />

      <main className="pt-14 sm:pt-16 pb-6 sm:pb-12 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Mode + Cible */}
          <div className="mb-4 sm:mb-6">
            <ModeSelector mode={mode} onChange={handleModeChange} />
            <TargetDisplay 
              mode={mode}
              targetLetter={targetLetter}
              currentChallenge={currentChallenge}
              challengeProgress={challengeProgress}
            />
          </div>

          {/* Layout principal */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Webcam */}
            <section className="lg:col-span-2 order-1">
              <PracticeWebcam
                videoRef={videoRef}
                canvasRef={canvasRef}
                isStreaming={isStreaming}
                isLoading={isLoading}
                loadingStep={loadingStep}
                loadingProgress={loadingProgress}
                error={error}
                onStartCamera={startCamera}
                displayedLetter={displayedLetter}
                confidence={confidence}
                stableProgress={stableProgress}
                isValidated={isValidated}
                isCorrectLetter={isCorrectLetter}
              />

              {isStreaming && (
                <div className="flex justify-center gap-4 mt-3">
                  <button
                    onClick={stopCamera}
                    className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded px-2 py-1"
                  >
                    Arrêter
                  </button>
                  <button
                    onClick={resetGame}
                    className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded px-2 py-1"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="order-2 flex flex-col gap-3 sm:gap-4">
              <AlphabetGrid
                mode={mode}
                targetLetter={targetLetter}
                displayedLetter={displayedLetter}
                onSelectLetter={setTargetLetter}
              />

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                <SessionStats score={score} streak={streak} />
                <HelpPanel isDisabled={isStreaming && !!displayedLetter} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
