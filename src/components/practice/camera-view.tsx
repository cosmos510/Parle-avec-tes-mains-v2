"use client";

import { RefObject } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  onStartCamera: () => void;
  children?: React.ReactNode;
}

/**
 * Vue caméra avec état de chargement et gestion d'erreur
 */
export function CameraView({
  videoRef,
  canvasRef,
  isStreaming,
  isLoading,
  error,
  onStartCamera,
  children,
}: CameraViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-video rounded-3xl overflow-hidden bg-card border border-border/50"
    >
      {/* Video caché (utilisé par MediaPipe) */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas avec le rendu */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          isStreaming ? "block" : "hidden"
        }`}
      />

      {/* État initial / chargement */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-muted/30 to-muted/50">
          {isLoading ? (
            <LoadingState />
          ) : (
            <InitialState onStartCamera={onStartCamera} />
          )}
        </div>
      )}

      {/* Erreur */}
      {error && <ErrorBanner message={error} />}

      {/* Indicateur LIVE */}
      {isStreaming && <LiveIndicator />}

      {/* Contenu enfant (overlays de détection) */}
      {children}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground">Chargement de l&apos;IA...</p>
    </div>
  );
}

function InitialState({ onStartCamera }: { onStartCamera: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center px-4">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        <Camera className="w-12 h-12 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Prêt à apprendre ?</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Activez votre caméra pour commencer à pratiquer la langue des signes
        </p>
      </div>
      <Button onClick={onStartCamera} size="lg" className="rounded-full px-8">
        <Camera className="w-5 h-5 mr-2" />
        Activer la caméra
      </Button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-2xl text-sm">
      {message}
    </div>
  );
}

function LiveIndicator() {
  return (
    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs text-white font-medium">LIVE</span>
    </div>
  );
}
