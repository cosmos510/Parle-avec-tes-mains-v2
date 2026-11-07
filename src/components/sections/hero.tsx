"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

const letters = ["A", "B", "C", "Y", "L", "V"];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % letters.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Main headline - typographie audacieuse */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
            Apprends à signer
            <br />
            <span className="inline-flex items-baseline">
              la lettre{" "}
              <motion.span
                key={currentIndex}
                initial={{ opacity: 0, y: 20, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="inline-block ml-3 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-orange-500"
              >
                {letters[currentIndex]}
              </motion.span>
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-xl mb-10"
        >
          Ta webcam + un peu de pratique = tu sais signer l&apos;alphabet LSF. 
          Gratuit, sans compte, 100% dans ton navigateur.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link 
            href="/practice"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-lg hover:scale-105 transition-transform"
          >
            C&apos;est parti
            <span className="text-xl">👋</span>
          </Link>
          
          <span className="text-sm text-neutral-500">
            ~15 min pour maîtriser les bases
          </span>
        </motion.div>

        {/* Visual hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex items-center gap-6"
        >
          <div className="flex -space-x-2">
            {["A", "B", "C", "D", "E"].map((l, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center font-bold text-lg"
              >
                {l}
              </motion.div>
            ))}
          </div>
          <p className="text-neutral-500 text-sm">
            26 lettres à débloquer
          </p>
        </motion.div>

      </div>
    </section>
  );
}
