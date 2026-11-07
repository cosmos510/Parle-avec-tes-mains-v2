"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const letters = [
  { letter: "A", description: "Poing fermé, pouce sur le côté" },
  { letter: "B", description: "Main plate, doigts serrés" },
  { letter: "C", description: "Main en forme de C" },
  { letter: "Y", description: "Pouce et auriculaire tendus" },
];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % letters.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen px-4 py-20 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Title - Large tile spanning 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] mb-6">
              Parle avec
              <br />
              tes mains.
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-md mb-8">
              Apprends la langue des signes française avec ta webcam. 
              Reconnaissance en temps réel.
            </p>
            <Link 
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-white/90 transition-colors"
            >
              Commencer gratuitement
              <span>→</span>
            </Link>
          </motion.div>

          {/* Animated Letter Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30 flex flex-col items-center justify-center min-h-[280px]"
          >
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-8xl md:text-9xl font-bold text-blue-600 dark:text-blue-400"
            >
              {letters[currentIndex].letter}
            </motion.span>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {letters[currentIndex].description}
            </p>
            {/* Progress dots */}
            <div className="flex items-center gap-2 mt-4">
              {letters.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex 
                      ? "bg-blue-600 w-6" 
                      : "bg-blue-300 dark:bg-blue-700 w-2"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Stats tiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">26</p>
            <p className="text-muted-foreground mt-1">lettres à maîtriser</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">~15</p>
            <p className="text-muted-foreground mt-1">minutes pour débuter</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">100%</p>
            <p className="text-muted-foreground mt-1">gratuit et privé</p>
          </motion.div>

          {/* Features - wide tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Temps réel
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 text-sm font-medium">
                🎯 Sans inscription
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 text-sm font-medium">
                🔒 Données locales
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-blue-900/50 text-sm font-medium">
                📱 Fonctionne hors ligne
              </span>
            </div>
          </motion.div>

          {/* Tech stack tile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/30"
          >
            <p className="text-sm text-muted-foreground mb-2">Propulsé par</p>
            <p className="font-semibold">MediaPipe + ONNX</p>
            <p className="text-sm text-muted-foreground mt-1">~30ms de latence</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
