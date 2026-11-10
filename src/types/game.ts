/**
 * Types partagés pour les modes de jeu
 */

export type GameState = "idle" | "countdown" | "playing" | "finished";

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface SprintRecord {
  odId: string;
  displayName: string;
  bestTime: number;
  date: string;
}

export interface ChallengeData {
  id: string;
  word: string;
  creatorId: string;
  creatorName: string;
  creatorTime: number;
  createdAt: Date;
}

export interface ChallengeResult {
  odId: string;
  odDisplayName: string;
  odTime: number;
  word: string;
}
