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
 * Implémente un groupe de boutons radio visuellement
 */
export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div 
      className="flex justify-center gap-2 mb-8"
      role="radiogroup"
      aria-label="Mode de pratique"
    >
      <Button
        variant={mode === "free" ? "default" : "outline"}
        onClick={() => onModeChange("free")}
        className="rounded-full"
        role="radio"
        aria-checked={mode === "free"}
        aria-label="Mode Libre - Pratique à ton rythme"
      >
        <Target className="w-4 h-4 mr-2" aria-hidden="true" />
        Mode Libre
      </Button>
      <Button
        variant={mode === "challenge" ? "default" : "outline"}
        onClick={() => onModeChange("challenge")}
        className="rounded-full"
        role="radio"
        aria-checked={mode === "challenge"}
        aria-label="Challenge Mots - Épelle des mots complets"
      >
        <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
        Challenge Mots
      </Button>
    </div>
  );
}
