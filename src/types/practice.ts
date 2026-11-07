/**
 * Types pour la page Practice
 */

export type PracticeMode = "free" | "challenge";

export interface Challenge {
  word: string;
  hint: string;
}

export interface SessionStats {
  score: number;
  streak: number;
}

export interface StabilizationState {
  displayedLetter: string | null;
  progress: number;
  isValidated: boolean;
}
