"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDuelInvites } from "@/hooks/useDuelInvites";
import { Users } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading } = useAuth();
  const { hasInvites } = useDuelInvites();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
          
          {!loading && user && (
            <Link 
              href="/friends"
              className="relative text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded p-2"
              aria-label="Amis"
            >
              <Users className="w-5 h-5" />
              {hasInvites && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>
          )}
          
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
          
          {/* Play button - direct link to hub */}
          <Link
            href="/play"
            className="text-sm font-medium px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            Jouer
          </Link>
        </div>
      </nav>
    </header>
  );
}
