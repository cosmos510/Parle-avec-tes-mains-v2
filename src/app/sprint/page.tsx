"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type GameState = "idle" | "countdown" | "playing" | "finished";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  time: number;
  date: string;
}

export default function SprintPage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

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

  const {
    displayedLetter,
    isValidated,
  } = useLetterStabilization({
    predictedLetter,
    isActive: isStreaming && gameState === "playing",
  });

  const currentLetter = ALPHABET[currentIndex];

  // Load best time and leaderboard
  useEffect(() => {
    const loadData = async () => {
      // Load user's best time
      if (user) {
        const userSprintRef = doc(db, "sprintRecords", user.uid);
        const userSnap = await getDoc(userSprintRef);
        if (userSnap.exists()) {
          setBestTime(userSnap.data().bestTime);
        }
      }

      // Load top 10 leaderboard
      try {
        const leaderboardRef = collection(db, "sprintRecords");
        const q = query(leaderboardRef, orderBy("bestTime", "asc"), limit(10));
        const snapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          entries.push({
            rank: index + 1,
            displayName: data.displayName || "Anonyme",
            time: data.bestTime,
            date: data.date,
          });
        });
        setLeaderboard(entries);
      } catch (e) {
        console.error("Error loading leaderboard:", e);
      }
    };

    loadData();
  }, [user]);

  // Timer
  useEffect(() => {
    if (gameState === "playing" && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 10);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, startTime]);

  // Handle letter validation
  useEffect(() => {
    if (gameState !== "playing") return;
    if (!isValidated || !displayedLetter) return;
    if (displayedLetter === lastValidatedLetter) return;

    if (displayedLetter === currentLetter) {
      setLastValidatedLetter(displayedLetter);
      
      if (currentIndex === ALPHABET.length - 1) {
        // Finished!
        const time = Date.now() - (startTime || 0);
        setFinalTime(time);
        setGameState("finished");
        
        // Check if new record
        if (!bestTime || time < bestTime) {
          setIsNewRecord(true);
          setBestTime(time);
          saveRecord(time);
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [isValidated, displayedLetter, currentLetter, currentIndex, startTime, bestTime, lastValidatedLetter, gameState]);

  // Save record to Firebase
  const saveRecord = async (time: number) => {
    if (!user) return;

    try {
      const recordRef = doc(db, "sprintRecords", user.uid);
      await setDoc(recordRef, {
        bestTime: time,
        displayName: user.displayName || "Anonyme",
        date: new Date().toISOString().split("T")[0],
        userId: user.uid,
      }, { merge: true });
    } catch (e) {
      console.error("Error saving record:", e);
    }
  };

  // Start countdown
  const startGame = useCallback(() => {
    if (!isStreaming) return;
    
    setGameState("countdown");
    setCountdown(3);
    setCurrentIndex(0);
    setElapsedTime(0);
    setFinalTime(null);
    setIsNewRecord(false);
    setLastValidatedLetter(null);

    const countdownInterval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownInterval);
          setGameState("playing");
          setStartTime(Date.now());
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, [isStreaming]);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
  };

  // Share result
  const shareResult = () => {
    if (!finalTime) return;
    
    const text = `🤟 J'ai signé l'alphabet LSF en ${formatTime(finalTime)} sur Parle avec tes mains !\n\nEssaie de battre mon score → parle-avec-tes-mains.fr/sprint`;
    
    if (navigator.share) {
      navigator.share({
        title: "Mon score Sprint LSF",
        text,
        url: "https://parle-avec-tes-mains.fr/sprint",
      });
    } else {
      navigator.clipboard.writeText(text);
      setShowShareModal(true);
      setTimeout(() => setShowShareModal(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            ← Retour
          </Link>
          <h1 className="font-bold">Sprint Alphabet</h1>
          <div className="w-16" />
        </nav>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Game area */}
          <div className="mb-6">
            {/* Current letter / Timer */}
            <div className="text-center mb-6">
              {gameState === "idle" && (
                <div>
                  <p className="text-neutral-500 mb-2">Signe les 26 lettres le plus vite possible</p>
                  <p className="text-6xl font-black text-neutral-300 dark:text-neutral-700">A → Z</p>
                </div>
              )}

              {gameState === "countdown" && (
                <motion.p
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-black text-orange-500"
                >
                  {countdown}
                </motion.p>
              )}

              {gameState === "playing" && (
                <div>
                  <p className="text-sm text-neutral-500 mb-1">{currentIndex + 1} / 26</p>
                  <motion.p
                    key={currentLetter}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-orange-500"
                  >
                    {currentLetter}
                  </motion.p>
                  <p className="text-3xl font-mono mt-4">{formatTime(elapsedTime)}</p>
                </div>
              )}

              {gameState === "finished" && (
                <div>
                  {isNewRecord && (
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg text-orange-500 font-bold mb-2"
                    >
                      🎉 Nouveau record !
                    </motion.p>
                  )}
                  <p className="text-6xl font-black">{formatTime(finalTime || 0)}</p>
                  {bestTime && !isNewRecord && (
                    <p className="text-neutral-500 mt-2">
                      Record : {formatTime(bestTime)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Progress bar */}
            {gameState === "playing" && (
              <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / 26) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}

            {/* Camera */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
              <video ref={videoRef} className="hidden" playsInline muted autoPlay />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
                style={{ objectFit: "cover" }}
              />

              {!isStreaming && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-neutral-500 mb-3">Active ta webcam pour jouer</p>
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform"
                  >
                    Activer 📷
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-neutral-200 border-t-orange-500 rounded-full animate-spin mb-3" />
                  <p className="text-neutral-500 text-sm">{loadingStep}</p>
                  <div className="w-32 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-red-500 text-white text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* Detected letter indicator */}
              {isStreaming && gameState === "playing" && displayedLetter && (
                <div className="absolute top-3 right-3">
                  <div
                    className={`px-4 py-3 rounded-xl ${
                      displayedLetter === currentLetter
                        ? "bg-green-500 text-white"
                        : "bg-black/70 text-white"
                    }`}
                  >
                    <span className="text-3xl font-black">{displayedLetter}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
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
                  <button
                    onClick={shareResult}
                    className="px-6 py-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-full font-semibold hover:border-orange-500 transition-colors"
                  >
                    Partager 📤
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
          {leaderboard.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">🏆 Top 10</h2>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      i === 0
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800"
                        : i === 1
                        ? "bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                        : i === 2
                        ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                        : "border border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold w-6">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <span className="font-medium">{entry.displayName}</span>
                    </div>
                    <span className="font-mono font-bold">{formatTime(entry.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best time reminder */}
          {bestTime && gameState === "idle" && (
            <p className="text-center text-neutral-500 mt-8">
              Ton record : <span className="font-bold">{formatTime(bestTime)}</span>
            </p>
          )}
        </div>
      </main>

      {/* Share modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm shadow-lg"
          >
            ✓ Copié dans le presse-papier !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
