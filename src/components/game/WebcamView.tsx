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
  /** Lettre actuellement détectée */
  detectedLetter?: string | null;
  /** Lettre cible à signer */
  targetLetter?: string;
  /** Le jeu est-il en cours ? */
  isPlaying?: boolean;
}

/**
 * Composant d'affichage de la webcam avec overlay de détection.
 */
export function WebcamView({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading,
  loadingStep,
  loadingProgress = 0,
  error,
  onStartCamera,
  detectedLetter,
  targetLetter,
  isPlaying = false,
}: WebcamViewProps) {
  const isCorrectLetter = detectedLetter === targetLetter;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800">
      {/* Vidéo cachée pour capture */}
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />
      
      {/* Canvas avec le rendu de la main */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isStreaming ? "block" : "hidden"}`}
        style={{ objectFit: "cover" }}
      />

      {/* État initial - bouton activer caméra */}
      {!isStreaming && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-neutral-500 mb-3">Active ta webcam pour jouer</p>
          <button
            onClick={onStartCamera}
            className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Activer la caméra
          </button>
        </div>
      )}

      {/* État de chargement */}
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

      {/* Erreur */}
      {error && (
        <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-red-500 text-white text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Indicateur de lettre détectée (pendant le jeu) */}
      {isStreaming && isPlaying && detectedLetter && (
        <div className="absolute top-3 right-3">
          <div
            className={`px-4 py-3 rounded-xl transition-colors ${
              isCorrectLetter
                ? "bg-green-500 text-white"
                : "bg-black/70 text-white"
            }`}
          >
            <span className="text-3xl font-black">{detectedLetter}</span>
          </div>
        </div>
      )}
    </div>
  );
}
