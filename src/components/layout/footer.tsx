"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Parle avec tes mains
            </Link>
            <span className="text-border">·</span>
            <span>2026</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://github.com/cosmos510/FingerspellToSign"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/maxime-martin-090731aa/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:maximemartin510@gmail.com"
              className="hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
