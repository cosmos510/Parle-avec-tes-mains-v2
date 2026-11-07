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
          ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md" 
          : ""
      }`}
    >
      <nav className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Parle avec tes mains
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/cosmos510/parle-avec-tes-mains-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors hidden sm:block"
          >
            GitHub
          </a>
          
          <Link 
            href="/practice"
            className="text-sm font-medium px-4 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-80 transition-opacity"
          >
            Pratiquer
          </Link>
        </div>
      </nav>
    </header>
  );
}
