"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useGameTimer } from "@/hooks/useGameTimer";
import { GameHeader, GameCountdown, ProgressBar, WebcamView, formatTime } from "@/components/game";
import { ChallengeInfo } from "./_components/ChallengeInfo";
import { ChallengeResult } from "./_components/ChallengeResult";
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
      <div className="w-8 h-8 border-2 border-neutral-300 border-t-orange-500 rounded-full animate-spin" />
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

  // Charger défi existant ou générer nouveau mot
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

  // Validation des lettres
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

  // Démarrer le jeu
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

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <GameHeader title="Mode Défi" />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Info défi à relever */}
          {opponentResult && gameState === "idle" && (
            <ChallengeInfo result={opponentResult} word={word} />
          )}

          {/* Zone de jeu */}
          <div className="mb-6">
            <div className="text-center mb-6">
              {/* État idle */}
              {gameState === "idle" && !opponentResult && (
                <div>
                  <p className="text-neutral-500 mb-2">Signe le mot le plus vite possible</p>
                  <p className="text-5xl font-black tracking-widest">{word}</p>
                </div>
              )}

              {/* Countdown */}
              {gameState === "countdown" && <GameCountdown count={countdown} />}

              {/* En jeu */}
              {gameState === "playing" && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{currentIndex + 1} / {word.length}</p>
                  <WordProgress word={word} currentIndex={currentIndex} />
                  <p className="text-3xl font-mono mt-4">{formatTime(elapsedTime)}</p>
                </div>
              )}

              {/* Terminé */}
              {gameState === "finished" && finalTime && (
                <ChallengeResult finalTime={finalTime} opponentResult={opponentResult} />
              )}
            </div>

            {/* Progression */}
            {gameState === "playing" && (
              <ProgressBar current={currentIndex} total={word.length} className="mb-6" />
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

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 mt-6">
              {isStreaming && gameState === "idle" && (
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
                >
                  {opponentResult ? "Relever le défi 🎯" : "Commencer 🚀"}
                </button>
              )}

              {gameState === "finished" && (
                <div className="flex flex-col items-center gap-3">
                  {!challengeId && shareUrl && finalTime && (
                    <ShareChallenge shareUrl={shareUrl} finalTime={finalTime} />
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold"
                    >
                      Rejouer
                    </button>
                  </div>
                  
                  <Link href="/challenge" className="text-sm text-orange-500 hover:underline mt-2">
                    Nouveau défi avec un autre mot
                  </Link>
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
        </div>
      </main>
    </div>
  );
}

/** Affiche le mot avec lettres colorées selon la progression */
function WordProgress({ word, currentIndex }: { word: string; currentIndex: number }) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      {word.split("").map((letter, i) => (
        <span
          key={i}
          className={`text-5xl font-black ${
            i < currentIndex
              ? "text-green-500"
              : i === currentIndex
              ? "text-orange-500"
              : "text-neutral-300 dark:text-neutral-700"
          }`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
