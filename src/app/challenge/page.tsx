"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useGameTimer } from "@/hooks/useGameTimer";
import { GameHeader, formatTime } from "@/components/game";
import { ShareChallenge } from "./_components/ShareChallenge";
import { 
  getRandomWord, 
  loadChallenge, 
  createChallenge, 
  saveChallengeResponse 
} from "./_lib/challengeService";
import type { GameState, ChallengeResult as ChallengeResultType } from "@/types/game";

export default function ChallengePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChallengeContent />
    </Suspense>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
    </div>
  );
}

function ChallengeContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id");
  const { user, loading: authLoading } = useRequireAuth();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [word, setWord] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);
  const [opponentResult, setOpponentResult] = useState<ChallengeResultType | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const { elapsedTime, startTimer, stopTimer, resetTimer } = useGameTimer();

  const {
    videoRef, canvasRef, isStreaming, isLoading, loadingStep, 
    loadingProgress, error, predictedLetter, startCamera, stopCamera,
  } = useMediaPipeHands();

  const { displayedLetter, isValidated } = useLetterStabilization({
    predictedLetter,
    isActive: isStreaming && gameState === "playing",
  });

  const currentLetter = word[currentIndex];

  useEffect(() => {
    if (challengeId) {
      loadChallenge(challengeId).then(({ word: w, result }) => {
        setWord(w);
        if (result) setOpponentResult(result);
      });
    } else {
      setWord(getRandomWord());
    }
  }, [challengeId]);

  useEffect(() => {
    if (gameState !== "playing" || !isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;

    if (displayedLetter === currentLetter) {
      setLastValidatedLetter(displayedLetter);
      
      if (currentIndex === word.length - 1) {
        const time = stopTimer();
        setFinalTime(time);
        setGameState("finished");
        
        if (user) {
          if (challengeId) {
            saveChallengeResponse(user, challengeId, time);
          } else {
            createChallenge(user, word, time).then(setShareUrl);
          }
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [isValidated, displayedLetter, currentLetter, currentIndex, word, gameState, stopTimer, user, challengeId, lastValidatedLetter]);

  const startGame = useCallback(() => {
    if (!isStreaming) return;
    
    setGameState("countdown");
    setCountdown(3);
    setCurrentIndex(0);
    setFinalTime(null);
    setLastValidatedLetter(null);
    setShareUrl("");
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

  const getMatchResult = () => {
    if (!finalTime || !opponentResult) return null;
    if (finalTime < opponentResult.odTime) return "win";
    if (finalTime > opponentResult.odTime) return "lose";
    return "tie";
  };

  const matchResult = getMatchResult();

  if (authLoading) return <LoadingSpinner />;

  const title = opponentResult ? "Défi à relever" : "Défie un ami";

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <GameHeader title={title} />

      <main className="pt-14 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Bannière défi */}
          {opponentResult && gameState === "idle" && (
            <div className="py-6 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-neutral-500">
                    <span className="font-bold text-neutral-900 dark:text-white">{opponentResult.odDisplayName}</span> t&apos;a défié !
                  </p>
                  <p className="text-3xl font-black mt-1">
                    Mot : <span className="text-orange-500">{word}</span>
                  </p>
                </div>
                <div className="text-center px-6 py-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500">Son temps</p>
                  <p className="text-2xl font-mono font-black text-orange-500">
                    {formatTime(opponentResult.odTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Layout 3 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
            
            {/* Colonne gauche - Mot */}
            <div className="lg:col-span-3 order-1">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  {gameState === "playing" ? "Épelle le mot" : "Mot du défi"}
                </p>
                
                {gameState === "countdown" && (
                  <motion.span
                    key={countdown}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-[120px] font-black leading-none text-orange-500"
                  >
                    {countdown}
                  </motion.span>
                )}

                {(gameState === "idle" || gameState === "playing" || gameState === "finished") && word && (
                  <div className="flex gap-2 flex-wrap">
                    {word.split("").map((letter, i) => (
                      <span
                        key={i}
                        className={`text-4xl sm:text-5xl lg:text-6xl font-black ${
                          i < currentIndex
                            ? "text-green-500"
                            : i === currentIndex && gameState === "playing"
                            ? "text-orange-500"
                            : gameState === "finished"
                            ? "text-green-500"
                            : "text-neutral-300 dark:text-neutral-700"
                        }`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                )}

                {gameState === "finished" && (
                  <div className="mt-4">
                    {matchResult === "win" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">
                        🎉 Tu as gagné !
                      </span>
                    )}
                    {matchResult === "lose" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold">
                        😅 Presque ! Réessaie
                      </span>
                    )}
                    {matchResult === "tie" && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm font-bold">
                        🤝 Égalité parfaite !
                      </span>
                    )}
                    {!matchResult && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-bold">
                        ✓ Terminé !
                      </span>
                    )}
                  </div>
                )}

                {/* Timer */}
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                    Temps
                  </p>
                  <p className={`text-4xl font-mono font-black ${
                    gameState === "finished" && matchResult === "win" ? "text-green-500" : ""
                  }`}>
                    {formatTime(gameState === "finished" && finalTime ? finalTime : elapsedTime)}
                  </p>
                </div>

                {/* Progress */}
                {gameState === "playing" && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Progression</span>
                      <span>{currentIndex + 1} / {word.length}</span>
                    </div>
                    <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / word.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Comparaison */}
                {opponentResult && gameState === "finished" && finalTime && (
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-center">
                        <p className="text-neutral-500">Toi</p>
                        <p className={`font-mono font-bold ${matchResult === "win" ? "text-green-500" : ""}`}>
                          {formatTime(finalTime)}
                        </p>
                      </div>
                      <span className="text-neutral-400">vs</span>
                      <div className="text-center">
                        <p className="text-neutral-500">{opponentResult.odDisplayName}</p>
                        <p className={`font-mono font-bold ${matchResult === "lose" ? "text-green-500" : ""}`}>
                          {formatTime(opponentResult.odTime)}
                        </p>
                      </div>
                    </div>
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
                      <span className="text-4xl">🎯</span>
                    </div>
                    <p className="text-neutral-500 mb-4 text-center">
                      {opponentResult 
                        ? `Bats le temps de ${opponentResult.odDisplayName} !`
                        : "Signe un mot et défie tes amis"}
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
                        Prêt ? Clique sur &quot;{opponentResult ? "Relever le défi" : "Commencer"}&quot;
                      </div>
                    )}

                    {gameState === "playing" && displayedLetter && (
                      <div className="absolute top-4 right-4">
                        <div className={`px-4 py-3 rounded-xl ${
                          displayedLetter === currentLetter
                            ? "bg-green-500 text-white"
                            : "bg-black/70 text-white"
                        }`}>
                          <span className="text-3xl font-black">{displayedLetter}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-4 mt-4">
                {isStreaming && gameState === "idle" && (
                  <button
                    onClick={startGame}
                    className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
                  >
                    {opponentResult ? "Relever le défi 🎯" : "Commencer 🚀"}
                  </button>
                )}

                {gameState === "finished" && (
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold"
                    >
                      Rejouer
                    </button>
                    {!challengeId && (
                      <Link
                        href="/challenge"
                        className="px-6 py-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-full font-medium hover:border-orange-500 transition-colors"
                        onClick={() => window.location.reload()}
                      >
                        Nouveau mot
                      </Link>
                    )}
                  </div>
                )}

                {isStreaming && (gameState === "idle" || gameState === "finished") && (
                  <button
                    onClick={stopCamera}
                    className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Arrêter la caméra
                  </button>
                )}
              </div>
            </div>

            {/* Colonne droite - Résultat & Partage */}
            <div className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-20">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  {gameState === "playing" ? "Lettre à signer" : "Lettre détectée"}
                </p>
                
                {/* Afficher la lettre à signer ou détectée */}
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

                {gameState !== "playing" && (
                  <AnimatePresence mode="wait">
                    {displayedLetter ? (
                      <motion.span
                        key={displayedLetter}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-[120px] sm:text-[150px] lg:text-[180px] font-black leading-none text-neutral-900 dark:text-white"
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
                )}

                {/* Indicateur match */}
                {displayedLetter && gameState === "playing" && (
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    displayedLetter === currentLetter 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  }`}>
                    {displayedLetter === currentLetter ? "✓ Correct" : "→ Continue"}
                  </div>
                )}

                {/* Partage */}
                {gameState === "finished" && !challengeId && shareUrl && finalTime && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <ShareChallenge shareUrl={shareUrl} finalTime={finalTime} />
                  </div>
                )}

                {/* Instructions */}
                {gameState === "idle" && !opponentResult && (
                  <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
                      Comment ça marche ?
                    </p>
                    <ol className="space-y-3 text-sm text-neutral-500">
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <span>Signe le mot le plus vite possible</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <span>Partage ton temps avec un ami</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <span>Il devra faire mieux que toi !</span>
                      </li>
                    </ol>
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
