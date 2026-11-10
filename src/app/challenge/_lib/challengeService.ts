import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "firebase/auth";
import type { ChallengeResult } from "@/types/game";

/** Mots disponibles pour les défis (3-6 lettres) */
export const CHALLENGE_WORDS = [
  "CHAT", "CHIEN", "LOUP", "OURS", "LION",
  "BEAU", "BIEN", "VRAI", "FORT", "DOUX",
  "MIEL", "PAIN", "LAIT", "CAFE", "FRUIT",
  "JOIE", "PAIX", "AMOUR", "RIRE", "JEUX",
  "MAIN", "PIED", "BRAS", "TETE", "YEUX",
];

/** Génère un mot aléatoire pour le défi */
export function getRandomWord(): string {
  return CHALLENGE_WORDS[Math.floor(Math.random() * CHALLENGE_WORDS.length)];
}

/** Charge un défi existant depuis Firestore */
export async function loadChallenge(challengeId: string): Promise<{
  word: string;
  result: ChallengeResult | null;
}> {
  const challengeRef = doc(db, "challenges", challengeId);
  const challengeSnap = await getDoc(challengeRef);
  
  if (!challengeSnap.exists()) {
    return { word: "", result: null };
  }

  const data = challengeSnap.data();
  const result: ChallengeResult | null = data.creatorTime ? {
    odId: data.creatorId,
    odDisplayName: data.creatorName,
    odTime: data.creatorTime,
    word: data.word,
  } : null;

  return { word: data.word, result };
}

/** Crée un nouveau défi et retourne l'URL de partage */
export async function createChallenge(
  user: User, 
  word: string, 
  time: number
): Promise<string> {
  const challengeRef = await addDoc(collection(db, "challenges"), {
    word,
    creatorId: user.uid,
    creatorName: user.displayName || "Anonyme",
    creatorTime: time,
    createdAt: serverTimestamp(),
  });

  return `${window.location.origin}/challenge?id=${challengeRef.id}`;
}

/** Sauvegarde la réponse à un défi existant */
export async function saveChallengeResponse(
  user: User,
  challengeId: string,
  time: number
): Promise<void> {
  const responseRef = doc(db, "challenges", challengeId, "responses", user.uid);
  await setDoc(responseRef, {
    odId: user.uid,
    odName: user.displayName || "Anonyme",
    time,
    completedAt: serverTimestamp(),
  });
}
