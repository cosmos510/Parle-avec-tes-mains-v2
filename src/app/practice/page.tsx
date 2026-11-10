"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useAuth } from "@/contexts/AuthContext";
import { recordLetterValidation, recordChallengeComplete } from "@/lib/progression";
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
  const router = useRouter();
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
  const [announcement, setAnnouncement] = useState("");
  const [xpNotification, setXpNotification] = useState<{ xp: number; message: string } | null>(null);

  const { user, loading: authLoading, refreshProfile } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const {
    videoRef,
    canvasRef,
    isStreaming,
    isLoading,
    loadingStep,
    loadingProgress,
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

  // Show XP notification
  const showXpGain = useCallback((xp: number, message: string) => {
    setXpNotification({ xp, message });
    setTimeout(() => setXpNotification(null), 2000);
  }, []);

  // Announce changes for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(""), 1000);
  }, []);

  const pickRandomLetter = useCallback(() => {
    const letter = ASL_ALPHABET[Math.floor(Math.random() * ASL_ALPHABET.length)];
    setTargetLetter(letter);
    announce(`Nouvelle lettre cible : ${letter}`);
  }, [announce]);

  const handleModeChange = useCallback((newMode: PracticeMode) => {
    setMode(newMode);
    announce(`Mode ${newMode === "free" ? "libre" : "challenge"} activé`);
    if (newMode === "free") {
      pickRandomLetter();
    } else {
      setChallengeProgress([]);
    }
  }, [pickRandomLetter, announce]);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    announce("Bravo ! Lettre validée !");
    setTimeout(() => setShowCelebration(false), 1500);
  }, [announce]);

  const resetGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setChallengeProgress([]);
    setCurrentChallenge(0);
    setLastValidatedLetter(null);
    announce("Partie réinitialisée");
    if (mode === "free") pickRandomLetter();
  }, [mode, pickRandomLetter, announce]);

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

  // Announce detected letter
  useEffect(() => {
    if (displayedLetter && isValidated) {
      announce(`Lettre détectée : ${displayedLetter}`);
    }
  }, [displayedLetter, isValidated, announce]);

  // Save progression to Firebase when user validates a letter
  const saveProgression = useCallback(async (letter: string, isChallenge: boolean = false, word?: string) => {
    if (!user) return;
    
    try {
      if (isChallenge && word) {
        const result = await recordChallengeComplete(user.uid, word, true);
        showXpGain(result.xpGained, "Challenge terminé !");
      } else {
        const result = await recordLetterValidation(user.uid, letter);
        let message = `+${result.xpGained} XP`;
        if (result.letterMastered) {
          message = `${letter} maîtrisée ! +${result.xpGained} XP`;
        }
        if (result.newLevel) {
          message += " 🎉 Niveau supérieur !";
        }
        showXpGain(result.xpGained, message);
      }
      // Refresh profile to update navbar/stats
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
      // Save to Firebase if logged in
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
          // Save challenge completion to Firebase
          saveProgression(displayedLetter, true, challenge.word);
          setTimeout(() => {
            setChallengeProgress([]);
            setCurrentChallenge((c) => (c + 1) % CHALLENGES.length);
          }, 2000);
        } else {
          // Save individual letter progress
          saveProgression(displayedLetter);
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
    saveProgression,
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
      {/* Live region for screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm shadow-lg"
          >
            ✓ Bien joué !
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Notification */}
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

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <nav className="max-w-5xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between" aria-label="Navigation principale">
          <Link 
            href="/" 
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
            aria-label="Retour à l'accueil"
          >
            ← Retour
          </Link>
          
          <div className="flex items-center gap-3" aria-label="Score actuel">
            <span className="text-sm">
              <span className="font-bold text-neutral-900 dark:text-white" aria-label={`Score : ${score} points`}>{score}</span>
              <span className="text-neutral-400 ml-1 hidden sm:inline">pts</span>
            </span>
            {streak > 2 && (
              <span 
                className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-medium"
                aria-label={`Série de ${streak}`}
              >
                🔥 {streak}
              </span>
            )}
          </div>
        </nav>
      </header>

      <main id="main-content" className="pt-14 sm:pt-16 pb-6 sm:pb-12 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Mode + Target */}
          <div className="mb-4 sm:mb-6">
            {/* Mode selector */}
            <div className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6" role="tablist" aria-label="Sélection du mode">
              <button
                onClick={() => handleModeChange("free")}
                role="tab"
                aria-selected={mode === "free"}
                aria-controls="practice-content"
                className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                  mode === "free"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Libre
              </button>
              <button
                onClick={() => handleModeChange("challenge")}
                role="tab"
                aria-selected={mode === "challenge"}
                aria-controls="practice-content"
                className={`px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                  mode === "challenge"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                Challenge
              </button>
            </div>

            {/* Target letter */}
            <div id="practice-content" role="tabpanel">
              {mode === "free" && targetLetter && (
                <div className="text-center" aria-label={`Lettre à signer : ${targetLetter}`}>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-1" id="target-label">Signe la lettre</p>
                  <motion.span
                    key={targetLetter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block text-6xl sm:text-7xl md:text-8xl font-black text-orange-500"
                    aria-labelledby="target-label"
                  >
                    {targetLetter}
                  </motion.span>
                </div>
              )}

              {mode === "challenge" && (
                <div className="text-center" aria-label={`Mot à épeler : ${CHALLENGES[currentChallenge].word}`}>
                  <p className="text-xs sm:text-sm text-neutral-500 mb-1">Épelle</p>
                  <div className="flex justify-center gap-1 sm:gap-2" role="list" aria-label="Lettres du mot">
                    {CHALLENGES[currentChallenge].word.split("").map((letter, i) => (
                      <span
                        key={i}
                        role="listitem"
                        aria-label={`${letter}${i < challengeProgress.length ? ", validée" : i === challengeProgress.length ? ", en cours" : ", à venir"}`}
                        className={`text-3xl sm:text-4xl md:text-5xl font-black ${
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
            </div>
          </div>

          {/* Main layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Camera */}
            <section className="lg:col-span-2 order-1" aria-label="Zone de pratique avec webcam">
              <div className="relative aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
                <video 
                  ref={videoRef} 
                  className="hidden"
                  playsInline 
                  muted 
                  autoPlay
                  aria-hidden="true"
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
                  style={{ objectFit: 'cover' }}
                  aria-label="Flux vidéo de la webcam avec détection de la main"
                  role="img"
                />

                {!isStreaming && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <p className="text-neutral-500 mb-3 text-sm sm:text-base text-center" id="camera-instruction">
                      Active ta webcam pour commencer
                    </p>
                    <button
                      onClick={startCamera}
                      aria-describedby="camera-instruction"
                      className="px-5 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm sm:text-base hover:scale-105 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      Activer 📷
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6" role="status" aria-label="Chargement en cours">
                    {/* Spinner animé */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5">
                      <div className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-700 rounded-full" />
                      <div 
                        className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"
                        style={{ animationDuration: '1s' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg sm:text-xl font-bold text-neutral-600 dark:text-neutral-300">
                          {loadingProgress}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Message de chargement */}
                    <p className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base mb-2">
                      {loadingStep}
                    </p>
                    
                    {/* Barre de progression */}
                    <div className="w-48 sm:w-64 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-4">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                    
                    {/* Message rassurant */}
                    <p className="text-neutral-500 text-xs sm:text-sm text-center max-w-xs">
                      Le premier chargement peut prendre quelques secondes, c&apos;est normal !
                    </p>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-red-500 text-white text-xs sm:text-sm rounded-lg" role="alert">
                    {error}
                  </div>
                )}

                {isStreaming && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs" aria-label="Webcam active">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                    LIVE
                  </div>
                )}

                {isStreaming && displayedLetter && (
                  <div className="absolute top-3 right-3" aria-live="polite">
                    <div
                      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl ${
                        isValidated && isCorrectLetter
                          ? "bg-green-500 text-white"
                          : "bg-black/70 text-white"
                      }`}
                      aria-label={`Lettre détectée : ${displayedLetter}, confiance ${confidence}%${isValidated && isCorrectLetter ? ", validée !" : ""}`}
                    >
                      <span className="text-2xl sm:text-3xl font-black block">{displayedLetter}</span>
                      <span className="text-[10px] sm:text-xs opacity-70">{confidence}%</span>
                      {!isValidated && (
                        <div className="mt-1.5 h-1 w-12 sm:w-16 bg-white/20 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stableProgress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de validation">
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
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs" aria-label="En attente de détection de la main">
                    👋 Montre ta main
                  </div>
                )}
              </div>

              {isStreaming && (
                <div className="flex justify-center gap-4 mt-3">
                  <button
                    onClick={stopCamera}
                    className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded px-2 py-1"
                    aria-label="Arrêter la webcam"
                  >
                    Arrêter
                  </button>
                  <button
                    onClick={resetGame}
                    className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded px-2 py-1"
                    aria-label="Recommencer la partie"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="order-2 flex flex-col gap-3 sm:gap-4" aria-label="Outils et statistiques">
              
              {/* Alphabet */}
              <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800" aria-labelledby="alphabet-title">
                <h2 id="alphabet-title" className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Alphabet</h2>
                <div className="grid grid-cols-9 sm:grid-cols-6 gap-1 sm:gap-1.5" role="group" aria-label="Sélection de lettre cible">
                  {ASL_ALPHABET.map((letter) => {
                    const isTarget = targetLetter === letter;
                    const isDetected = displayedLetter === letter;

                    return (
                      <button
                        key={letter}
                        onClick={() => mode === "free" && setTargetLetter(letter)}
                        disabled={mode !== "free"}
                        aria-label={`${letter}${isTarget ? ", cible actuelle" : ""}${isDetected ? ", détectée" : ""}`}
                        aria-pressed={isTarget}
                        className={`aspect-square rounded sm:rounded-lg text-xs sm:text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500 ${
                          isDetected
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                            : isTarget
                            ? "bg-orange-500 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        } ${mode === "free" ? "cursor-pointer active:scale-95" : "cursor-default"}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-neutral-500 mt-2 sm:mt-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-orange-500" aria-hidden="true" />
                    cible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-neutral-900 dark:bg-white" aria-hidden="true" />
                    détecté
                  </span>
                </div>
              </section>

              {/* Stats + Help */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                
                {/* Stats */}
                <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800" aria-labelledby="stats-title">
                  <h2 id="stats-title" className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Session</h2>
                  <div className="flex justify-around sm:grid sm:grid-cols-2 gap-2 sm:gap-4 text-center">
                    <div>
                      <p className="text-2xl sm:text-3xl font-black" aria-label={`${score} points`}>{score}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500">Points</p>
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-black" aria-label={`Série de ${streak}`}>{streak}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-500">Série</p>
                    </div>
                  </div>
                </section>

                {/* Help */}
                <section className="p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-neutral-200 dark:border-neutral-800" aria-labelledby="help-title">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h2 id="help-title" className="font-bold text-sm sm:text-base">Aide</h2>
                    <button
                      onClick={() => {
                        if (!isStreaming || !displayedLetter) {
                          setShowHints(!showHints);
                        }
                      }}
                      disabled={isStreaming && !!displayedLetter}
                      aria-expanded={showHints}
                      aria-controls="hints-panel"
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                        isStreaming && displayedLetter
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      {showHints ? "Masquer" : "Voir"}
                    </button>
                  </div>

                  <div id="hints-panel">
                    {isStreaming && displayedLetter ? (
                      <p className="text-[10px] sm:text-xs text-neutral-400 italic">
                        Masqué pendant que tu signes
                      </p>
                    ) : showHints ? (
                      <div className="space-y-2 sm:space-y-3">
                        <div className="grid grid-cols-7 sm:grid-cols-9 gap-0.5 sm:gap-1" role="group" aria-label="Sélectionner une lettre pour voir l'aide">
                          {ASL_ALPHABET.map((letter) => (
                            <button
                              key={letter}
                              onClick={() => setSelectedHintLetter(letter)}
                              aria-pressed={selectedHintLetter === letter}
                              aria-label={`Voir l'aide pour ${letter}`}
                              className={`aspect-square rounded text-[10px] sm:text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-orange-500 ${
                                selectedHintLetter === letter
                                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
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
                              className="p-2 sm:p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800"
                              role="region"
                              aria-label={`Aide pour la lettre ${selectedHintLetter}`}
                            >
                              <p className="text-lg sm:text-2xl font-black">{selectedHintLetter}</p>
                              <p className="text-[10px] sm:text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
                                {SIGN_HINTS[selectedHintLetter]}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-[10px] sm:text-xs text-neutral-400">
                        Comment signer ?
                      </p>
                    )}
                  </div>
                </section>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
