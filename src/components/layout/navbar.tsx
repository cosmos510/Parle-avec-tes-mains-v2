"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          ? "bg-background/80 backdrop-blur-md border-b border-border" 
          : ""
      }`}
    >
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - just text */}
        <Link href="/" className="font-semibold text-lg tracking-tight">
          Parle avec tes mains
        </Link>

        {/* Right section - minimal */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/cosmos510/FingerspellToSign"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            GitHub
          </a>
          
          <Link 
            href="/practice"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pratiquer →
          </Link>
        </div>
      </nav>
    </header>
  );
}
