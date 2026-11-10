"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { GameHeader } from "@/components/game";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  isCurrentUser?: boolean;
}

type LeaderboardType = "xp" | "sprint" | "streak";

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("xp");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        let data: LeaderboardEntry[] = [];

        if (activeTab === "xp") {
          const q = query(collection(db, "users"), orderBy("totalXp", "desc"), limit(20));
          const snapshot = await getDocs(q);
          let rank = 1;
          snapshot.forEach((doc) => {
            const d = doc.data();
            if (d.totalXp > 0) {
              data.push({
                rank: rank++,
                displayName: d.displayName || "Anonyme",
                score: d.totalXp || 0,
                isCurrentUser: user?.uid === doc.id,
              });
            }
          });
        } else if (activeTab === "sprint") {
          const q = query(collection(db, "sprintRecords"), orderBy("bestTime", "asc"), limit(20));
          const snapshot = await getDocs(q);
          let rank = 1;
          snapshot.forEach((doc) => {
            const d = doc.data();
            data.push({
              rank: rank++,
              displayName: d.displayName || "Anonyme",
              score: d.bestTime || 0,
              isCurrentUser: user?.uid === doc.id,
            });
          });
        } else if (activeTab === "streak") {
          const q = query(collection(db, "users"), orderBy("longestStreak", "desc"), limit(20));
          const snapshot = await getDocs(q);
          let rank = 1;
          snapshot.forEach((doc) => {
            const d = doc.data();
            if (d.longestStreak > 0) {
              data.push({
                rank: rank++,
                displayName: d.displayName || "Anonyme",
                score: d.longestStreak || 0,
                isCurrentUser: user?.uid === doc.id,
              });
            }
          });
        }

        setEntries(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [activeTab, user]);

  const formatScore = (score: number, type: LeaderboardType) => {
    if (type === "sprint") {
      const seconds = Math.floor(score / 1000);
      const ms = Math.floor((score % 1000) / 10);
      return `${seconds}.${ms.toString().padStart(2, "0")}`;
    }
    return score.toString();
  };

  const getUnit = (type: LeaderboardType) => {
    if (type === "sprint") return "s";
    if (type === "streak") return "j";
    return "xp";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <GameHeader title="Classement" />

      <main className="pt-24 pb-20 px-4" role="main" aria-labelledby="leaderboard-heading">
        <div className="max-w-2xl mx-auto">
          {/* Intro */}
          <h1 id="leaderboard-heading" className="sr-only">Classement</h1>
          <p className="text-neutral-500 mb-10">
            Les meilleurs signeurs de la communauté.
          </p>

          {/* Tabs */}
          <div 
            className="flex gap-6 mb-10 border-b border-neutral-200 dark:border-neutral-800"
            role="tablist"
            aria-label="Catégories de classement"
          >
            {[
              { id: "xp" as const, label: "XP Total" },
              { id: "sprint" as const, label: "Sprint" },
              { id: "streak" as const, label: "Série" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
                  activeTab === tab.id
                    ? "text-neutral-900 dark:text-white"
                    : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-20 text-center text-neutral-400" role="status" aria-live="polite" aria-busy="true">
              <span className="sr-only">Chargement en cours</span>
              Chargement...
            </div>
          )}

          {/* Empty */}
          {!loading && entries.length === 0 && (
            <div className="py-20 text-center" role="status">
              <p className="text-neutral-400 mb-4">Aucun score pour le moment.</p>
              <Link href="/practice" className="text-orange-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded">
                Sois le premier →
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && entries.length > 0 && (
            <div 
              className="space-y-1"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              <ol aria-label={`Classement ${activeTab === "xp" ? "XP Total" : activeTab === "sprint" ? "Sprint" : "Série"}`}>
                {entries.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.displayName}`}
                    className={`flex items-center justify-between py-4 ${
                      entry.rank < entries.length ? "border-b border-neutral-100 dark:border-neutral-900" : ""
                    } ${entry.isCurrentUser ? "bg-orange-50 dark:bg-orange-950/20 -mx-4 px-4 rounded-lg" : ""}`}
                    aria-current={entry.isCurrentUser ? "true" : undefined}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className={`w-8 text-right font-mono text-sm ${
                          entry.rank <= 3 ? "font-bold" : "text-neutral-400"
                        }`}
                        aria-label={`Position ${entry.rank}`}
                      >
                        {entry.rank}
                      </span>
                      <span className={`font-medium ${entry.isCurrentUser ? "text-orange-500" : ""}`}>
                        {entry.displayName}
                        {entry.isCurrentUser && <span className="sr-only"> (vous)</span>}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-lg">
                        {formatScore(entry.score, activeTab)}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {getUnit(activeTab)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 flex flex-wrap gap-4" role="group" aria-label="Actions">
            <Link
              href="/practice"
              className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Pratiquer
            </Link>
            <Link
              href="/sprint"
              className="px-6 py-3 rounded-full font-semibold text-sm border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Mode Sprint
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
