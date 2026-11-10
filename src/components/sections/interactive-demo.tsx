"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { loadModel, predict, drawLandmarks, Landmark } from "@/lib/onnx-classifier";

interface MediaPipeHands {
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: MediaPipeResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
}

interface MediaPipeResults {
  multiHandLandmarks?: Landmark[][];
}

const DEMO_DURATION = 20; // secondes

export function InteractiveDemo() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLetter, setDetectedLetter] = useState<string | null>(null);
  const [hasTriedDemo, setHasTriedDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<MediaPipeHands | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef = useRef(false);

  const stopCamera = useCallback(() => {
    isRunningRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setDetectedLetter(null);
    setTimeLeft(DEMO_DURATION);
  }, []);

  const processResults = useCallback(async (results: MediaPipeResults) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks: Landmark[] = results.multiHandLandmarks[0];

      const mirroredLandmarks = landmarks.map((lm: Landmark) => ({
        x: 1 - lm.x,
        y: lm.y,
        z: lm.z,
      }));

      drawLandmarks(ctx, mirroredLandmarks, canvas.width, canvas.height);

      const result = await predict(mirroredLandmarks);
      if (result) {
        setDetectedLetter(result.letter);
      }
    } else {
      setDetectedLetter(null);
    }
  }, []);

  const startDemo = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger le modèle ONNX
      await loadModel();

      // Charger MediaPipe Hands
      const { Hands } = await import("@mediapipe/hands");

      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(processResults);
      handsRef.current = hands as MediaPipeHands;

      // Démarrer la caméra
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 30 },
            facingMode: "user",
          },
        });
      } catch {
        // Fallback si les contraintes ne sont pas supportées
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve();
            };
          }
        });
      }

      setIsActive(true);
      setHasTriedDemo(true);
      setIsLoading(false);
      isRunningRef.current = true;

      // Timer pour auto-stop
      let remaining = DEMO_DURATION;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setTimeLeft(remaining);
        if (remaining <= 0) {
          stopCamera();
        }
      }, 1000);

      // Boucle de détection
      const runDetection = async () => {
        if (!isRunningRef.current) return;

        const video = videoRef.current;
        const handsInstance = handsRef.current;

        if (video && handsInstance && video.readyState >= 2) {
          try {
            await handsInstance.send({ image: video });
          } catch (err) {
            console.error("Detection error:", err);
          }
        }

        if (isRunningRef.current) {
          animationRef.current = requestAnimationFrame(runDetection);
        }
      };

      animationRef.current = requestAnimationFrame(runDetection);
    } catch (err) {
      console.error("Demo error:", err);
      setError("Impossible d'accéder à la caméra");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [stopCamera]);

  return (
    <section className="py-24 px-4" aria-labelledby="demo-heading">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2
            id="demo-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Teste en direct
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg">
            Pas besoin de créer un compte pour essayer. Active ta webcam et fais
            le signe de la lettre A.
          </p>
        </motion.div>

        {/* Demo area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Camera preview */}
            <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 rounded-2xl overflow-hidden">
              {/* Video caché mais nécessaire pour MediaPipe */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute opacity-0 pointer-events-none"
                aria-hidden="true"
              />

              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.div
                    key="canvas"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full object-cover"
                      aria-label="Flux vidéo de la webcam avec détection de la main"
                      role="img"
                    />

                    {/* Detection overlay */}
                    <AnimatePresence>
                      {detectedLetter && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-4 right-4 bg-white dark:bg-neutral-900 rounded-xl px-4 py-3 shadow-lg"
                          role="status"
                          aria-live="polite"
                        >
                          <p className="text-xs text-neutral-500 mb-1">
                            Détecté
                          </p>
                          <span className="text-4xl font-black" aria-label={`Lettre détectée : ${detectedLetter}`}>
                            {detectedLetter}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Recording indicator + Timer */}
                    <div className="absolute top-4 left-4 flex items-center gap-3" role="status" aria-live="polite">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                        <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded">
                          En direct
                        </span>
                      </div>
                      <span className="text-xs text-white font-medium bg-black/50 px-2 py-1 rounded" aria-label={`Temps restant : ${timeLeft} secondes`}>
                        {timeLeft}s
                      </span>
                    </div>

                    {/* Stop button */}
                    <button
                      onClick={stopCamera}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      aria-label="Arrêter la caméra"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin mb-4" aria-hidden="true" />
                    <p className="text-neutral-500 text-sm">
                      Chargement du modèle IA...
                    </p>
                  </motion.div>
                ) : hasTriedDemo ? (
                  <motion.div
                    key="ended"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <p className="text-2xl font-bold mb-2">Démo terminée</p>
                    <p className="text-neutral-500 text-sm mb-6">
                      Tu as eu un aperçu, prêt à apprendre les 26 lettres ?
                    </p>
                    <Link
                      href="/practice"
                      className="px-6 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
                    >
                      Commencer l&apos;apprentissage
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-4" aria-hidden="true">
                      <svg
                        className="w-10 h-10 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-neutral-500 text-center text-sm">
                      Ta caméra apparaîtra ici
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {error && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm text-center px-4">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-6">
              <ol className="space-y-4" aria-label="Instructions pour utiliser la démonstration">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold" aria-hidden="true">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Active ta webcam</p>
                    <p className="text-sm text-neutral-500">
                      On ne stocke rien, tout reste sur ton appareil
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold" aria-hidden="true">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Fais le signe de la lettre A</p>
                    <p className="text-sm text-neutral-500">
                      Poing fermé, pouce sur le côté
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-sm font-bold" aria-hidden="true">
                    3
                  </span>
                  <div>
                    <p className="font-medium">L&apos;IA reconnaît ton geste</p>
                    <p className="text-sm text-neutral-500">
                      En temps réel, directement dans ton navigateur
                    </p>
                  </div>
                </li>
              </ol>

              {/* CTA */}
              {!isActive && !isLoading && (
                <motion.button
                  onClick={startDemo}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  aria-label={hasTriedDemo ? "Réessayer la démonstration" : "Essayer la démonstration maintenant"}
                >
                  {hasTriedDemo ? "Réessayer" : "Essayer maintenant"}
                </motion.button>
              )}

              {hasTriedDemo && !isActive && !isLoading && (
                <Link
                  href="/practice"
                  className="block w-full py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-center font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  aria-label="Commencer l'apprentissage des 26 lettres de l'alphabet LSF"
                >
                  Continuer avec les 26 lettres
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
