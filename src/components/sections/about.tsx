"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
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
            Comment ça marche
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Big stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          >
            <p className="text-6xl sm:text-7xl font-bold">70M</p>
            <p className="text-white/70 mt-2">
              personnes communiquent en langue des signes dans le monde
            </p>
          </motion.div>

          {/* How it works - spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <h3 className="text-xl font-semibold mb-4">La magie derrière</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 font-medium">
                📷 Ta webcam
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 font-medium">
                🖐️ MediaPipe détecte 21 points
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 font-medium">
                🧠 ONNX prédit la lettre
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 font-medium">
                ✨ Feedback instantané
              </span>
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              Tout se passe dans ton navigateur. Aucune donnée n&apos;est envoyée à un serveur.
            </p>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold mb-1">100% privé</h3>
            <p className="text-sm text-muted-foreground">
              Pas de compte, pas de tracking, pas de données envoyées
            </p>
          </motion.div>

          {/* Open source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-semibold mb-1">Open source</h3>
            <p className="text-sm text-muted-foreground">
              Code sur{" "}
              <a 
                href="https://github.com/cosmos510/parle-avec-tes-mains-v2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </p>
          </motion.div>

          {/* Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-1">Ultra rapide</h3>
            <p className="text-sm text-muted-foreground">
              ~30ms de latence, feedback en temps réel
            </p>
          </motion.div>

        </div>

        {/* Made by */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Créé par quelqu&apos;un qui voulait juste apprendre à signer ✌️
        </motion.p>
      </div>
    </section>
  );
}
