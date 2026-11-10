"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function GameModesSection() {
  return (
    <section 
      className="py-24 px-4 bg-neutral-50 dark:bg-neutral-900/50" 
      id="modes"
      aria-labelledby="modes-heading"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 
            id="modes-heading"
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          >
            Plusieurs façons de progresser
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto mb-8">
            Pratique libre, sprint chronométré, défis entre amis. 
            Choisis ton style et améliore-toi.
          </p>
          
          <Link
            href="/play"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-lg hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label="Découvrir tous les modes de jeu"
          >
            Découvrir les modes
            <svg 
              className="w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
