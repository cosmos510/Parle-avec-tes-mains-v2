"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export function RoadmapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section 
      className="py-24 px-4" 
      ref={ref}
      id="roadmap"
      aria-labelledby="roadmap-heading"
    >
      <div className="max-w-4xl mx-auto">
        
        {/* Section title */}
        <motion.h2
          id="roadmap-heading"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-black mb-16"
        >
          Par où commencer ?
        </motion.h2>

        {/* Level 1 - Available */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Link 
            href="/practice" 
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-2xl"
            aria-label="Commencer le module Alphabet LSF - 26 lettres à apprendre"
          >
            <article className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span 
                    className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium mb-3"
                    role="status"
                  >
                    Disponible maintenant
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    L&apos;alphabet LSF
                  </h3>
                </div>
                <span className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-lg">
                Tout commence par là. Une fois que tu connais les 26 lettres, 
                tu peux épeler n&apos;importe quel mot et te faire comprendre.
              </p>
              <div 
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="Lettres disponibles dans ce module"
              >
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((l) => (
                  <span
                    key={l}
                    className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-semibold"
                    role="listitem"
                    aria-label={`Lettre ${l}`}
                  >
                    {l}
                  </span>
                ))}
                <span 
                  className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-neutral-500"
                  role="listitem"
                  aria-label="Et 18 autres lettres"
                >
                  +18
                </span>
              </div>
            </article>
          </Link>
        </motion.div>

        {/* Sprint Mode - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <Link 
            href="/sprint" 
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-2xl"
            aria-label="Mode Sprint - Signe l'alphabet le plus vite possible"
          >
            <article className="p-8 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span 
                    className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium mb-3"
                    role="status"
                  >
                    Nouveau
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    Sprint Alphabet
                  </h3>
                </div>
                <span className="text-4xl opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                  →
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-lg">
                Tu connais l&apos;alphabet ? Prouve-le. Enchaîne les 26 lettres 
                le plus vite possible et compare ton temps avec les autres.
              </p>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span>Classement</span>
                <span>Chrono</span>
                <span>Partage</span>
              </div>
            </article>
          </Link>
        </motion.div>

        {/* Coming soon levels */}
        <div 
          className="grid sm:grid-cols-3 gap-4"
          role="list"
          aria-label="Modules à venir"
        >
          {[
            { title: "Les chiffres", desc: "0 → 100" },
            { title: "Mots courants", desc: "50 essentiels" },
            { title: "Conversations", desc: "Phrases du quotidien" },
          ].map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="p-5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 opacity-50"
              role="listitem"
              aria-label={`${item.title} - ${item.desc} - Bientôt disponible`}
            >
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
              <p className="text-xs text-neutral-400 mt-3" aria-hidden="true">Bientôt disponible</p>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
