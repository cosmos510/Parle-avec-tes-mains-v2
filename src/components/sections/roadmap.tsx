"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export function RoadmapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
            Ton parcours
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Commence par les bases, progresse à ton rythme
          </p>
        </motion.div>

        {/* Bento grid for levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Level 1 - Main CTA - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-2"
          >
            <Link href="/practice" className="group block h-full">
              <div className="h-full p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute -right-10 -bottom-10 text-[15rem] font-bold leading-none text-white/10 select-none pointer-events-none">
                  A
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
                      Niveau 1
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-400/20 text-green-300 text-xs font-medium">
                      Disponible
                    </span>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-bold mb-3">
                    L&apos;alphabet LSF
                  </h3>
                  
                  <p className="text-white/70 mb-6 max-w-sm">
                    26 lettres pour épeler n&apos;importe quel mot et commencer à communiquer.
                  </p>

                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-blue-600 font-semibold w-fit group-hover:gap-3 transition-all">
                    Commencer
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Progress preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <p className="text-sm text-muted-foreground mb-4">Lettres à débloquer</p>
            <div className="flex flex-wrap gap-2">
              {["A", "B", "C", "D", "E", "F"].map((letter) => (
                <div 
                  key={letter}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400"
                >
                  {letter}
                </div>
              ))}
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm text-muted-foreground">
                +20
              </div>
            </div>
          </motion.div>

          {/* Coming soon levels */}
          {[
            { level: 2, title: "Chiffres", desc: "0 à 100" },
            { level: 3, title: "Mots courants", desc: "50 essentiels" },
            { level: 4, title: "Phrases", desc: "Conversations" },
          ].map((item, i) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 border border-gray-200/50 dark:border-gray-700/30 opacity-60"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Niveau {item.level}
                </span>
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}
