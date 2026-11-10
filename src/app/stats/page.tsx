"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface LetterStat {
  letter: string;
  successes: number;
  lastPracticed: string;
}

export default function StatsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [letterStats, setLetterStats] = useState<LetterStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;

      try {
        const statsRef = collection(db, "users", user.uid, "letterStats");
        const q = query(statsRef, orderBy("successes", "desc"));
        const snapshot = await getDocs(q);
        
        const stats: LetterStat[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          stats.push({
            letter: data.letter,
            successes: data.successes || 0,
            lastPracticed: data.lastPracticed || "",
          });
        });
        
        setLetterStats(stats);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

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

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const totalSuccesses = letterStats.reduce((acc, s) => acc + s.successes, 0);
  const avgPerLetter = letterStats.length > 0 ? Math.round(totalSuccesses / letterStats.length) : 0;
  
  // Find strongest and weakest letters
  const strongestLetters = letterStats.slice(0, 5);
  const practicedLetters = new Set(letterStats.map(s => s.letter));
  const unpracticedLetters = ALPHABET.filter(l => !practicedLetters.has(l));

  // Calculate mastery percentage
  const masteredCount = profile.lettersMastered?.length || 0;
  const masteryPercent = Math.round((masteredCount / 26) * 100);

  // Format relative date
  const formatRelativeDate = (dateStr: string) => {
    if (!dateStr) return "Jamais";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

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
          <h1 className="text-4xl font-black mb-2">Statistiques</h1>
          <p className="text-neutral-500">Analyse détaillée de ta progression</p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black text-orange-500">{totalSuccesses}</p>
            <p className="text-sm text-neutral-500">Validations</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{letterStats.length}</p>
            <p className="text-sm text-neutral-500">Lettres pratiquées</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{masteryPercent}%</p>
            <p className="text-sm text-neutral-500">Maîtrise alphabet</p>
          </div>
          <div className="p-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-center">
            <p className="text-3xl font-black">{avgPerLetter}</p>
            <p className="text-sm text-neutral-500">Moy. par lettre</p>
          </div>
        </div>

        {/* Alphabet grid with success count */}
        <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
          <h2 className="font-semibold mb-4">Progression par lettre</h2>
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
            {ALPHABET.map((letter) => {
              const stat = letterStats.find(s => s.letter === letter);
              const successes = stat?.successes || 0;
              const isMastered = profile.lettersMastered?.includes(letter);
              
              let bgColor = "bg-neutral-100 dark:bg-neutral-800";
              if (isMastered) {
                bgColor = "bg-green-100 dark:bg-green-900/30";
              } else if (successes > 0) {
                bgColor = "bg-orange-50 dark:bg-orange-900/20";
              }
              
              return (
                <div
                  key={letter}
                  className={`aspect-square rounded-lg ${bgColor} flex flex-col items-center justify-center relative`}
                >
                  <span className={`font-bold ${isMastered ? "text-green-600 dark:text-green-400" : ""}`}>
                    {letter}
                  </span>
                  {successes > 0 && (
                    <span className="text-[10px] text-neutral-500">{successes}</span>
                  )}
                  {isMastered && (
                    <span className="absolute -top-1 -right-1 text-xs">✓</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-neutral-100 dark:bg-neutral-800"></span>
              Non pratiqué
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-50 dark:bg-orange-900/20"></span>
              En cours
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30"></span>
              Maîtrisé
            </span>
          </div>
        </div>

        {/* Strongest letters */}
        {strongestLetters.length > 0 && (
          <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
            <h2 className="font-semibold mb-4">Tes lettres les plus fortes</h2>
            <div className="space-y-3">
              {strongestLetters.map((stat, index) => (
                <div key={stat.letter} className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                    {stat.letter}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (stat.successes / (strongestLetters[0]?.successes || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{stat.successes}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Letters to practice */}
        {unpracticedLetters.length > 0 && (
          <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 mb-8">
            <h2 className="font-semibold mb-4">Lettres à découvrir</h2>
            <div className="flex flex-wrap gap-2">
              {unpracticedLetters.map((letter) => (
                <span
                  key={letter}
                  className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center font-bold"
                >
                  {letter}
                </span>
              ))}
            </div>
            <Link 
              href="/practice"
              className="inline-block mt-4 text-sm text-orange-500 hover:underline"
            >
              Pratiquer ces lettres →
            </Link>
          </div>
        )}

        {/* Recent activity */}
        {letterStats.length > 0 && (
          <div className="p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800">
            <h2 className="font-semibold mb-4">Activité récente</h2>
            <div className="space-y-2">
              {letterStats
                .filter(s => s.lastPracticed)
                .sort((a, b) => new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime())
                .slice(0, 5)
                .map((stat) => (
                  <div key={stat.letter} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold">
                        {stat.letter}
                      </span>
                      <span className="text-sm">{stat.successes} validations</span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {formatRelativeDate(stat.lastPracticed)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loadingStats && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loadingStats && letterStats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">Aucune statistique pour le moment</p>
            <Link
              href="/practice"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Commencer à pratiquer
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
