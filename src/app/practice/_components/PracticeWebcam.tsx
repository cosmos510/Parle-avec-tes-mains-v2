"use client";

import { RefObject } from "react";

interface PracticeWebcamProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  loadingStep?: string;
  loadingProgress?: number;
  error: string | null;
  onStartCamera: () => void;
  displayedLetter: string | null;
  confidence: number;
  stableProgress: number;
  isValidated: boolean;
  isCorrectLetter: boolean;
}

/**
 * Composant webcam spécifique à la page practice avec tous les overlays.
 */
export function PracticeWebcam({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading,
  loadingStep,
  loadingProgress = 0,
  error,
  onStartCamera,
  displayedLetter,
  confidence,
  stableProgress,
  isValidated,
  isCorrectLetter,
}: PracticeWebcamProps) {
  return (
    <div className="relative aspect-[4/3] sm:aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
        style={{ objectFit: "cover" }}
      />

      {/* État initial */}
      {!isStreaming && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <p className="text-neutral-500 mb-3 text-sm sm:text-base text-center">
            Active ta webcam pour commencer
          </p>
          <button
            onClick={onStartCamera}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm sm:text-base hover:scale-105 transition-transform"
          >
            Activer la caméra
          </button>
        </div>
      )}

      {/* Chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5">
            <div className="absolute inset-0 border-4 border-neutral-200 dark:border-neutral-700 rounded-full" />
            <div 
              className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"
              style={{ animationDuration: "1s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-neutral-600 dark:text-neutral-300">
                {loadingProgress}%
              </span>
            </div>
          </div>
          <p className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base mb-2">
            {loadingStep}
          </p>
          <div className="w-48 sm:w-64 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-neutral-500 text-xs sm:text-sm text-center max-w-xs">
            Le premier chargement peut prendre quelques secondes, c&apos;est normal !
          </p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-red-500 text-white text-xs sm:text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Indicateur LIVE */}
      {isStreaming && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
      )}

      {/* Lettre détectée */}
      {isStreaming && displayedLetter && (
        <div className="absolute top-3 right-3">
          <div
            className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl ${
              isValidated && isCorrectLetter
                ? "bg-green-500 text-white"
                : "bg-black/70 text-white"
            }`}
          >
            <span className="text-2xl sm:text-3xl font-black block">{displayedLetter}</span>
            <span className="text-[10px] sm:text-xs opacity-70">{confidence}%</span>
            {!isValidated && (
              <div className="mt-1.5 h-1 w-12 sm:w-16 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${stableProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indication main */}
      {isStreaming && !displayedLetter && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs">
          Montre ta main
        </div>
      )}
    </div>
  );
}
