"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMediaPipeHands } from "@/hooks/useMediaPipeHands";
import { useLetterStabilization } from "@/hooks/useLetterStabilization";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Random words for challenges (3-6 letters)
const CHALLENGE_WORDS = [
  "CHAT", "CHIEN", "LOUP", "OURS", "LION",
  "BEAU", "BIEN", "VRAI", "FORT", "DOUX",
  "MIEL", "PAIN", "LAIT", "CAFE", "FRUIT",
  "JOIE", "PAIX", "AMOUR", "RIRE", "JEUX",
  "MAIN", "PIED", "BRAS", "TETE", "YEUX",
];

type GameState = "waiting" | "countdown" | "playing" | "finished";

interface ChallengeResult {
  odId: string;
  odDisplayName: string;
  odTime: number;
  word: string;
}

// Wrapper component for Suspense
export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <ChallengeContent />
    </Suspense>
  );
}

function ChallengeContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("id");
  const router = useRouter();
  
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [countdown, setCountdown] = useState(3);
  const [word, setWord] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [lastValidatedLetter, setLastValidatedLetter] = useState<string | null>(null);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [showCopied, setShowCopied] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user, loading: authLoading } = useAuth();

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

  const currentLetter = word[currentIndex];

  // Load existing challenge or create new one
  useEffect(() => {
    const loadChallenge = async () => {
      if (challengeId) {
        // Load existing challenge
        const challengeRef = doc(db, "challenges", challengeId);
        const challengeSnap = await getDoc(challengeRef);
        
        if (challengeSnap.exists()) {
          const data = challengeSnap.data();
          setWord(data.word);
          if (data.creatorTime && data.creatorName) {
            setChallengeResult({
              odId: data.creatorId,
              odDisplayName: data.creatorName,
              odTime: data.creatorTime,
              word: data.word,
            });
          }
        }
      } else {
        // Generate new word
        const randomWord = CHALLENGE_WORDS[Math.floor(Math.random() * CHALLENGE_WORDS.length)];
        setWord(randomWord);
      }
    };

    loadChallenge();
  }, [challengeId]);

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
      
      if (currentIndex === word.length - 1) {
        // Finished!
        const time = Date.now() - (startTime || 0);
        setFinalTime(time);
        setGameState("finished");
        
        // Save result
        if (user && challengeId) {
          saveChallengeResponse(time);
        } else if (user && !challengeId) {
          createChallenge(time);
        }
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
  }, [isValidated, displayedLetter, currentLetter, currentIndex, startTime, word, gameState, lastValidatedLetter, user, challengeId]);

  // Create a new challenge
  const createChallenge = async (time: number) => {
    if (!user) return;

    try {
      const challengeRef = await addDoc(collection(db, "challenges"), {
        word,
        creatorId: user.uid,
        creatorName: user.displayName || "Anonyme",
        creatorTime: time,
        createdAt: serverTimestamp(),
      });

      const url = `${window.location.origin}/challenge?id=${challengeRef.id}`;
      setShareUrl(url);
    } catch (e) {
      console.error("Error creating challenge:", e);
    }
  };

  // Save response to existing challenge
  const saveChallengeResponse = async (time: number) => {
    if (!user || !challengeId) return;

    try {
      const responseRef = doc(db, "challenges", challengeId, "responses", user.uid);
      await setDoc(responseRef, {
        odId: user.uid,
        odName: user.displayName || "Anonyme",
        time,
        completedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error saving response:", e);
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

  // Copy share URL
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Share challenge
  const shareChallenge = () => {
    const text = `🤟 Je te défie de signer "${word}" plus vite que moi (${formatTime(finalTime || 0)}) !\n\n`;
    
    if (navigator.share) {
      navigator.share({
        title: "Défi LSF",
        text,
        url: shareUrl,
      });
    } else {
      copyShareUrl();
    }
  };

  // Determine winner
  const getResultMessage = () => {
    if (!finalTime || !challengeResult) return null;
    
    const diff = finalTime - challengeResult.odTime;
    
    if (diff < 0) {
      return {
        emoji: "🎉",
        text: `Tu as battu ${challengeResult.odDisplayName} de ${formatTime(Math.abs(diff))} !`,
        winner: true,
      };
    } else if (diff > 0) {
      return {
        emoji: "😅",
        text: `${challengeResult.odDisplayName} t'a battu de ${formatTime(diff)}`,
        winner: false,
      };
    } else {
      return {
        emoji: "🤝",
        text: "Égalité parfaite !",
        winner: null,
      };
    }
  };

  const result = getResultMessage();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
            ← Retour
          </Link>
          <h1 className="font-bold">Mode Défi</h1>
          <div className="w-16" />
        </nav>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          
          {/* Challenge info */}
          {challengeResult && gameState === "waiting" && (
            <div className="mb-6 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                <strong>{challengeResult.odDisplayName}</strong> t&apos;a défié !
              </p>
              <p className="text-2xl font-black mt-1">
                Mot : <span className="text-orange-500">{word}</span>
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Son temps : {formatTime(challengeResult.odTime)}
              </p>
            </div>
          )}

          {/* Game area */}
          <div className="mb-6">
            {/* Current word / Timer */}
            <div className="text-center mb-6">
              {gameState === "waiting" && !challengeResult && (
                <div>
                  <p className="text-neutral-500 mb-2">Signe le mot le plus vite possible</p>
                  <p className="text-5xl font-black tracking-widest">{word}</p>
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
                  <p className="text-sm text-neutral-500 mb-1">{currentIndex + 1} / {word.length}</p>
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
                  <p className="text-3xl font-mono">{formatTime(elapsedTime)}</p>
                </div>
              )}

              {gameState === "finished" && (
                <div>
                  {result && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mb-4"
                    >
                      <span className="text-4xl">{result.emoji}</span>
                      <p className={`text-lg font-semibold ${result.winner ? "text-green-500" : result.winner === false ? "text-orange-500" : ""}`}>
                        {result.text}
                      </p>
                    </motion.div>
                  )}
                  <p className="text-neutral-500 mb-1">Ton temps</p>
                  <p className="text-6xl font-black">{formatTime(finalTime || 0)}</p>
                  {challengeResult && (
                    <p className="text-neutral-500 mt-2">
                      vs {formatTime(challengeResult.odTime)} ({challengeResult.odDisplayName})
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
                  animate={{ width: `${((currentIndex) / word.length) * 100}%` }}
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
            <div className="flex flex-col items-center gap-4 mt-6">
              {isStreaming && gameState === "waiting" && (
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-colors"
                >
                  {challengeResult ? "Relever le défi 🎯" : "Commencer 🚀"}
                </button>
              )}

              {gameState === "finished" && (
                <div className="flex flex-col items-center gap-3">
                  {!challengeId && shareUrl && (
                    <div className="w-full max-w-sm">
                      <p className="text-sm text-neutral-500 mb-2 text-center">Partage ce lien pour défier tes amis</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-sm"
                        />
                        <button
                          onClick={copyShareUrl}
                          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-semibold text-sm"
                        >
                          {showCopied ? "✓" : "Copier"}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold"
                    >
                      Rejouer
                    </button>
                    {!challengeId && shareUrl && (
                      <button
                        onClick={shareChallenge}
                        className="px-6 py-3 border-2 border-neutral-200 dark:border-neutral-800 rounded-full font-semibold hover:border-orange-500 transition-colors"
                      >
                        Partager 📤
                      </button>
                    )}
                  </div>
                  
                  <Link
                    href="/challenge"
                    className="text-sm text-orange-500 hover:underline mt-2"
                  >
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

          {/* Not logged in warning */}
        </div>
      </main>

      {/* Copied toast */}
      <AnimatePresence>
        {showCopied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm shadow-lg"
          >
            ✓ Lien copié !
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
