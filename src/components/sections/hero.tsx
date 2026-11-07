"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
    <section className="min-h-[90vh] flex flex-col justify-center px-4 py-20">
      <div className="max-w-5xl mx-auto w-full">
        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
            Parle avec
            <br />
            tes mains.
          </h1>
        </motion.div>

        {/* Subtitle + CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 grid sm:grid-cols-2 gap-8 items-end"
        >
          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-md">
            Apprends la langue des signes française avec ta webcam. 
            L&apos;app reconnaît tes gestes en temps réel.
          </p>

          <div className="flex flex-col sm:items-end gap-4">
            <Link href="/practice">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white group">
                <span>Commencer</span>
                <motion.span 
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Gratuit · Sans inscription · Fonctionne hors ligne
            </p>
          </div>
        </motion.div>

        {/* Visual: Animated letter showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 sm:mt-28"
        >
          <div className="relative rounded-3xl border border-border bg-muted/30 overflow-hidden">
            <div className="grid sm:grid-cols-2">
              {/* Left: Big animated letter */}
              <div className="flex items-center justify-center py-16 sm:py-24">
                <div className="relative">
                  <motion.span
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-[12rem] sm:text-[16rem] font-bold text-foreground leading-none select-none"
                  >
                    {letters[currentIndex].letter}
                  </motion.span>
                  
                  {/* Subtle ring decoration */}
                  <div className="absolute -inset-8 border border-foreground/10 rounded-full" />
                  <div className="absolute -inset-16 border border-foreground/5 rounded-full" />
                </div>
              </div>

              {/* Right: Info panel */}
              <div className="flex flex-col justify-center p-8 sm:p-12 bg-muted/50">
                <div className="space-y-6">
                  {/* Current letter info */}
                  <div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                      Lettre en cours
                    </p>
                    <motion.p
                      key={currentIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-foreground text-lg"
                    >
                      {letters[currentIndex].description}
                    </motion.p>
                  </div>

                  {/* Progress dots */}
                  <div className="flex items-center gap-2">
                    {letters.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === currentIndex 
                            ? "bg-blue-600 w-8" 
                            : "bg-foreground/20 w-2 hover:bg-foreground/40"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-3xl font-bold text-foreground">26</p>
                        <p className="text-muted-foreground text-sm">lettres</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-foreground">~15</p>
                        <p className="text-muted-foreground text-sm">minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
