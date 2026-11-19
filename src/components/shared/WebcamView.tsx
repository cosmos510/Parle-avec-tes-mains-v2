"use client";

import { RefObject } from "react";

interface WebcamViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  loadingStep?: string;
  loadingProgress?: number;
  error: string | null;
  onStartCamera: () => void;
  displayedLetter?: string | null;
  targetLetter?: string;
  isPlaying?: boolean;
}

export function WebcamView({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading,
  loadingStep,
  loadingProgress = 0,
  error,
  onStartCamera,
  displayedLetter,
  targetLetter,
  isPlaying = false,
}: WebcamViewProps) {
  return (
    <div 
      className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800"
      role="region"
      aria-label="Zone de la webcam"
    >
      <video ref={videoRef} className="hidden" playsInline muted autoPlay aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
        style={{ objectFit: "cover" }}
        aria-label="Flux vidéo de la webcam"
      />

      {/* État initial - bouton activer caméra */}
      {!isStreaming && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-neutral-500 mb-3">Active ta webcam pour jouer</p>
          <button
            onClick={onStartCamera}
            className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Activer 📷
          </button>
        </div>
      )}

      {/* Chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center" role="status" aria-label="Chargement de l'IA">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-orange-500 rounded-full animate-spin mb-3" />
          <p className="text-neutral-500 text-sm">{loadingStep}</p>
          <div 
            className="w-32 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={loadingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-red-500 text-white text-sm rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Indicateur lettre détectée */}
      {isStreaming && isPlaying && displayedLetter && (
        <div className="absolute top-3 right-3" aria-live="polite">
          <div
            className={`px-4 py-3 rounded-xl ${
              displayedLetter === targetLetter
                ? "bg-green-500 text-white"
                : "bg-black/70 text-white"
            }`}
          >
            <span className="text-3xl font-black" aria-label={`Lettre détectée: ${displayedLetter}`}>{displayedLetter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
