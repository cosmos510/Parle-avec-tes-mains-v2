"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const GAME_MODES = [
  {
    id: "practice",
    title: "Pratique libre",
    description: "Apprends à ton rythme. Choisis une lettre et entraîne-toi jusqu'à la maîtriser.",
    icon: "✋",
    color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    href: "/practice",
    cta: "S'entraîner",
  },
  {
    id: "sprint",
    title: "Sprint A→Z",
    description: "Signe les 26 lettres le plus vite possible. Bats ton record et grimpe au classement.",
    icon: "⚡",
    color: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    href: "/sprint",
    cta: "Lancer un sprint",
    badge: "Populaire",
  },
  {
    id: "challenge",
    title: "Défie un ami",
    description: "Signe un mot et partage ton temps. Tes amis pourront essayer de te battre.",
    icon: "🎯",
    color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    href: "/challenge",
    cta: "Créer un défi",
    badge: "Nouveau",
  },
];

export function GameModesSection() {
  return (
    <section className="py-20 px-4" id="modes">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Choisis ton mode de jeu
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Que tu veuilles apprendre tranquillement ou te mesurer aux autres, 
            il y a un mode pour toi.
          </p>
        </div>

        {/* Game modes grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {GAME_MODES.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={mode.href}
                className={`block h-full p-6 rounded-2xl border-2 ${mode.color} hover:scale-[1.02] transition-transform group`}
              >
                {/* Badge */}
                {mode.badge && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500 text-white mb-3">
                    {mode.badge}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl ${mode.iconBg} flex items-center justify-center text-2xl mb-4`}>
                  {mode.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                <p className="text-sm text-neutral-500 mb-4">{mode.description}</p>

                {/* CTA */}
                <span className="inline-flex items-center text-sm font-semibold group-hover:gap-2 transition-all">
                  {mode.cta}
                  <svg 
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard link */}
        <div className="text-center mt-8">
          <Link 
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <span>🏆</span>
            <span className="text-sm font-medium">Voir le classement général</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
