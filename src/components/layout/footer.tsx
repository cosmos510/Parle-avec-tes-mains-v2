"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Parle avec tes mains
            </Link>
            <span>·</span>
            <span>2024</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <a
              href="https://github.com/cosmos510/parle-avec-tes-mains-v2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/maxime-martin-090731aa/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
