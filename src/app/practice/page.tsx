"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { ASL_ALPHABET, CHALLENGES, SCORING } from "@/lib/constants";
import type { PracticeMode } from "@/types/practice";

// Descriptions des signes
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

  // Fermer les hints quand on signe
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
    <div className="min-h-screen bg-background">
      {/* Celebration - petit toast en bas */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-foreground text-background rounded-full font-medium shadow-lg pointer-events-none"
          >
            ✓ Bravo !
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Accueil
          </Link>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Score: <span className="font-semibold text-foreground">{score}</span>
            </span>
            {streak > 2 && (
              <span className="text-muted-foreground">
                Série: <span className="font-semibold text-foreground">{streak}</span>
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
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                mode === "free"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mode libre
            </button>
            <button
              onClick={() => handleModeChange("challenge")}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                mode === "challenge"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Challenge
            </button>
          </div>

          {/* Target display */}
          {mode === "free" && targetLetter && (
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">Signe la lettre</p>
              <motion.span
                key={targetLetter}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block text-8xl sm:text-9xl font-bold"
              >
                {targetLetter}
              </motion.span>
            </div>
          )}

          {mode === "challenge" && (
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">Épelle le mot</p>
              <div className="flex justify-center gap-2">
                {CHALLENGES[currentChallenge].word.split("").map((letter, i) => (
                  <span
                    key={i}
                    className={`text-4xl sm:text-5xl font-bold ${
                      i < challengeProgress.length
                        ? "text-foreground"
                        : i === challengeProgress.length
                        ? "text-foreground"
                        : "text-muted-foreground/30"
                    }`}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Main content grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Camera area */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
                <video 
                  ref={videoRef} 
                  className="hidden"
                  playsInline 
                  muted 
                  autoPlay
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full ${
                    isStreaming ? "block" : "hidden"
                  }`}
                  style={{ objectFit: 'cover' }}
                />

                {!isStreaming && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-4">
                      Active ta webcam pour commencer
                    </p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                      Activer la caméra
                    </button>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                )}

                {error && (
                  <div className="absolute bottom-4 left-4 right-4 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg">
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
                      className={`px-4 py-3 rounded-xl backdrop-blur-sm ${
                        isValidated && isCorrectLetter
                          ? "bg-green-500 text-white"
                          : "bg-black/60 text-white"
                      }`}
                    >
                      <span className="text-3xl font-bold block">{displayedLetter}</span>
                      <span className="text-xs opacity-70">{confidence}%</span>
                      {!isValidated && (
                        <div className="mt-2">
                          <div className="h-1 w-16 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white transition-all"
                              style={{ width: `${stableProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isStreaming && !displayedLetter && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
                    Montre ta main
                  </div>
                )}
              </div>

              {isStreaming && (
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Arrêter
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Recommencer
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Alphabet grid */}
              <div className="p-5 rounded-2xl border border-border">
                <p className="font-medium mb-3">Alphabet</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {ASL_ALPHABET.map((letter) => {
                    const isTarget = targetLetter === letter;
                    const isDetected = displayedLetter === letter;

                    return (
                      <button
                        key={letter}
                        onClick={() => mode === "free" && setTargetLetter(letter)}
                        disabled={mode !== "free"}
                        className={`aspect-square rounded text-sm font-medium transition-all ${
                          isDetected
                            ? "bg-foreground text-background"
                            : isTarget
                            ? "bg-blue-500 text-white"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        } ${mode === "free" ? "cursor-pointer" : "cursor-default"}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-blue-500" />
                    cible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded bg-foreground" />
                    détecté
                  </span>
                </div>
              </div>

              {/* Aide-mémoire */}
              <div className="p-5 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Aide-mémoire</p>
                  <button
                    onClick={() => {
                      if (!isStreaming || !displayedLetter) {
                        setShowHints(!showHints);
                      }
                    }}
                    disabled={isStreaming && !!displayedLetter}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isStreaming && displayedLetter
                        ? "text-muted-foreground/50 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {showHints ? "Masquer" : "Afficher"}
                  </button>
                </div>

                {isStreaming && displayedLetter ? (
                  <p className="text-xs text-muted-foreground italic">
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
                              ? "bg-foreground text-background"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
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
                          className="p-3 rounded-lg bg-muted/50"
                        >
                          <p className="text-2xl font-bold mb-1">{selectedHintLetter}</p>
                          <p className="text-sm text-muted-foreground">
                            {SIGN_HINTS[selectedHintLetter]}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Clique sur Afficher pour voir les signes
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="p-5 rounded-2xl border border-border">
                <p className="font-medium mb-3">Session</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{streak}</p>
                    <p className="text-xs text-muted-foreground">Série</p>
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
