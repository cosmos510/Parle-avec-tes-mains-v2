import { doc, updateDoc, increment, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

// XP rewards
export const XP_REWARDS = {
  LETTER_VALIDATED: 10,      // Valider une lettre
  LETTER_MASTERED: 50,       // Maîtriser une lettre (5 validations)
  STREAK_BONUS: 5,           // Bonus par jour de streak
  CHALLENGE_COMPLETE: 100,   // Terminer un challenge
  PERFECT_CHALLENGE: 50,     // Bonus challenge sans erreur
};

// Level thresholds
export function getLevelFromXP(xp: number): number {
  // Each level requires 100 XP more than the previous
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1;
  let threshold = 100;
  let totalRequired = 0;
  
  while (xp >= totalRequired + threshold) {
    totalRequired += threshold;
    level++;
    threshold = level * 100;
  }
  
  return level;
}

export function getXPForLevel(level: number): { current: number; required: number } {
  let totalRequired = 0;
  for (let i = 1; i < level; i++) {
    totalRequired += i * 100;
  }
  return {
    current: totalRequired,
    required: level * 100,
  };
}

// Check if it's a new day (for streak)
function isNewDay(lastDate: string | null): boolean {
  if (!lastDate) return true;
  
  const last = new Date(lastDate);
  const now = new Date();
  
  // Reset to midnight for comparison
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  return now.getTime() > last.getTime();
}

// Check if streak is broken (more than 1 day gap)
function isStreakBroken(lastDate: string | null): boolean {
  if (!lastDate) return false;
  
  const last = new Date(lastDate);
  const now = new Date();
  
  // Reset to midnight
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 1;
}

// Update user progress after validating a letter
export async function recordLetterValidation(
  userId: string,
  letter: string
): Promise<{ xpGained: number; newLevel: boolean; letterMastered: boolean }> {
  const userRef = doc(db, 'users', userId);
  const statsRef = doc(db, 'users', userId, 'letterStats', letter);
  
  let xpGained = XP_REWARDS.LETTER_VALIDATED;
  let letterMastered = false;
  
  // Update letter stats
  const statsSnap = await getDoc(statsRef);
  let successCount = 1;
  
  if (statsSnap.exists()) {
    successCount = (statsSnap.data().successes || 0) + 1;
    await updateDoc(statsRef, {
      successes: increment(1),
      lastPracticed: new Date().toISOString(),
    });
  } else {
    await setDoc(statsRef, {
      letter,
      attempts: 1,
      successes: 1,
      lastPracticed: new Date().toISOString(),
    });
  }
  
  // Check if letter is now mastered (5+ successes)
  if (successCount === 5) {
    letterMastered = true;
    xpGained += XP_REWARDS.LETTER_MASTERED;
    await updateDoc(userRef, {
      lettersMastered: arrayUnion(letter),
    });
  }
  
  // Get current user data for level check
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const currentXP = userData?.totalXp || 0;
  const currentLevel = userData?.currentLevel || 1;
  
  // Check streak
  const lastPracticeDate = userData?.lastPracticeDate;
  let streakUpdate: Record<string, unknown> = {};
  
  if (isStreakBroken(lastPracticeDate)) {
    // Reset streak
    streakUpdate = { currentStreak: 1 };
  } else if (isNewDay(lastPracticeDate)) {
    // Increment streak
    const newStreak = (userData?.currentStreak || 0) + 1;
    xpGained += XP_REWARDS.STREAK_BONUS * newStreak;
    streakUpdate = {
      currentStreak: increment(1),
      longestStreak: newStreak > (userData?.longestStreak || 0) ? newStreak : userData?.longestStreak,
    };
  }
  
  // Update user XP and streak
  const newTotalXP = currentXP + xpGained;
  const newLevel = getLevelFromXP(newTotalXP);
  const leveledUp = newLevel > currentLevel;
  
  await updateDoc(userRef, {
    totalXp: increment(xpGained),
    currentLevel: newLevel,
    lastPracticeDate: new Date().toISOString(),
    ...streakUpdate,
  });
  
  return {
    xpGained,
    newLevel: leveledUp,
    letterMastered,
  };
}

// Record challenge completion
export async function recordChallengeComplete(
  userId: string,
  word: string,
  perfect: boolean
): Promise<{ xpGained: number }> {
  const userRef = doc(db, 'users', userId);
  
  let xpGained = XP_REWARDS.CHALLENGE_COMPLETE;
  if (perfect) {
    xpGained += XP_REWARDS.PERFECT_CHALLENGE;
  }
  
  // Get current data for level update
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const currentXP = userData?.totalXp || 0;
  
  const newTotalXP = currentXP + xpGained;
  const newLevel = getLevelFromXP(newTotalXP);
  
  await updateDoc(userRef, {
    totalXp: increment(xpGained),
    currentLevel: newLevel,
    lastPracticeDate: new Date().toISOString(),
  });
  
  return { xpGained };
}

// Get user stats for a specific letter
export async function getLetterStats(userId: string, letter: string) {
  const statsRef = doc(db, 'users', userId, 'letterStats', letter);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    return statsSnap.data();
  }
  
  return null;
}
