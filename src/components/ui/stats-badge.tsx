"use client";

interface StatsBadgeProps {
  label: string;
  value: string | number;
  variant?: "default" | "accent";
}

/**
 * Badge de stat simple et sobre
 */
export function StatsBadge({ label, value, variant = "default" }: StatsBadgeProps) {
  return (
    <div className={`px-3 py-1.5 rounded-full text-sm ${
      variant === "accent" 
        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
    }`}>
      <span className="font-medium">{value}</span>
      <span className="ml-1 opacity-70">{label}</span>
    </div>
  );
}

interface StatsRowProps {
  children: React.ReactNode;
}

export function StatsRow({ children }: StatsRowProps) {
  return (
    <div className="flex items-center gap-2">
      {children}
    </div>
  );
}
