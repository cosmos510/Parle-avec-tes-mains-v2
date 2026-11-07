"use client";

import { Button } from "@/components/ui/button";
import { Camera, CameraOff, RotateCcw } from "lucide-react";

interface CameraControlsProps {
  isStreaming: boolean;
  isLoading: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onReset: () => void;
}

/**
 * Boutons de contrôle de la caméra
 */
export function CameraControls({
  isStreaming,
  isLoading,
  onStartCamera,
  onStopCamera,
  onReset,
}: CameraControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {isStreaming ? (
        <>
          <Button onClick={onStopCamera} variant="outline" className="rounded-full">
            <CameraOff className="w-4 h-4 mr-2" />
            Arrêter
          </Button>
          <Button onClick={onReset} variant="outline" className="rounded-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </>
      ) : (
        <Button
          onClick={onStartCamera}
          disabled={isLoading}
          className="rounded-full px-6"
        >
          <Camera className="w-4 h-4 mr-2" />
          {isLoading ? "Chargement..." : "Démarrer"}
        </Button>
      )}
    </div>
  );
}
