"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer 
      className="py-12 px-4 border-t border-neutral-200 dark:border-neutral-800"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link 
              href="/" 
              className="hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded"
              aria-label="Retour à l'accueil"
            >
              Parle avec tes mains
            </Link>
            <span aria-hidden="true">·</span>
            <span>2024</span>
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
      </div>
    </footer>
  );
}
