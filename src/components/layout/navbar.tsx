"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PLAY_MENU = [
  { href: "/practice", label: "Pratique libre", icon: "✋" },
  { href: "/sprint", label: "Sprint A→Z", icon: "⚡" },
  { href: "/challenge", label: "Défie un ami", icon: "🎯" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md" 
          : ""
      }`}
      role="banner"
    >
      <nav 
        className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between"
        aria-label="Navigation principale"
      >
        <Link 
          href="/" 
          className="font-bold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
          aria-label="Parle avec tes mains - Accueil"
        >
          Parle avec tes mains
        </Link>

        <div className="flex items-center gap-4 sm:gap-6" role="group" aria-label="Liens de navigation">
          <a
            href="https://github.com/cosmos510/parle-avec-tes-mains-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
            aria-label="Voir le code source sur GitHub (s'ouvre dans un nouvel onglet)"
          >
            GitHub
          </a>
          
          {!loading && (
            user ? (
              <Link 
                href="/profile"
                className="text-sm font-medium px-4 py-2 rounded-full border-2 border-neutral-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                aria-label="Mon profil"
              >
                {user.displayName?.split(' ')[0] || 'Profil'}
              </Link>
            ) : (
              <Link 
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-full border-2 border-neutral-200 dark:border-neutral-800 hover:border-orange-500 dark:hover:border-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                aria-label="Se connecter"
              >
                Connexion
              </Link>
            )
          )}
          
          {/* Play menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-sm font-medium px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 flex items-center gap-1"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              Jouer
              <svg 
                className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
                {PLAY_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
