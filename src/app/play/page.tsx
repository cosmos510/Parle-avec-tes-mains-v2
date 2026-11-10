"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const GAME_MODES = [
  {
    href: "/practice",
    title: "Pratique libre",
    description: "Apprends les 26 lettres à ton rythme. Pas de timer, pas de pression.",
    tag: "Débutant",
  },
  {
    href: "/sprint",
    title: "Sprint A→Z",
    description: "Signe l'alphabet complet le plus vite possible. Bats ton record.",
    tag: "Chrono",
  },
  {
    href: "/duel",
    title: "Duel en temps réel",
    description: "Affronte un ami en direct. Le premier à signer le mot gagne.",
    tag: "Nouveau",
    highlight: true,
  },
  {
    href: "/challenge",
    title: "Défie un ami",
    description: "Envoie un défi et compare vos scores. Qui signe le plus vite ?",
    tag: "Async",
  },
  {
    href: "/leaderboard",
    title: "Classement",
    description: "Les meilleurs temps de la communauté. Trouve ta place.",
    tag: "Compétition",
  },
];

export default function PlayHub() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              Jouer
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Choisis ton mode et progresse à ta façon.
            </p>
          </motion.div>

          {/* Game modes list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {GAME_MODES.map((mode, index) => (
              <motion.div
                key={mode.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  href={mode.href}
                  className={`group block p-6 rounded-2xl border transition-all hover:shadow-lg ${
                    mode.highlight 
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" 
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                          {mode.title}
                        </h2>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          mode.highlight 
                            ? "bg-orange-500 text-white" 
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}>
                          {mode.tag}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        {mode.description}
                      </p>
                    </div>
                    <svg
                      className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800"
          >
            <Link
              href="/profile"
              className="flex items-center justify-between group"
            >
              <div>
                <p className="font-medium group-hover:text-orange-500 transition-colors">
                  Voir mes statistiques
                </p>
                <p className="text-sm text-neutral-500">
                  Progression, badges, historique
                </p>
              </div>
              <svg
                className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
