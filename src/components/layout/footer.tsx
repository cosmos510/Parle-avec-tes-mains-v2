"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Footer() {
  const [year, setYear] = useState("2024");
  
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer 
      className="py-12 px-4 border-t border-neutral-200 dark:border-neutral-800"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link 
              href="/" 
              className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
              aria-label="Retour à l'accueil"
            >
              Parle avec tes mains
            </Link>
            <span aria-hidden="true">·</span>
            <span>{year}</span>
          </div>

          <nav aria-label="Liens externes">
            <ul className="flex items-center gap-6 text-sm text-neutral-500" role="list">
              <li>
                <a
                  href="https://github.com/cosmos510/parle-avec-tes-mains-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
                  aria-label="GitHub - Code source du projet (s'ouvre dans un nouvel onglet)"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/maxime-martin-090731aa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
                  aria-label="LinkedIn - Profil du créateur (s'ouvre dans un nouvel onglet)"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Legal links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-neutral-400">
          <a
            href="https://www.webamax.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
          >
            Un site Webamax
          </a>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <Link 
            href="/mentions-legales"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
          >
            Mentions légales
          </Link>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <Link 
            href="/rgpd"
            className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
          >
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
