"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { ASL_ALPHABET, CHALLENGES, SCORING } from "@/lib/constants";
import type { PracticeMode } from "@/types/practice";

const SIGN_HINTS: Record<string, string> = {
  A: "Poing fermé, pouce sur le côté",
  B: "Main plate, doigts serrés, pouce replié",
  C: "Main en forme de C",
  D: "Index levé, autres doigts en cercle avec pouce",
  E: "Doigts repliés sur la paume, pouce dessous",
  F: "Pouce et index en cercle, autres doigts levés",
  G: "Index et pouce parallèles, horizontaux",
  H: "Index et majeur horizontaux, parallèles",
  I: "Petit doigt levé, poing fermé",
  J: "Petit doigt levé, mouvement en J",
  K: "Index et majeur en V, pouce entre",
  L: "Pouce et index en L",
  M: "3 doigts sur le pouce, poing",
  N: "2 doigts sur le pouce, poing",
  O: "Doigts en cercle, forme de O",
  P: "Comme K mais vers le bas",
  Q: "Comme G mais vers le bas",
  R: "Index et majeur croisés",
  S: "Poing fermé, pouce devant",
  T: "Pouce entre index et majeur",
  U: "Index et majeur levés, collés",
  V: "Index et majeur en V",
  W: "Index, majeur, annulaire levés",
  X: "Index plié en crochet",
  Y: "Pouce et petit doigt tendus",
  Z: "Index dessine un Z",
};

export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>("free");
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState<string[]>([]);
  const [targetLetter, setTargetLetter] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [selectedHintLetter, setSelectedHintLetter] = useState<string | null>(null);

  const {
    videoRef,
    canvasRef,
    isStreaming,
    isLoading,
    error,
    predictedLetter,
    confidence,
    startCamera,
    stopCamera,
  } = useMediaPipeHands();

  const {
    displayedLetter,
    progress: stableProgress,
    isValidated,
  } = useLetterStabilization({
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

  useEffect(() => {
    if (isStreaming && displayedLetter) {
      setShowHints(false);
      setSelectedHintLetter(null);
    }
  }, [isStreaming, displayedLetter]);

  useEffect(() => {
    if (!isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;

    setLastValidatedLetter(displayedLetter);

    if (mode === "free" && targetLetter && displayedLetter === targetLetter) {
      setScore((s) => s + SCORING.FREE_MODE_SUCCESS);
      setStreak((s) => s + 1);
      triggerCelebration();
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
          setTimeout(() => {
            setChallengeProgress([]);
            setCurrentChallenge((c) => (c + 1) % CHALLENGES.length);
          }, 2000);
        }
      }
    }
  }, [
    isValidated,
    displayedLetter,
    lastValidatedLetter,
    mode,
    targetLetter,
    challengeProgress,
    currentChallenge,
    streak,
    pickRandomLetter,
    triggerCelebration,
  ]);

  const isCorrectLetter = (() => {
    if (!displayedLetter) return false;
    if (mode === "free") return displayedLetter === targetLetter;
    if (mode === "challenge") {
      const expected = CHALLENGES[currentChallenge].word[challengeProgress.length];
      return displayedLetter === expected;
    }
    return false;
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Toast de célébration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold shadow-lg"
          >
            ✓ Bien joué !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            ← Retour
          </Link>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500">
              <span className="font-bold text-neutral-900 dark:text-white">{score}</span> pts
            </span>
            {streak > 2 && (
              <span className="px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium">
                🔥 {streak}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Mode selector */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => handleModeChange("free")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                mode === "free"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Libre
            </button>
            <button
              onClick={() => handleModeChange("challenge")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                mode === "challenge"
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Challenge
            </button>
          </div>

          {/* Lettre cible */}
          {mode === "free" && targetLetter && (
            <div className="text-center mb-8">
              <p className="text-sm text-neutral-500 mb-2">Signe la lettre</p>
              <motion.span
                key={targetLetter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block text-7xl sm:text-8xl md:text-9xl font-black text-orange-500"
              >
                {targetLetter}
              </motion.span>
            </div>
          )}

          {mode === "challenge" && (
            <div className="text-center mb-8">
              <p className="text-sm text-neutral-500 mb-2">Épelle</p>
              <div className="flex justify-center gap-2">
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
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grille principale */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Zone caméra */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
                <video 
                  ref={videoRef} 
                  className="hidden"
                  playsInline 
                  muted 
                  autoPlay
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
                  style={{ objectFit: 'cover' }}
                />

                {!isStreaming && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-neutral-500 mb-4">Active ta webcam pour commencer</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform"
                    >
                      Activer la caméra 📷
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mb-4" />
                    <p className="text-neutral-500">Chargement...</p>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-500 text-white text-sm rounded-lg">
                    {error}
                  </div>
                )}

                {isStreaming && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                  </div>
                )}

                {isStreaming && displayedLetter && (
                  <div className="absolute top-4 right-4">
                    <div
                      className={`px-4 py-3 rounded-xl ${
                        isValidated && isCorrectLetter
                          ? "bg-green-500 text-white"
                          : "bg-black/70 text-white"
                      }`}
                    >
                      <span className="text-3xl font-black block">{displayedLetter}</span>
                      <span className="text-xs opacity-70">{confidence}%</span>
                      {!isValidated && (
                        <div className="mt-2 h-1 w-16 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all"
                            style={{ width: `${stableProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isStreaming && !displayedLetter && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
                    👋 Montre ta main
                  </div>
                )}
              </div>

              {isStreaming && (
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={stopCamera}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Arrêter
                  </button>
                  <button
                    onClick={resetGame}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              
              {/* Alphabet */}
              <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
                <p className="font-bold mb-3">Alphabet</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {ASL_ALPHABET.map((letter) => {
                    const isTarget = targetLetter === letter;
                    const isDetected = displayedLetter === letter;

                    return (
                      <button
                        key={letter}
                        onClick={() => mode === "free" && setTargetLetter(letter)}
                        disabled={mode !== "free"}
                        className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                          isDetected
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                            : isTarget
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        } ${mode === "free" ? "cursor-pointer" : "cursor-default"}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 mt-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-orange-500" />
                    cible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-neutral-900 dark:bg-white" />
                    détecté
                  </span>
                </div>
              </div>

              {/* Aide-mémoire */}
              <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold">Aide-mémoire</p>
                  <button
                    onClick={() => {
                      if (!isStreaming || !displayedLetter) {
                        setShowHints(!showHints);
                      }
                    }}
                    disabled={isStreaming && !!displayedLetter}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isStreaming && displayedLetter
                        ? "text-neutral-300 cursor-not-allowed"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {showHints ? "Masquer" : "Afficher"}
                  </button>
                </div>

                {isStreaming && displayedLetter ? (
                  <p className="text-xs text-neutral-400 italic">
                    Masqué pendant que tu signes
                  </p>
                ) : showHints ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-9 gap-1">
                      {ASL_ALPHABET.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => setSelectedHintLetter(letter)}
                          className={`aspect-square rounded text-xs font-medium transition-colors ${
                            selectedHintLetter === letter
                              ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedHintLetter && (
                        <motion.div
                          key={selectedHintLetter}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                        >
                          <p className="text-2xl font-black mb-1">{selectedHintLetter}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {SIGN_HINTS[selectedHintLetter]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Clique sur Afficher pour voir comment signer
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
                <p className="font-bold mb-3">Session</p>
                <div className="grid grid-cols-2 gap-4 text-center">
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
          </div>
        </div>
      </main>
    </div>
  );
}
