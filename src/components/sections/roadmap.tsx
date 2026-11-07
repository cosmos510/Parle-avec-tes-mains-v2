"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export function RoadmapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 px-4 overflow-hidden" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Big typography header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[0.9]">
            On commence
            <br />
            <span className="text-muted-foreground/40">par les bases.</span>
          </h2>
        </motion.div>

        {/* Main CTA - The alphabet */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/practice" className="group block">
            <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/30 overflow-hidden">
              {/* Background letter that changes on hover */}
              <div className="absolute -right-10 -bottom-20 text-[20rem] font-bold leading-none text-blue-500/10 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                A
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Niveau 1
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                    Prêt à jouer
                  </span>
                </div>
                
                <h3 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
                  L&apos;alphabet LSF
                </h3>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  26 lettres. C&apos;est tout ce qu&apos;il faut pour épeler n&apos;importe quel mot 
                  et commencer à communiquer.
                </p>

                {/* Progress teaser */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="flex -space-x-1">
                    {["A", "B", "C", "D", "E"].map((letter) => (
                      <div 
                        key={letter}
                        className="w-8 h-8 rounded-full bg-white dark:bg-foreground/10 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400"
                      >
                        {letter}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-foreground/10 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +21
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ~15 min pour débloquer les bases
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-medium transition-all group-hover:gap-3 group-hover:px-7 group-hover:bg-blue-700">
                    Commencer le niveau
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Coming soon levels - more playful */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 grid sm:grid-cols-3 gap-4"
        >
          {[
            { level: 2, title: "Chiffres", desc: "0 → 100", locked: true },
            { level: 3, title: "Mots courants", desc: "50 essentiels", locked: true },
            { level: 4, title: "Phrases", desc: "Conversations", locked: true },
          ].map((item) => (
            <motion.div 
              key={item.level}
              whileHover={{ y: -2 }}
              className="group p-6 rounded-2xl border border-dashed border-border hover:border-muted-foreground/30 transition-colors cursor-not-allowed"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground/60">Niveau {item.level}</span>
                <span className="text-lg opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
              </div>
              <p className="font-medium text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Fun message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground/50 mt-8"
        >
          Finis l&apos;alphabet pour débloquer la suite
        </motion.p>
      </div>
    </section>
  );
}
