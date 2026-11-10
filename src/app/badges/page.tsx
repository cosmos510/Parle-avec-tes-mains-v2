"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { BADGES, Badge, getRarityColor, getBadgesByCategory } from "@/lib/badges";

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'xp', label: 'XP' },
  { id: 'streak', label: 'Séries' },
  { id: 'letters', label: 'Lettres' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'special', label: 'Spéciaux' },
] as const;

export default function BadgesPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const userBadges: string[] = profile.badges || [];
  const earnedCount = userBadges.length;
  const totalCount = BADGES.length;

  const filteredBadges = activeCategory === 'all' 
    ? BADGES 
    : getBadgesByCategory(activeCategory as Badge['category']);

  const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    const aEarned = userBadges.includes(a.id);
    const bEarned = userBadges.includes(b.id);
    if (aEarned !== bEarned) return aEarned ? -1 : 1;
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/profile" 
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ← Profil
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">Badges</h1>
          <p className="text-neutral-500">
            {earnedCount} / {totalCount} débloqués
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sortedBadges.map((badge) => {
            const isEarned = userBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isEarned 
                    ? getRarityColor(badge.rarity)
                    : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-50'
                }`}
              >
                <div className="text-center">
                  <span className={`text-4xl ${!isEarned && 'grayscale'}`}>
                    {badge.icon}
                  </span>
                  <h3 className="font-bold mt-2 text-sm">{badge.name}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{badge.description}</p>
                  {isEarned && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      ✓ Obtenu
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold mb-3 text-sm">Raretés</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800">Commun</span>
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Rare</span>
            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">Épique</span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">Légendaire</span>
          </div>
        </div>
      </div>
    </main>
  );
}
