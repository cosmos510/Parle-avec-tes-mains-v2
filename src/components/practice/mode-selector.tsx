"use client";

import { Button } from "@/components/ui/button";
import { Target, Sparkles } from "lucide-react";
import type { PracticeMode } from "@/types/practice";

interface ModeSelectorProps {
  mode: PracticeMode;
  onModeChange: (mode: PracticeMode) => void;
}

/**
 * Sélecteur de mode : Libre ou Challenge
 */
export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex justify-center gap-2 mb-8">
      <Button
        variant={mode === "free" ? "default" : "outline"}
        onClick={() => onModeChange("free")}
        className="rounded-full"
      >
        <Target className="w-4 h-4 mr-2" />
        Mode Libre
      </Button>
      <Button
        variant={mode === "challenge" ? "default" : "outline"}
        onClick={() => onModeChange("challenge")}
        className="rounded-full"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Challenge Mots
      </Button>
    </div>
  );
}
