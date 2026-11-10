import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'xp' | 'streak' | 'letters' | 'sprint' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// All available badges
export const BADGES: Badge[] = [
  // XP badges
  { id: 'first_xp', name: 'Premiers pas', description: 'Gagne tes premiers XP', icon: '⭐', category: 'xp', rarity: 'common' },
  { id: 'xp_100', name: 'Centurion', description: 'Atteins 100 XP', icon: '💯', category: 'xp', rarity: 'common' },
  { id: 'xp_500', name: 'Demi-millénaire', description: 'Atteins 500 XP', icon: '🌟', category: 'xp', rarity: 'rare' },
  { id: 'xp_1000', name: 'Millionnaire', description: 'Atteins 1000 XP', icon: '💎', category: 'xp', rarity: 'epic' },
  { id: 'xp_5000', name: 'Légende', description: 'Atteins 5000 XP', icon: '👑', category: 'xp', rarity: 'legendary' },

  // Streak badges
  { id: 'streak_3', name: 'Régulier', description: '3 jours de suite', icon: '🔥', category: 'streak', rarity: 'common' },
  { id: 'streak_7', name: 'Semaine parfaite', description: '7 jours de suite', icon: '📅', category: 'streak', rarity: 'rare' },
  { id: 'streak_30', name: 'Mois de feu', description: '30 jours de suite', icon: '🏆', category: 'streak', rarity: 'epic' },
  { id: 'streak_100', name: 'Inarrêtable', description: '100 jours de suite', icon: '🌋', category: 'streak', rarity: 'legendary' },

  // Letters badges
  { id: 'first_letter', name: 'Débutant', description: 'Maîtrise ta première lettre', icon: '✋', category: 'letters', rarity: 'common' },
  { id: 'letters_5', name: 'Apprenti', description: 'Maîtrise 5 lettres', icon: '🖐️', category: 'letters', rarity: 'common' },
  { id: 'letters_13', name: 'Mi-chemin', description: 'Maîtrise 13 lettres', icon: '✌️', category: 'letters', rarity: 'rare' },
  { id: 'letters_26', name: 'Alphabet complet', description: 'Maîtrise les 26 lettres', icon: '🎓', category: 'letters', rarity: 'legendary' },

  // Sprint badges
  { id: 'first_sprint', name: 'Sprinter', description: 'Termine ton premier Sprint', icon: '🏃', category: 'sprint', rarity: 'common' },
  { id: 'sprint_60', name: 'Rapide', description: 'Sprint en moins de 60 secondes', icon: '⚡', category: 'sprint', rarity: 'rare' },
  { id: 'sprint_45', name: 'Éclair', description: 'Sprint en moins de 45 secondes', icon: '🚀', category: 'sprint', rarity: 'epic' },
  { id: 'sprint_30', name: 'Légende du Sprint', description: 'Sprint en moins de 30 secondes', icon: '💨', category: 'sprint', rarity: 'legendary' },

  // Special badges
  { id: 'night_owl', name: 'Noctambule', description: 'Pratique après minuit', icon: '🦉', category: 'special', rarity: 'rare' },
  { id: 'early_bird', name: 'Lève-tôt', description: 'Pratique avant 7h', icon: '🐦', category: 'special', rarity: 'rare' },
  { id: 'weekend_warrior', name: 'Guerrier du weekend', description: 'Pratique samedi et dimanche', icon: '⚔️', category: 'special', rarity: 'rare' },
];

// Get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id);
}

// Get badges by category
export function getBadgesByCategory(category: Badge['category']): Badge[] {
  return BADGES.filter(b => b.category === category);
}

// Rarity colors
export function getRarityColor(rarity: Badge['rarity']): string {
  switch (rarity) {
    case 'common': return 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700';
    case 'rare': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800';
    case 'epic': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-800';
    case 'legendary': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800';
  }
}

// Check and award badges based on user stats
export async function checkAndAwardBadges(
  userId: string,
  stats: {
    totalXp: number;
    currentStreak: number;
    lettersMastered: string[];
    sprintBestTime?: number;
  }
): Promise<Badge[]> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const existingBadges: string[] = userData?.badges || [];
  
  const newBadges: Badge[] = [];
  const badgesToAward: string[] = [];
  
  const hour = new Date().getHours();

  // Check XP badges
  if (stats.totalXp > 0 && !existingBadges.includes('first_xp')) {
    badgesToAward.push('first_xp');
  }
  if (stats.totalXp >= 100 && !existingBadges.includes('xp_100')) {
    badgesToAward.push('xp_100');
  }
  if (stats.totalXp >= 500 && !existingBadges.includes('xp_500')) {
    badgesToAward.push('xp_500');
  }
  if (stats.totalXp >= 1000 && !existingBadges.includes('xp_1000')) {
    badgesToAward.push('xp_1000');
  }
  if (stats.totalXp >= 5000 && !existingBadges.includes('xp_5000')) {
    badgesToAward.push('xp_5000');
  }

  // Check streak badges
  if (stats.currentStreak >= 3 && !existingBadges.includes('streak_3')) {
    badgesToAward.push('streak_3');
  }
  if (stats.currentStreak >= 7 && !existingBadges.includes('streak_7')) {
    badgesToAward.push('streak_7');
  }
  if (stats.currentStreak >= 30 && !existingBadges.includes('streak_30')) {
    badgesToAward.push('streak_30');
  }
  if (stats.currentStreak >= 100 && !existingBadges.includes('streak_100')) {
    badgesToAward.push('streak_100');
  }

  // Check letters badges
  const lettersCount = stats.lettersMastered.length;
  if (lettersCount >= 1 && !existingBadges.includes('first_letter')) {
    badgesToAward.push('first_letter');
  }
  if (lettersCount >= 5 && !existingBadges.includes('letters_5')) {
    badgesToAward.push('letters_5');
  }
  if (lettersCount >= 13 && !existingBadges.includes('letters_13')) {
    badgesToAward.push('letters_13');
  }
  if (lettersCount >= 26 && !existingBadges.includes('letters_26')) {
    badgesToAward.push('letters_26');
  }

  // Check sprint badges
  if (stats.sprintBestTime !== undefined) {
    if (!existingBadges.includes('first_sprint')) {
      badgesToAward.push('first_sprint');
    }
    if (stats.sprintBestTime <= 60000 && !existingBadges.includes('sprint_60')) {
      badgesToAward.push('sprint_60');
    }
    if (stats.sprintBestTime <= 45000 && !existingBadges.includes('sprint_45')) {
      badgesToAward.push('sprint_45');
    }
    if (stats.sprintBestTime <= 30000 && !existingBadges.includes('sprint_30')) {
      badgesToAward.push('sprint_30');
    }
  }

  // Check special time-based badges
  if (hour >= 0 && hour < 5 && !existingBadges.includes('night_owl')) {
    badgesToAward.push('night_owl');
  }
  if (hour >= 5 && hour < 7 && !existingBadges.includes('early_bird')) {
    badgesToAward.push('early_bird');
  }

  // Award new badges
  if (badgesToAward.length > 0) {
    await updateDoc(userRef, {
      badges: arrayUnion(...badgesToAward),
    });

    // Get full badge objects for return
    for (const badgeId of badgesToAward) {
      const badge = getBadgeById(badgeId);
      if (badge) {
        newBadges.push(badge);
      }
    }
  }

  return newBadges;
}
