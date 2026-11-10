"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const letters = ["A", "B", "C", "Y", "L", "V"];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % letters.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="min-h-screen flex flex-col justify-center px-4 py-20"
      aria-labelledby="hero-heading"
    >
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Main headline */}
        <div className={`mb-8 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <h1 
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]"
          >
            Apprends à signer
            <br />
            <span className="inline-flex items-baseline">
              la lettre{" "}
              <span
                key={currentIndex}
                className="inline-block ml-3 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-orange-500 animate-fade-in"
                aria-live="polite"
                aria-atomic="true"
              >
                {letters[currentIndex]}
              </span>
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className={`text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 max-w-xl mb-10 transition-opacity duration-500 delay-100 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        >
          Ta webcam + un peu de pratique = tu sais signer l&apos;alphabet LSF. 
          Gratuit, sans compte, 100% dans ton navigateur.
        </p>

        {/* CTA */}
        <div
          className={`flex flex-wrap items-center gap-4 transition-opacity duration-500 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          role="group"
          aria-label="Actions principales"
        >
          <Link 
            href="/practice"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-lg hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            aria-label="Commencer à pratiquer la langue des signes"
          >
            C&apos;est parti
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <span className="text-sm text-neutral-500" aria-label="Temps estimé">
            ~15 min pour maîtriser les bases
          </span>
        </div>

        {/* Visual hint */}
        <div
          className={`mt-20 flex items-center gap-6 transition-opacity duration-500 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Aperçu des lettres disponibles"
          role="presentation"
        >
          <div 
            className="flex -space-x-2"
            role="list"
            aria-label="Premières lettres de l'alphabet"
          >
            {["A", "B", "C", "D", "E"].map((l) => (
              <div
                key={l}
                className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 flex items-center justify-center font-bold text-lg"
                role="listitem"
                aria-label={`Lettre ${l}`}
              >
                {l}
              </div>
            ))}
          </div>
          <p className="text-neutral-500 text-sm">
            26 lettres à débloquer
          </p>
        </div>

      </div>
    </section>
  );
}
