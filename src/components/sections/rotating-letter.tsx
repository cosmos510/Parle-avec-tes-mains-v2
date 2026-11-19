"use client";

import { useState, useEffect } from "react";

const letters = ["A", "B", "C", "Y", "L", "V"];

export function RotatingLetter() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % letters.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-block ml-3 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-orange-500"
      aria-live="polite"
      aria-atomic="true"
    >
      {letters[currentIndex]}
    </span>
  );
}
