/**
 * Constantes de l'application
 */

// Alphabet ASL (sans J et Z qui nécessitent un mouvement)
export const ASL_ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");

// Timing de stabilisation
export const STABILIZATION = {
  /** Délai avant d'afficher une nouvelle lettre détectée (évite le flickering) */
  DISPLAY_DELAY_MS: 300,
  /** Durée pour valider une lettre (utilisateur doit maintenir le signe) */
  VALIDATION_DURATION_MS: 1000,
  /** Intervalle de mise à jour de la barre de progression */
  UPDATE_INTERVAL_MS: 50,
} as const;

// Challenges (mots simples à épeler)
export const CHALLENGES = [
  { word: "HI", hint: "👋 Salut !" },
  { word: "OK", hint: "👌 D'accord" },
  { word: "LOVE", hint: "❤️ Amour" },
  { word: "YES", hint: "✅ Oui" },
  { word: "NO", hint: "❌ Non" },
  { word: "COOL", hint: "😎 Cool" },
  { word: "HELP", hint: "🆘 Aide" },
  { word: "GOOD", hint: "👍 Bien" },
] as const;

// Points
export const SCORING = {
  FREE_MODE_SUCCESS: 10,
  CHALLENGE_COMPLETE: 50,
  STREAK_BONUS_PER: 5,
} as const;
