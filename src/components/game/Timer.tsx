"use client";

interface TimerProps {
  timeMs: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Formatage et affichage du temps.
 */
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${seconds}.${milliseconds.toString().padStart(2, "0")}s`;
}

export function Timer({ timeMs, size = "md", className = "" }: TimerProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-6xl",
  };

  return (
    <p className={`font-mono font-bold ${sizeClasses[size]} ${className}`}>
      {formatTime(timeMs)}
    </p>
  );
}

export { formatTime };
