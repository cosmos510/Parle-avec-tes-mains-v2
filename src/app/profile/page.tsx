"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getBadgeById, getRarityColor, Badge } from "@/lib/badges";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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

  // Calculate level progress
  const xpForNextLevel = profile.currentLevel * 100;
  const xpProgress = (profile.totalXp % 100) / 100 * 100;

  // Get user badges
  const userBadges: (Badge | undefined)[] = (profile.badges || [])
    .map((id: string) => getBadgeById(id))
    .filter(Boolean)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            ← Retour
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Déconnexion
          </button>
        </div>

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-black">{user.displayName || "Utilisateur"}</h1>
            <p className="text-neutral-500">{user.email}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black text-orange-500">{profile.currentLevel}</p>
            <p className="text-sm text-neutral-500">Niveau</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.totalXp}</p>
            <p className="text-sm text-neutral-500">XP Total</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.currentStreak}</p>
            <p className="text-sm text-neutral-500">Série</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{profile.lettersMastered.length}</p>
            <p className="text-sm text-neutral-500">Lettres</p>
          </div>
        </div>

        {/* Level progress */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">Progression niveau {profile.currentLevel + 1}</p>
            <p className="text-sm text-neutral-500">{profile.totalXp % 100} / {xpForNextLevel} XP</p>
          </div>
          <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Letters mastered */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <h2 className="font-semibold mb-4">Lettres maîtrisées</h2>
          {profile.lettersMastered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.lettersMastered.map((letter) => (
                <span
                  key={letter}
                  className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-bold"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Aucune lettre maîtrisée pour l&apos;instant. <Link href="/practice" className="text-orange-500 hover:underline">Commence à pratiquer !</Link>
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Badges</h2>
            <Link href="/badges" className="text-sm text-orange-500 hover:underline">
              Voir tous →
            </Link>
          </div>
          {userBadges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {userBadges.map((badge) => badge && (
                <div
                  key={badge.id}
                  className={`px-3 py-2 rounded-xl border ${getRarityColor(badge.rarity)} flex items-center gap-2`}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">
              Aucun badge pour l&apos;instant. <Link href="/practice" className="text-orange-500 hover:underline">Continue à pratiquer !</Link>
            </p>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/practice"
            className="flex-1 px-6 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Continuer à pratiquer
          </Link>
          <Link
            href="/stats"
            className="flex-1 px-6 py-4 rounded-full border-2 border-neutral-200 dark:border-neutral-800 font-semibold text-center hover:border-orange-500 transition-colors"
          >
            Voir mes statistiques
          </Link>
        </div>
      </div>
    </main>
  );
}
