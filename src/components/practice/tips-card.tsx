"use client";

import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

const TIPS = [
  { icon: "💡", text: "Bonne lumière sur votre main" },
  { icon: "🖐️", text: "Main bien visible, fond uni" },
  { icon: "⏱️", text: "Maintenez le signe 1-2 secondes" },
];

/**
 * Carte de conseils pour une meilleure détection
 */
export function TipsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
      role="complementary"
      aria-labelledby="tips-title"
    >
      <h3 id="tips-title" className="font-semibold mb-3 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
        Conseils
      </h3>
      <ul className="text-sm text-muted-foreground space-y-2" aria-label="Liste de conseils">
        {TIPS.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-primary" aria-hidden="true">{tip.icon}</span>
            {tip.text}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
